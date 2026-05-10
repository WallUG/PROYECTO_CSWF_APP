<?php

require_once __DIR__ . '/cors.php';
include __DIR__ . '/../config/db.php';

function jsonResponse(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse([
        'success' => false,
        'status' => 'error',
        'message' => 'Método no permitido. Use POST.',
    ], 405);
}

$body = file_get_contents('php://input');
$request = json_decode($body, true);

if (!is_array($request)) {
    jsonResponse([
        'success' => false,
        'status' => 'error',
        'message' => 'Solicitud JSON inválida.',
    ], 400);
}

$username = trim((string) ($request['username'] ?? $request['email'] ?? ''));
$password = (string) ($request['password'] ?? '');

if ($username === '' || $password === '') {
    jsonResponse([
        'success' => false,
        'status' => 'error',
        'message' => 'El usuario y la contraseña son obligatorios.',
    ], 400);
}

$sql = 'SELECT id_usuario, nombre, correo, password, rol, estado_cuenta FROM usuario WHERE correo = ? OR nombre = ? LIMIT 1';
$stmt = $conn->prepare($sql);

if ($stmt === false) {
    jsonResponse([
        'success' => false,
        'status' => 'error',
        'message' => 'Error interno en la base de datos.',
    ], 500);
}

$stmt->bind_param('ss', $username, $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result === false || $result->num_rows === 0) {
    jsonResponse([
        'success' => false,
        'status' => 'error',
        'message' => 'Usuario o contraseña incorrectos.',
    ], 401);
}

$user = $result->fetch_assoc();

if (!$user['estado_cuenta']) {
    jsonResponse([
        'success' => false,
        'status' => 'error',
        'message' => 'La cuenta está deshabilitada.',
    ], 403);
}

$storedPassword = $user['password'];
$isPasswordValid = false;

if (password_verify($password, $storedPassword)) {
    $isPasswordValid = true;
} elseif ($password === $storedPassword) {
    // Fallback para contraseñas sin hash en datos de prueba.
    $isPasswordValid = true;
}

if (!$isPasswordValid) {
    jsonResponse([
        'success' => false,
        'status' => 'error',
        'message' => 'Usuario o contraseña incorrectos.',
    ], 401);
}

jsonResponse([
    'success' => true,
    'status' => 'ok',
    'message' => 'Inicio de sesión exitoso.',
    'user' => [
        'id' => (int) $user['id_usuario'],
        'name' => $user['nombre'],
        'email' => $user['correo'],
        'role' => $user['rol'],
    ],
]);
