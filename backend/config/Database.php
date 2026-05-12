<?php
// Archivo: /config/Database.php

class Database {
    // La configuración usa variables de entorno para soportar local y desplegado.
    private $host = getenv('DB_HOST') ?: 'mysql';
    private $db_name = getenv('DB_NAME') ?: 'pruebascsf_if0_41884183';
    private $username = getenv('DB_USER') ?: 'pruebascsf';
    private $password = getenv('DB_PASSWORD') ?: 'Comportamiento6-7';
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