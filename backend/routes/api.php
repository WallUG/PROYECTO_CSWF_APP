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

// Extraer la ruta adecuadamente soportando .htaccess o PHP Built-in server
if (isset($_GET['url'])) {
    $route = rtrim($_GET['url'], '/');
} else {
    // Fallback: extraer ruta desde REQUEST_URI
    $route = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
}
// Limpiar prefijo en caso de que lo lea incluyéndolo (ej. carpeta /public/)
$route = str_replace(['public/', '/public/'], '', $route);
$route = trim($route, '/');

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
        require_once __DIR__ . '/../middlewares/AuthMiddleware.php';
        AuthMiddleware::checkToken(); // Protege el endpoint validando JWT
        require_once __DIR__ . '/../controllers/ClienteController.php';
        $controller = new ClienteController();
        $controller->processRequest($requestMethod);
        break;

    case 'vehiculos':
        require_once __DIR__ . '/../middlewares/AuthMiddleware.php';
        AuthMiddleware::checkToken(); // Protege el endpoint validando JWT
        require_once __DIR__ . '/../controllers/VehiculoController.php';
        $controller = new VehiculoController();
        $controller->processRequest($requestMethod);
        break;

    case 'repuestos':
        require_once __DIR__ . '/../middlewares/AuthMiddleware.php';
        AuthMiddleware::checkToken(); // Protege el endpoint validando JWT
        require_once __DIR__ . '/../controllers/RepuestoController.php';
        $controller = new RepuestoController();
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
