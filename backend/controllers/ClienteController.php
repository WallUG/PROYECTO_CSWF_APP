<?php
// Archivo: /controllers/ClienteController.php
require_once '../config/Database.php';
require_once '../models/Cliente.php';

class ClienteController {
    private $db;
    private $cliente;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->cliente = new Cliente($this->db);
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
        switch ($method) {
            case 'GET':
                if (isset($_GET['id']) && is_numeric($_GET['id'])) {
                    $this->getCliente((int) $_GET['id']);
                } else {
                    $this->getAllClientes();
                }
                break;
            case 'POST':
                $this->createCliente();
                break;
            case 'PUT':
                $this->updateCliente();
                break;
            case 'DELETE':
                $this->deleteCliente();
                break;
            default:
                $this->jsonResponse(['error' => 'Método HTTP no permitido'], 405);
                break;
        }
    }

    private function getAllClientes() {
        $stmt = $this->cliente->getAll();
        $clientes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $this->jsonResponse($clientes, 200);
    }

    private function getCliente(int $id) {
        $cliente = $this->cliente->getById($id);

        if (!$cliente) {
            $this->jsonResponse(['error' => 'Cliente no encontrado'], 404);
        }

        $this->jsonResponse($cliente, 200);
    }

    private function createCliente() {
        $request = $this->getRequestBody();
        $cedula = trim((string) ($request['cedula'] ?? ''));
        $nombres = trim((string) ($request['nombres'] ?? ''));
        $email = trim((string) ($request['email'] ?? ''));
        $telefono = trim((string) ($request['telefono'] ?? ''));
        $direccion = trim((string) ($request['direccion'] ?? ''));

        if ($cedula === '' || $nombres === '' || $email === '') {
            $this->jsonResponse(['error' => 'Cédula, nombres y correo son obligatorios'], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->jsonResponse(['error' => 'Correo electrónico inválido'], 400);
        }

        $newId = $this->cliente->create($cedula, $nombres, $telefono, $direccion, $email);

        if (!$newId) {
            $this->jsonResponse(['error' => 'No se pudo crear el cliente'], 500);
        }

        $this->jsonResponse(['message' => 'Cliente creado correctamente', 'id_cliente' => $newId], 201);
    }

    private function updateCliente() {
        $request = $this->getRequestBody();
        $id = isset($_GET['id']) && is_numeric($_GET['id']) ? (int) $_GET['id'] : null;

        if (!$id) {
            $this->jsonResponse(['error' => 'ID de cliente inválido'], 400);
        }

        $cliente = $this->cliente->getById($id);
        if (!$cliente) {
            $this->jsonResponse(['error' => 'Cliente no encontrado'], 404);
        }

        $cedula = trim((string) ($request['cedula'] ?? $cliente['cedula']));
        $nombres = trim((string) ($request['nombres'] ?? $cliente['nombres']));
        $email = trim((string) ($request['email'] ?? $cliente['email']));
        $telefono = trim((string) ($request['telefono'] ?? $cliente['telefono']));
        $direccion = trim((string) ($request['direccion'] ?? $cliente['direccion']));

        if ($cedula === '' || $nombres === '' || $email === '') {
            $this->jsonResponse(['error' => 'Cédula, nombres y correo son obligatorios'], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->jsonResponse(['error' => 'Correo electrónico inválido'], 400);
        }

        $success = $this->cliente->update($id, $cedula, $nombres, $telefono, $direccion, $email);

        if (!$success) {
            $this->jsonResponse(['error' => 'No se pudo actualizar el cliente'], 500);
        }

        $this->jsonResponse(['message' => 'Cliente actualizado correctamente'], 200);
    }

    private function deleteCliente() {
        $id = isset($_GET['id']) && is_numeric($_GET['id']) ? (int) $_GET['id'] : null;

        if (!$id) {
            $this->jsonResponse(['error' => 'ID de cliente inválido'], 400);
        }

        $cliente = $this->cliente->getById($id);
        if (!$cliente) {
            $this->jsonResponse(['error' => 'Cliente no encontrado'], 404);
        }

        $success = $this->cliente->delete($id);
        if (!$success) {
            $this->jsonResponse(['error' => 'No se pudo eliminar el cliente'], 500);
        }

        $this->jsonResponse(['message' => 'Cliente eliminado correctamente'], 200);
    }
}
