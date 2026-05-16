<?php
// Archivo: /controllers/VehiculoController.php
require_once '../config/Database.php';
require_once '../models/Vehiculo.php';

class VehiculoController {
    private $db;
    private $vehiculo;

    public function __construct() {
        // Envolver la conexión a la base de datos para tolerancia a fallos principal
        try {
            $database = new Database();
            $this->db = $database->getConnection();
            $this->vehiculo = new Vehiculo($this->db);
        } catch (Exception $e) {
            $this->jsonResponse(['error' => 'Fallo de conexión a la base de datos'], 500);
        }
    }

    /**
     * Helper para responder en JSON.
     */
    private function jsonResponse(array $payload, int $statusCode = 200): void {
        http_response_code($statusCode);
        echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Decodifica el cuerpo de la petición.
     */
    private function getRequestBody(): array {
        $body = file_get_contents('php://input');
        $data = json_decode($body, true);
        return is_array($data) ? $data : [];
    }

    /**
     * Enrutador del controlador, intercepta posibles errores no catcheados.
     */
    public function processRequest($method) {
        try {
            switch ($method) {
                case 'GET':
                    if (isset($_GET['id']) && is_numeric($_GET['id'])) {
                        $this->getVehiculo((int) $_GET['id']);
                    } else {
                        $this->getAllVehiculos();
                    }
                    break;
                case 'POST':
                    $this->createVehiculo();
                    break;
                case 'PUT':
                    $this->updateVehiculo();
                    break;
                case 'DELETE':
                    $this->deleteVehiculo();
                    break;
                default:
                    $this->jsonResponse(['error' => 'Método HTTP no permitido'], 405);
                    break;
            }
        } catch (Exception $e) {
            // Tolerancia a fallos: cualquier error general se previene y notifica controladamente
            error_log("Fallo crítico en VehiculoController: " . $e->getMessage());
            $this->jsonResponse(['error' => 'Error interno del servidor en procesamiento de vehículos'], 500);
        }
    }

    /**
     * Obtiene todos los vehículos
     */
    private function getAllVehiculos() {
        $stmt = $this->vehiculo->getAll();
        if ($stmt === null) {
            $this->jsonResponse(['error' => 'No se pudo obtener la lista de vehículos'], 500);
        }

        $vehiculos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $this->jsonResponse($vehiculos, 200);
    }

    /**
     * Obtiene un vehículo específico
     */
    private function getVehiculo(int $id) {
        $vehiculo = $this->vehiculo->getById($id);

        if ($vehiculo === false) {
            $this->jsonResponse(['error' => 'Fallo al buscar el vehículo'], 500);
        }

        if (!$vehiculo) {
            $this->jsonResponse(['error' => 'Vehículo no encontrado'], 404);
        }

        $this->jsonResponse($vehiculo, 200);
    }

    /**
     * Crea un vehículo nuevo con validación
     */
    private function createVehiculo() {
        $request = $this->getRequestBody();
        
        $placa = trim((string) ($request['placa'] ?? ''));
        $marca = trim((string) ($request['marca'] ?? ''));
        $modelo = trim((string) ($request['modelo'] ?? ''));
        $anio = isset($request['anio']) && is_numeric($request['anio']) ? (int)$request['anio'] : null;
        $color = isset($request['color']) ? trim((string)$request['color']) : null;
        $kilometraje = isset($request['kilometraje']) && is_numeric($request['kilometraje']) ? (int)$request['kilometraje'] : 0;
        $id_cliente = isset($request['id_cliente']) && is_numeric($request['id_cliente']) ? (int)$request['id_cliente'] : null;

        if ($placa === '' || $marca === '' || $modelo === '' || !$id_cliente) {
            $this->jsonResponse(['error' => 'Placa, marca, modelo y id_cliente son obligatorios'], 400);
        }

        $newId = $this->vehiculo->create($placa, $marca, $modelo, $anio, $color, $kilometraje, $id_cliente);

        if (!$newId) {
            $this->jsonResponse(['error' => 'No se pudo crear el vehículo, puede que la placa ya exista o fallo de constraint'], 500);
        }

        $this->jsonResponse(['message' => 'Vehículo creado correctamente', 'id_vehiculo' => $newId], 201);
    }

    /**
     * Actualiza un vehículo
     */
    private function updateVehiculo() {
        $request = $this->getRequestBody();
        $id = isset($_GET['id']) && is_numeric($_GET['id']) ? (int) $_GET['id'] : null;

        if (!$id) {
            $this->jsonResponse(['error' => 'ID de vehículo inválido'], 400);
        }

        $vehiculo = $this->vehiculo->getById($id);
        if (!$vehiculo) {
            $this->jsonResponse(['error' => 'Vehículo no encontrado o error de lectura'], 400); // Se responde 400 o 404
        }

        $placa = trim((string) ($request['placa'] ?? $vehiculo['placa']));
        $marca = trim((string) ($request['marca'] ?? $vehiculo['marca']));
        $modelo = trim((string) ($request['modelo'] ?? $vehiculo['modelo']));
        $anio = isset($request['anio']) && is_numeric($request['anio']) ? (int)$request['anio'] : $vehiculo['anio'];
        $color = isset($request['color']) ? trim((string)$request['color']) : $vehiculo['color'];
        $kilometraje = isset($request['kilometraje']) && is_numeric($request['kilometraje']) ? (int)$request['kilometraje'] : $vehiculo['kilometraje'];
        $id_cliente = isset($request['id_cliente']) && is_numeric($request['id_cliente']) ? (int)$request['id_cliente'] : $vehiculo['id_cliente'];

        if ($placa === '' || $marca === '' || $modelo === '' || !$id_cliente) {
            $this->jsonResponse(['error' => 'Placa, marca, modelo y id_cliente son obligatorios'], 400);
        }

        $success = $this->vehiculo->update($id, $placa, $marca, $modelo, $anio, $color, $kilometraje, $id_cliente);

        if (!$success) {
            $this->jsonResponse(['error' => 'No se pudo actualizar el vehículo. ¿Cambio de placa repetido?'], 500);
        }

        $this->jsonResponse(['message' => 'Vehículo actualizado correctamente'], 200);
    }

    /**
     * Elimina un vehículo
     */
    private function deleteVehiculo() {
        $id = isset($_GET['id']) && is_numeric($_GET['id']) ? (int) $_GET['id'] : null;

        if (!$id) {
            $this->jsonResponse(['error' => 'ID de vehículo inválido'], 400);
        }

        $vehiculo = $this->vehiculo->getById($id);
        if (!$vehiculo) {
            $this->jsonResponse(['error' => 'Vehículo no encontrado'], 404);
        }

        $success = $this->vehiculo->delete($id);
        if (!$success) {
            $this->jsonResponse(['error' => 'No se pudo eliminar el vehículo. Problemas de integridad relacional o base de datos'], 500);
        }

        $this->jsonResponse(['message' => 'Vehículo eliminado correctamente'], 200);
    }
}