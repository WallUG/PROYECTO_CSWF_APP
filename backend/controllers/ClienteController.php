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

    // Evalúa si es un GET (Leer), POST (Crear), etc.
    public function processRequest($method) {
        switch ($method) {
            case 'GET':
                $this->getAllClientes();
                break;
            // Aquí agregarás case 'POST' para crear, etc.
            default:
                http_response_code(405);
                echo json_encode(["error" => "Método HTTP no permitido"]);
                break;
        }
    }

    private function getAllClientes() {
        $stmt = $this->cliente->getAll();
        $num = $stmt->rowCount();

        $clientes_arr = array();
        
        if($num > 0) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($clientes_arr, $row);
            }
        }
        
        // Devolvemos el array en formato JSON (status 200 OK)
        http_response_code(200);
        echo json_encode($clientes_arr);
    }
}
?>