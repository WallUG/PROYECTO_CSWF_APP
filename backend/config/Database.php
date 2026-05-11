<?php
// Archivo: /config/Database.php

class Database {
    // Datos actualizados según el panel de hosting
    private $host = "sql107.infinityfree.com"; 
    private $db_name = "if0_41884183_proyecto_cswf";
    private $username = "if0_41884183";
    private $password = "yqeFcA4VESiv";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            
            // Configurar PDO para que lance excepciones si hay errores SQL
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Forzar el uso de UTF-8 para evitar problemas con tildes o eñes
            $this->conn->exec("set names utf8");
            
        } catch(PDOException $exception) {
            // En entornos de producción, es mejor no mostrar el mensaje de error detallado al usuario final
            http_response_code(500);
            echo json_encode(["error" => "Error de conexión a la Base de Datos: " . $exception->getMessage()]);
            exit;
        }
        return $this->conn;
    }
}
?>