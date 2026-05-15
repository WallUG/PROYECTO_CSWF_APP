<?php
// Archivo: /models/Usuario.php

class Usuario {
    private $conn;
    private $table_name = "usuario";

    public function __construct($db) {
        $this->conn = $db;
    }

    // Metodo para obtener todos los usuarios
    public function getAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // Buscar usuario por nombre o correo
    public function findByUsernameOrEmail(string $identifier) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE nombre = :identifier OR correo = :identifier LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':identifier', $identifier);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Verificar si existe usuario por correo o nombre
    public function existsByEmailOrUsername(string $email, string $username): bool {
        $query = "SELECT COUNT(*) AS total FROM " . $this->table_name . " WHERE correo = :email OR nombre = :username";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':username', $username);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int) ($row['total'] ?? 0) > 0;
    }

    // Crear un nuevo usuario
    public function create(string $username, string $email, string $passwordHash): ?int {
        $query = "INSERT INTO " . $this->table_name . " (nombre, correo, password, rol, estado_cuenta) VALUES (:nombre, :correo, :password, :rol, 1)";
        $stmt = $this->conn->prepare($query);
        $rol = 'Cliente';
        $stmt->bindParam(':nombre', $username);
        $stmt->bindParam(':correo', $email);
        $stmt->bindParam(':password', $passwordHash);
        $stmt->bindParam(':rol', $rol);

        if ($stmt->execute()) {
            return (int) $this->conn->lastInsertId();
        }

        return null;
    }
}
