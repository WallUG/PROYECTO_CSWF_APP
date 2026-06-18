<?php
require_once '../config/Database.php';
require_once '../models/Tecnico.php';

class TecnicoController {
    private $db;
    private $tecnico;

    public function __construct() {
        try {
            $database = new Database();
            $this->db = $database->getConnection();
            $this->tecnico = new Tecnico($this->db);
        } catch (Exception $e) {
            $this->jsonResponse(['error' => 'Fallo de conexión a la base de datos'], 500);
        }
    }

    private function jsonResponse(array $payload, int $statusCode = 200): void {
        http_response_code($statusCode);
        echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    public function processRequest($method) {
        try {
            if ($method === 'GET') {
                $this->getAllTecnicos();
            } else {
                $this->jsonResponse(['error' => 'Método HTTP no permitido'], 405);
            }
        } catch (Exception $e) {
            error_log("Fallo crítico en TecnicoController: " . $e->getMessage());
            $this->jsonResponse(['error' => 'Error interno del servidor'], 500);
        }
    }

    private function getAllTecnicos() {
        $stmt = $this->tecnico->getAll();
        if ($stmt === null) {
            $this->jsonResponse(['error' => 'No se pudo obtener la lista de técnicos'], 500);
        }
        $tecnicos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $this->jsonResponse($tecnicos, 200);
    }
}
