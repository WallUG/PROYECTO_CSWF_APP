<?php

class Tecnico {
    private $conn;
    private $table_name = "tecnico";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        try {
            $query = "SELECT t.id_usuario, u.nombre, u.correo, t.especialidad, t.estado_disponibilidad
                      FROM " . $this->table_name . " t
                      JOIN usuario u ON t.id_usuario = u.id_usuario
                      WHERE u.estado_cuenta = TRUE
                      ORDER BY u.nombre ASC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error en Tecnico::getAll: " . $e->getMessage());
            return null;
        }
    }
}
