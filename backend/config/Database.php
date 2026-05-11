<?php
// Archivo: /config/Database.php

class Database {
    private $host = "127.0.0.1"; 
    private $db_name = "proyecto_cswf";
    private $username = "root";
    private $password = "carlos123";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            // Configurar PDO para que lance excepciones si hay errores SQL
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            http_response_code(500);
            echo json_encode(["error" => "Error de conexión a la Base de Datos: " . $exception->getMessage()]);
            exit;
        }
        return $this->conn;
    }
}
?>