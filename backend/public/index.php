<?php
// Archivo: /public/index.php

// 1. Configuración estricta de CORS para aceptar peticiones de tu Frontend
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Interceptar peticiones OPTIONS (React hace esto antes de un POST/PUT)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Enrutador Básico
$requestMethod = $_SERVER["REQUEST_METHOD"];
// Obtenemos la URL que viene del .htaccess (ej: "clientes" o "usuarios")
$route = isset($_GET['url']) ? rtrim($_GET['url'], '/') : '';

// 3. Evaluar la ruta y llamar al controlador
switch ($route) {
    case 'clientes':
        require_once '../controllers/ClienteController.php';
        $controller = new ClienteController();
        $controller->processRequest($requestMethod);
        break;
        
    // Aquí irás agregando: case 'vehiculos': case 'ordenes': etc.
        
    case '':
        echo json_encode(["mensaje" => "API del Taller Automotriz Funcionando :)"]);
        break;

    default:
        http_response_code(404);
        echo json_encode(["error" => "Ruta no encontrada"]);
        break;
}
?>