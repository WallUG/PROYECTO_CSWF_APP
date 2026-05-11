<?php
// Archivo: /models/Cliente.php

class Cliente {
    private $conn;
    private $table_name = "cliente";

    public function __construct($db) {
        $this->conn = $db;
    }

    // Método para obtener todos los clientes
    public function getAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }
}
?>