<?php
// Archivo: /controllers/RepuestoController.php
require_once '../config/Database.php';
require_once '../models/Repuesto.php';

class RepuestoController {
    private $db;
    private $repuesto;

    public function __construct() {
        try {
            $database = new Database();
            $this->db = $database->getConnection();
            $this->repuesto = new Repuesto($this->db);
        } catch (Exception $e) {
            $this->jsonResponse(['error' => 'Fallo de conexión a la base de datos'], 500);
        }
    }

    private function jsonResponse(array $payload, int $statusCode = 200): void {
        http_response_code($statusCode);
        echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    private function getRequestBody(): array {
        $body = file_get_contents('php://input');
        $data = json_decode($body, true);
        return is_array($data) ? $data : [];
    }

    public function processRequest($method) {
        try {
            switch ($method) {
                case 'GET':
                    if (isset($_GET['id']) && is_numeric($_GET['id'])) {
                        $this->getRepuesto((int) $_GET['id']);
                    } elseif (isset($_GET['low_stock'])) {
                        $this->getLowStockRepuestos();
                    } else {
                        $this->getAllRepuestos();
                    }
                    break;
                case 'POST':
                    $this->createRepuesto();
                    break;
                case 'PUT':
                    $this->updateRepuesto();
                    break;
                case 'DELETE':
                    $this->deleteRepuesto();
                    break;
                default:
                    $this->jsonResponse(['error' => 'Método HTTP no permitido'], 405);
                    break;
            }
        } catch (Exception $e) {
            error_log("Fallo crítico en RepuestoController: " . $e->getMessage());
            $this->jsonResponse(['error' => 'Error interno del servidor en procesamiento de repuestos'], 500);
        }
    }

    private function getAllRepuestos() {
        $stmt = $this->repuesto->getAll();
        if ($stmt === null) {
            $this->jsonResponse(['error' => 'No se pudo obtener la lista de repuestos'], 500);
        }

        $repuestos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $this->jsonResponse($repuestos, 200);
    }

    private function getRepuesto(int $id) {
        $repuesto = $this->repuesto->getById($id);

        if ($repuesto === false) {
            $this->jsonResponse(['error' => 'Fallo al buscar el repuesto'], 500);
        }

        if (!$repuesto) {
            $this->jsonResponse(['error' => 'Repuesto no encontrado'], 404);
        }

        $this->jsonResponse($repuesto, 200);
    }

    private function getLowStockRepuestos() {
        $repuestos = $this->repuesto->getLowStock();
        if ($repuestos === null) {
            $this->jsonResponse(['error' => 'No se pudo consultar stock bajo'], 500);
        }

        $this->jsonResponse($repuestos, 200);
    }

    private function createRepuesto() {
        $request = $this->getRequestBody();

        $codigo = isset($request['codigo']) ? trim((string) $request['codigo']) : '';
        $nombre = trim((string) ($request['nombre'] ?? ''));
        $descripcion = isset($request['descripcion']) ? trim((string) $request['descripcion']) : null;
        $precio = isset($request['precio']) && is_numeric($request['precio']) ? (float) $request['precio'] : 0;
        $stock = isset($request['stock']) && is_numeric($request['stock']) ? (int) $request['stock'] : 0;
        $stock_minimo = isset($request['stock_minimo']) && is_numeric($request['stock_minimo']) ? (int) $request['stock_minimo'] : 5;

        if ($nombre === '' || $precio <= 0) {
            $this->jsonResponse(['error' => 'Nombre y precio son obligatorios'], 400);
        }

        $newId = $this->repuesto->create($codigo, $nombre, $descripcion, $precio, $stock, $stock_minimo);

        if (!$newId) {
            $this->jsonResponse(['error' => 'No se pudo crear el repuesto, puede que el código ya exista'], 500);
        }

        $this->jsonResponse(['message' => 'Repuesto creado correctamente', 'id_repuesto' => $newId], 201);
    }

    private function updateRepuesto() {
        $request = $this->getRequestBody();
        $id = isset($_GET['id']) && is_numeric($_GET['id']) ? (int) $_GET['id'] : null;

        if (!$id) {
            $this->jsonResponse(['error' => 'ID de repuesto inválido'], 400);
        }

        $repuesto = $this->repuesto->getById($id);
        if (!$repuesto) {
            $this->jsonResponse(['error' => 'Repuesto no encontrado o error de lectura'], 400);
        }

        $codigo = isset($request['codigo']) ? trim((string) $request['codigo']) : $repuesto['codigo'];
        $nombre = trim((string) ($request['nombre'] ?? $repuesto['nombre']));
        $descripcion = isset($request['descripcion']) ? trim((string) $request['descripcion']) : $repuesto['descripcion'];
        $precio = isset($request['precio']) && is_numeric($request['precio']) ? (float) $request['precio'] : $repuesto['precio'];
        $stock = isset($request['stock']) && is_numeric($request['stock']) ? (int) $request['stock'] : $repuesto['stock'];
        $stock_minimo = isset($request['stock_minimo']) && is_numeric($request['stock_minimo']) ? (int) $request['stock_minimo'] : $repuesto['stock_minimo'];
        $activo = isset($request['activo']) ? (bool) $request['activo'] : (bool) $repuesto['activo'];

        if ($nombre === '' || $precio <= 0) {
            $this->jsonResponse(['error' => 'Nombre y precio válido son obligatorios'], 400);
        }

        $success = $this->repuesto->update($id, $codigo, $nombre, $descripcion, $precio, $stock, $stock_minimo, $activo);

        if (!$success) {
            $this->jsonResponse(['error' => 'No se pudo actualizar el repuesto. ¿Código repetido?'], 500);
        }

        $this->jsonResponse(['message' => 'Repuesto actualizado correctamente'], 200);
    }

    private function deleteRepuesto() {
        $id = isset($_GET['id']) && is_numeric($_GET['id']) ? (int) $_GET['id'] : null;

        if (!$id) {
            $this->jsonResponse(['error' => 'ID de repuesto inválido'], 400);
        }

        $repuesto = $this->repuesto->getById($id);
        if (!$repuesto) {
            $this->jsonResponse(['error' => 'Repuesto no encontrado'], 404);
        }

        $success = $this->repuesto->delete($id);
        if (!$success) {
            $this->jsonResponse(['error' => 'No se pudo eliminar el repuesto'], 500);
        }

        $this->jsonResponse(['message' => 'Repuesto eliminado correctamente'], 200);
    }
}
