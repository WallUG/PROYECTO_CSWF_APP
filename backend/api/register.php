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

$username = trim((string) ($request['username'] ?? ''));
$email = trim((string) ($request['email'] ?? ''));
$password = (string) ($request['password'] ?? '');

if ($username === '' || $email === '' || $password === '') {
    jsonResponse([
        'success' => false,
        'status' => 'error',
        'message' => 'Nombre, correo y contraseña son obligatorios.',
    ], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse([
        'success' => false,
        'status' => 'error',
        'message' => 'Correo electrónico no válido.',
    ], 400);
}

$sqlCheck = 'SELECT id_usuario FROM usuario WHERE correo = ? OR nombre = ? LIMIT 1';
$stmtCheck = $conn->prepare($sqlCheck);

if ($stmtCheck === false) {
    jsonResponse([
        'success' => false,
        'status' => 'error',
        'message' => 'Error interno en la base de datos.',
    ], 500);
}

$stmtCheck->bind_param('ss', $email, $username);
$stmtCheck->execute();
$resultCheck = $stmtCheck->get_result();

if ($resultCheck && $resultCheck->num_rows > 0) {
    jsonResponse([
        'success' => false,
        'status' => 'error',
        'message' => 'El correo o el nombre de usuario ya están registrados.',
    ], 409);
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
$sqlInsert = 'INSERT INTO usuario (nombre, correo, password, rol, estado_cuenta) VALUES (?, ?, ?, ?, 1)';
$stmtInsert = $conn->prepare($sqlInsert);

if ($stmtInsert === false) {
    jsonResponse([
        'success' => false,
        'status' => 'error',
        'message' => 'Error interno en la base de datos.',
    ], 500);
}

$role = 'Cliente';
$stmtInsert->bind_param('ssss', $username, $email, $hashedPassword, $role);
$success = $stmtInsert->execute();

if (!$success) {
    jsonResponse([
        'success' => false,
        'status' => 'error',
        'message' => 'No se pudo crear el usuario. Intenta de nuevo más tarde.',
    ], 500);
}

jsonResponse([
    'success' => true,
    'status' => 'ok',
    'message' => 'Registro completado correctamente.',
    'user' => [
        'name' => $username,
        'email' => $email,
        'role' => $role,
    ],
], 201);
