<?php
// Archivo: /config/Database.php

class Database {
    // La configuración usa variables de entorno para soportar local y desplegado.
    private $host;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        // Cargar variables desde el archivo .env
        $envFile = __DIR__ . '/../.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos(trim($line), '#') === 0) continue;
                if (strpos($line, '=') !== false) {
                    list($name, $value) = explode('=', $line, 2);
                    $name = trim($name);
                    $value = trim($value);
                    if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
                        putenv(sprintf('%s=%s', $name, $value));
                        $_ENV[$name] = $value;
                        $_SERVER[$name] = $value;
                    }
                }
            }
        }

        // Asignar los valores a las propiedades usando getenv()
        $this->host = getenv('DB_HOST');
        $this->db_name = getenv('DB_NAME');
        $this->username = getenv('DB_USER');
        $this->password = getenv('DB_PASSWORD');
    }

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