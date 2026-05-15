<?php
// Archivo: /models/Cliente.php

class Cliente {
    private $conn;
    private $table_name = "cliente";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getById(int $id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id_cliente = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create(string $cedula, string $nombres, string $telefono, string $direccion, string $email): ?int {
        $query = "INSERT INTO " . $this->table_name . " (cedula, nombres, telefono, direccion, email) VALUES (:cedula, :nombres, :telefono, :direccion, :email)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':cedula', $cedula);
        $stmt->bindParam(':nombres', $nombres);
        $stmt->bindParam(':telefono', $telefono);
        $stmt->bindParam(':direccion', $direccion);
        $stmt->bindParam(':email', $email);

        if ($stmt->execute()) {
            return (int) $this->conn->lastInsertId();
        }

        return null;
    }

    public function update(int $id, string $cedula, string $nombres, string $telefono, string $direccion, string $email): bool {
        $query = "UPDATE " . $this->table_name . " SET cedula = :cedula, nombres = :nombres, telefono = :telefono, direccion = :direccion, email = :email, updated_at = CURRENT_TIMESTAMP WHERE id_cliente = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':cedula', $cedula);
        $stmt->bindParam(':nombres', $nombres);
        $stmt->bindParam(':telefono', $telefono);
        $stmt->bindParam(':direccion', $direccion);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);

        return $stmt->execute();
    }

    public function delete(int $id): bool {
        $query = "DELETE FROM " . $this->table_name . " WHERE id_cliente = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
