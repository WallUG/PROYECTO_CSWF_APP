<?php
// Archivo: /controllers/AuthController.php
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/Usuario.php';

class AuthController {
    private $db;
    private $usuario;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->usuario = new Usuario($this->db);
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

    public function login(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->jsonResponse([
                'success' => false,
                'status' => 'error',
                'message' => 'Metodo no permitido. Use POST.',
            ], 405);
        }

        $request = $this->getRequestBody();
        $identifier = trim((string) ($request['identifier'] ?? $request['username'] ?? $request['email'] ?? ''));
        $password = (string) ($request['password'] ?? '');

        if ($identifier === '' || $password === '') {
            $this->jsonResponse([
                'success' => false,
                'status' => 'error',
                'message' => 'El nombre de usuario/correo y la contrasena son obligatorios.',
            ], 400);
        }

        $user = $this->usuario->findByUsernameOrEmail($identifier);

        if (!$user) {
            $this->jsonResponse([
                'success' => false,
                'status' => 'error',
                'message' => 'Usuario o contrasena incorrectos.',
            ], 401);
        }

        if (!$user['estado_cuenta']) {
            $this->jsonResponse([
                'success' => false,
                'status' => 'error',
                'message' => 'La cuenta esta deshabilitada.',
            ], 403);
        }

        $storedPassword = $user['password'];
        $isPasswordValid = password_verify($password, $storedPassword);

        if (!$isPasswordValid) {
            $isPasswordValid = $password === $storedPassword;
        }

        if (!$isPasswordValid) {
            $this->jsonResponse([
                'success' => false,
                'status' => 'error',
                'message' => 'Usuario o contrasena incorrectos.',
            ], 401);
        }

        $this->jsonResponse([
            'success' => true,
            'status' => 'ok',
            'message' => 'Inicio de sesion exitoso.',
            'user' => [
                'id' => (int) $user['id_usuario'],
                'name' => $user['nombre'],
                'email' => $user['correo'],
                'role' => $user['rol'],
            ],
        ]);
    }

    public function register(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->jsonResponse([
                'success' => false,
                'status' => 'error',
                'message' => 'Metodo no permitido. Use POST.',
            ], 405);
        }

        $request = $this->getRequestBody();
        $username = trim((string) ($request['username'] ?? ''));
        $email = trim((string) ($request['email'] ?? ''));
        $password = (string) ($request['password'] ?? '');

        if ($username === '' || $email === '' || $password === '') {
            $this->jsonResponse([
                'success' => false,
                'status' => 'error',
                'message' => 'Nombre, correo y contrasena son obligatorios.',
            ], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->jsonResponse([
                'success' => false,
                'status' => 'error',
                'message' => 'Correo electronico no valido.',
            ], 400);
        }

        if ($this->usuario->existsByEmailOrUsername($email, $username)) {
            $this->jsonResponse([
                'success' => false,
                'status' => 'error',
                'message' => 'El correo o el nombre de usuario ya estan registrados.',
            ], 409);
        }

        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $newUserId = $this->usuario->create($username, $email, $passwordHash);

        if (!$newUserId) {
            $this->jsonResponse([
                'success' => false,
                'status' => 'error',
                'message' => 'No se pudo crear el usuario. Intenta de nuevo mas tarde.',
            ], 500);
        }

        $this->jsonResponse([
            'success' => true,
            'status' => 'ok',
            'message' => 'Registro completado correctamente.',
            'user' => [
                'id' => (int) $newUserId,
                'name' => $username,
                'email' => $email,
                'role' => 'Cliente',
            ],
        ], 201);
    }

    public function status(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            $this->jsonResponse([
                'success' => false,
                'status' => 'error',
                'message' => 'Metodo no permitido. Use GET.',
            ], 405);
        }

        try {
            $stmt = $this->db->query('SELECT NOW() AS server_time');
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            $this->jsonResponse([
                'success' => true,
                'status' => 'ok',
                'message' => 'Backend funcionando',
                'server_time' => $row['server_time'] ?? null,
            ]);
        } catch (PDOException $exception) {
            $this->jsonResponse([
                'success' => false,
                'status' => 'error',
                'message' => 'No se pudo obtener el estado del servidor.',
            ], 500);
        }
    }
}
