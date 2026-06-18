<?php
require_once '../config/Database.php';
require_once '../models/OrdenServicio.php';
require_once '../models/DetalleOrden.php';

class OrdenServicioController {
    private $db;
    private $orden;
    private $detalle;

    public function __construct() {
        try {
            $database = new Database();
            $this->db = $database->getConnection();
            $this->orden = new OrdenServicio($this->db);
            $this->detalle = new DetalleOrden($this->db);
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
                        $this->getOrden((int) $_GET['id']);
                    } else {
                        $this->getAllOrdenes();
                    }
                    break;
                case 'POST':
                    if (isset($_GET['id']) && is_numeric($_GET['id'])) {
                        $this->addDetalle((int) $_GET['id']);
                    } else {
                        $this->createOrden();
                    }
                    break;
                case 'PUT':
                    $this->updateOrden();
                    break;
                case 'DELETE':
                    if (isset($_GET['detalle_id']) && is_numeric($_GET['detalle_id'])) {
                        $this->removeDetalle((int) $_GET['detalle_id']);
                    } else {
                        $this->deleteOrden();
                    }
                    break;
                default:
                    $this->jsonResponse(['error' => 'Método HTTP no permitido'], 405);
                    break;
            }
        } catch (Exception $e) {
            error_log("Fallo crítico en OrdenServicioController: " . $e->getMessage());
            $this->jsonResponse(['error' => 'Error interno del servidor en procesamiento de órdenes'], 500);
        }
    }

    private function getAllOrdenes() {
        $stmt = $this->orden->getAll();
        if ($stmt === null) {
            $this->jsonResponse(['error' => 'No se pudo obtener la lista de órdenes'], 500);
        }
        $ordenes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $this->jsonResponse($ordenes, 200);
    }

    private function getOrden(int $id) {
        $orden = $this->orden->getById($id);

        if ($orden === false) {
            $this->jsonResponse(['error' => 'Fallo al buscar la orden'], 500);
        }

        if (!$orden) {
            $this->jsonResponse(['error' => 'Orden no encontrada'], 404);
        }

        $orden['detalles'] = $this->detalle->getByOrden($id);

        $this->jsonResponse($orden, 200);
    }

    private function createOrden() {
        $request = $this->getRequestBody();

        $id_vehiculo = isset($request['id_vehiculo']) && is_numeric($request['id_vehiculo']) ? (int)$request['id_vehiculo'] : null;
        $id_tecnico = isset($request['id_tecnico']) && is_numeric($request['id_tecnico']) ? (int)$request['id_tecnico'] : null;
        $motivo_ingreso = trim((string) ($request['motivo_ingreso'] ?? ''));
        $items = $request['items'] ?? [];

        if (!$id_vehiculo || !$id_tecnico || $motivo_ingreso === '') {
            $this->jsonResponse(['error' => 'Vehículo, técnico y motivo de ingreso son obligatorios'], 400);
        }

        $numero_orden = $this->orden->getNextNumber();

        try {
            $this->db->beginTransaction();

            $newId = $this->orden->create($numero_orden, $id_vehiculo, $id_tecnico, $motivo_ingreso);

            if (!$newId) {
                $this->db->rollBack();
                $this->jsonResponse(['error' => 'No se pudo crear la orden de servicio'], 500);
            }

            if (is_array($items)) {
                foreach ($items as $item) {
                    $id_item = isset($item['id_item']) && is_numeric($item['id_item']) ? (int)$item['id_item'] : null;
                    $cantidad = isset($item['cantidad']) && is_numeric($item['cantidad']) ? (int)$item['cantidad'] : null;
                    $precio_unitario = isset($item['precio_unitario']) && is_numeric($item['precio_unitario']) ? (float)$item['precio_unitario'] : null;

                    if (!$id_item || !$cantidad || !$precio_unitario || $cantidad <= 0) {
                        continue;
                    }

                    $detalleId = $this->detalle->create($newId, $id_item, $cantidad, $precio_unitario);
                    if (!$detalleId) {
                        $this->db->rollBack();
                        $this->jsonResponse(['error' => 'Error al agregar detalle a la orden'], 500);
                    }
                }
            }

            $this->db->commit();
            $this->jsonResponse([
                'message' => 'Orden de servicio creada correctamente',
                'id_orden' => $newId,
                'numero_orden' => $numero_orden
            ], 201);

        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Error transaccional en createOrden: " . $e->getMessage());
            $this->jsonResponse(['error' => 'Error al crear la orden de servicio'], 500);
        }
    }

    private function updateOrden() {
        $request = $this->getRequestBody();
        $id = isset($_GET['id']) && is_numeric($_GET['id']) ? (int) $_GET['id'] : null;

        if (!$id) {
            $this->jsonResponse(['error' => 'ID de orden inválido'], 400);
        }

        $orden = $this->orden->getById($id);
        if (!$orden) {
            $this->jsonResponse(['error' => 'Orden no encontrada'], 404);
        }

        // Si solo se envía estado, es una transición de estado
        if (isset($request['estado'])) {
            $allowedStates = ['Pendiente', 'En Proceso', 'En Espera de Repuestos', 'Finalizado', 'Entregado', 'Cancelado'];
            $estado = trim($request['estado']);

            if (!in_array($estado, $allowedStates)) {
                $this->jsonResponse(['error' => 'Estado inválido. Estados permitidos: ' . implode(', ', $allowedStates)], 400);
            }

            $diagnostico = isset($request['diagnostico_tecnico']) ? trim($request['diagnostico_tecnico']) : null;

            $success = $this->orden->updateState($id, $estado, $diagnostico);

            if (!$success) {
                $this->jsonResponse(['error' => 'No se pudo actualizar el estado de la orden'], 500);
            }

            $this->jsonResponse(['message' => 'Estado de orden actualizado correctamente', 'estado' => $estado], 200);
            return;
        }

        // Actualización completa de la orden
        $id_vehiculo = isset($request['id_vehiculo']) && is_numeric($request['id_vehiculo']) ? (int)$request['id_vehiculo'] : $orden['id_vehiculo'];
        $id_tecnico = isset($request['id_tecnico']) && is_numeric($request['id_tecnico']) ? (int)$request['id_tecnico'] : $orden['id_tecnico'];
        $motivo_ingreso = trim((string) ($request['motivo_ingreso'] ?? $orden['motivo_ingreso']));
        $diagnostico_tecnico = isset($request['diagnostico_tecnico']) ? trim($request['diagnostico_tecnico']) : ($orden['diagnostico_tecnico'] ?? null);

        $success = $this->orden->update($id, $id_vehiculo, $id_tecnico, $motivo_ingreso, $diagnostico_tecnico);

        if (!$success) {
            $this->jsonResponse(['error' => 'No se pudo actualizar la orden'], 500);
        }

        $this->jsonResponse(['message' => 'Orden actualizada correctamente'], 200);
    }

    private function addDetalle(int $id_orden) {
        $request = $this->getRequestBody();

        $id_item = isset($request['id_item']) && is_numeric($request['id_item']) ? (int)$request['id_item'] : null;
        $cantidad = isset($request['cantidad']) && is_numeric($request['cantidad']) ? (int)$request['cantidad'] : null;
        $precio_unitario = isset($request['precio_unitario']) && is_numeric($request['precio_unitario']) ? (float)$request['precio_unitario'] : null;

        if (!$id_item || !$cantidad || !$precio_unitario || $cantidad <= 0) {
            $this->jsonResponse(['error' => 'Item, cantidad y precio unitario son obligatorios y deben ser válidos'], 400);
        }

        $detalleId = $this->detalle->create($id_orden, $id_item, $cantidad, $precio_unitario);

        if (!$detalleId) {
            $this->jsonResponse(['error' => 'No se pudo agregar el detalle a la orden'], 500);
        }

        $this->jsonResponse(['message' => 'Detalle agregado correctamente', 'id_detalle' => $detalleId], 201);
    }

    private function removeDetalle(int $detalle_id) {
        $success = $this->detalle->delete($detalle_id);

        if (!$success) {
            $this->jsonResponse(['error' => 'No se pudo eliminar el detalle'], 500);
        }

        $this->jsonResponse(['message' => 'Detalle eliminado correctamente'], 200);
    }

    private function deleteOrden() {
        $id = isset($_GET['id']) && is_numeric($_GET['id']) ? (int) $_GET['id'] : null;

        if (!$id) {
            $this->jsonResponse(['error' => 'ID de orden inválido'], 400);
        }

        $orden = $this->orden->getById($id);
        if (!$orden) {
            $this->jsonResponse(['error' => 'Orden no encontrada'], 404);
        }

        $success = $this->orden->delete($id);
        if (!$success) {
            $this->jsonResponse(['error' => 'No se pudo eliminar la orden'], 500);
        }

        $this->jsonResponse(['message' => 'Orden eliminada correctamente'], 200);
    }
}
