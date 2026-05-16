<?php
// Archivo: /routes/api.php

// Configuración de CORS y respuesta JSON común.
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$requestMethod = $_SERVER["REQUEST_METHOD"];
$route = isset($_GET['url']) ? rtrim($_GET['url'], '/') : '';

switch ($route) {
    case 'login':
        require_once __DIR__ . '/../controllers/AuthController.php';
        $controller = new AuthController();
        $controller->login();
        break;

    case 'register':
        require_once __DIR__ . '/../controllers/AuthController.php';
        $controller = new AuthController();
        $controller->register();
        break;

    case 'status':
        require_once __DIR__ . '/../controllers/AuthController.php';
        $controller = new AuthController();
        $controller->status();
        break;

    case 'clientes':
        require_once __DIR__ . '/../controllers/ClienteController.php';
        $controller = new ClienteController();
        $controller->processRequest($requestMethod);
        break;

    case 'vehiculos':
        require_once __DIR__ . '/../controllers/VehiculoController.php';
        $controller = new VehiculoController();
        $controller->processRequest($requestMethod);
        break;

    case '':
        http_response_code(200);
        echo json_encode(["message" => "API del Taller Automotriz Funcionando :)"]);
        break;

    default:
        http_response_code(404);
        echo json_encode(["error" => "Ruta no encontrada"]);
        break;
}
