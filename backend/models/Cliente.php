<?php
// Archivo: /models/Cliente.php

class Cliente {
    private $conn;
    private $table_name = "cliente";

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Obtiene todos los clientes de la base de datos.
     * Integración de tolerancia a fallos devolviendo null en caso de error de conexión.
     */
    public function getAll() {
        try {
            $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error en Cliente::getAll: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Obtiene un cliente por su ID.
     */
    public function getById(int $id) {
        try {
            $query = "SELECT * FROM " . $this->table_name . " WHERE id_cliente = :id LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error en Cliente::getById: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Crea un nuevo cliente con tolerancia a fallos.
     */
    public function create(string $cedula, string $nombres, string $telefono, string $direccion, string $email): ?int {
        try {
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
        } catch (PDOException $e) {
            error_log("Error en Cliente::create: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Actualiza un cliente con encapsulamiento try-catch para tolerancia a fallas.
     */
    public function update(int $id, string $cedula, string $nombres, string $telefono, string $direccion, string $email): bool {
        try {
            $query = "UPDATE " . $this->table_name . " SET cedula = :cedula, nombres = :nombres, telefono = :telefono, direccion = :direccion, email = :email, updated_at = CURRENT_TIMESTAMP WHERE id_cliente = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':cedula', $cedula);
            $stmt->bindParam(':nombres', $nombres);
            $stmt->bindParam(':telefono', $telefono);
            $stmt->bindParam(':direccion', $direccion);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error en Cliente::update: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Elimina a un cliente de forma segura.
     */
    public function delete(int $id): bool {
        try {
            $query = "DELETE FROM " . $this->table_name . " WHERE id_cliente = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error en Cliente::delete: " . $e->getMessage());
            return false;
        }
    }
}

