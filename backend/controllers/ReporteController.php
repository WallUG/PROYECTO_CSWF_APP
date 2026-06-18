<?php
require_once '../config/Database.php';
require_once '../models/Reporte.php';

class ReporteController {
    private $db;
    private $reporte;

    public function __construct() {
        try {
            $database = new Database();
            $this->db = $database->getConnection();
            $this->reporte = new Reporte($this->db);
        } catch (Exception $e) {
            $this->jsonResponse(['error' => 'Fallo de conexión a la base de datos'], 500);
        }
    }

    private function jsonResponse(array $payload, int $statusCode = 200): void {
        http_response_code($statusCode);
        echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    public function historial() {
        try {
            if (isset($_GET['id_vehiculo']) && is_numeric($_GET['id_vehiculo'])) {
                $data = $this->reporte->getHistorialByVehiculo((int) $_GET['id_vehiculo']);
                if ($data === null) {
                    $this->jsonResponse(['error' => 'Vehículo no encontrado'], 404);
                }
                $this->jsonResponse($data, 200);
            } else {
                $data = $this->reporte->getHistorialVehiculos();
                $this->jsonResponse($data, 200);
            }
        } catch (Exception $e) {
            error_log("Fallo crítico en ReporteController::historial: " . $e->getMessage());
            $this->jsonResponse(['error' => 'Error al obtener el historial'], 500);
        }
    }

    public function generales() {
        try {
            $desde = isset($_GET['desde']) ? trim($_GET['desde']) : null;
            $hasta = isset($_GET['hasta']) ? trim($_GET['hasta']) : null;

            $data = $this->reporte->getReporteGeneral($desde, $hasta);
            if ($data === null) {
                $this->jsonResponse(['error' => 'No se pudo generar el reporte'], 500);
            }

            $this->jsonResponse($data, 200);
        } catch (Exception $e) {
            error_log("Fallo crítico en ReporteController::generales: " . $e->getMessage());
            $this->jsonResponse(['error' => 'Error al generar el reporte general'], 500);
        }
    }
}
