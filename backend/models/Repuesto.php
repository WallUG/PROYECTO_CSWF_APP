<?php
// Archivo: /models/Repuesto.php

class Repuesto {
    private $conn;
    private $table_name = "repuesto";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        try {
            $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error en Repuesto::getAll: " . $e->getMessage());
            return null;
        }
    }

    public function getById(int $id) {
        try {
            $query = "SELECT * FROM " . $this->table_name . " WHERE id_repuesto = :id LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error en Repuesto::getById: " . $e->getMessage());
            return false;
        }
    }

    public function getLowStock() {
        try {
            $query = "SELECT * FROM " . $this->table_name . " WHERE activo = TRUE AND stock <= stock_minimo ORDER BY stock ASC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error en Repuesto::getLowStock: " . $e->getMessage());
            return null;
        }
    }

    public function create(string $codigo, string $nombre, ?string $descripcion, float $precio, int $stock, int $stock_minimo): ?int {
        try {
            $query = "INSERT INTO " . $this->table_name . "
                      (codigo, nombre, descripcion, precio, stock, stock_minimo)
                      VALUES (:codigo, :nombre, :descripcion, :precio, :stock, :stock_minimo)";
            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(':codigo', $codigo);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':descripcion', $descripcion);
            $stmt->bindParam(':precio', $precio);
            $stmt->bindParam(':stock', $stock, PDO::PARAM_INT);
            $stmt->bindParam(':stock_minimo', $stock_minimo, PDO::PARAM_INT);

            if ($stmt->execute()) {
                return (int) $this->conn->lastInsertId();
            }
            return null;
        } catch (PDOException $e) {
            error_log("Error en Repuesto::create: " . $e->getMessage());
            return null;
        }
    }

    public function update(int $id, string $codigo, string $nombre, ?string $descripcion, float $precio, int $stock, int $stock_minimo, bool $activo): bool {
        try {
            $query = "UPDATE " . $this->table_name . "
                      SET codigo = :codigo, nombre = :nombre, descripcion = :descripcion,
                          precio = :precio, stock = :stock, stock_minimo = :stock_minimo,
                          activo = :activo, updated_at = CURRENT_TIMESTAMP
                      WHERE id_repuesto = :id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':codigo', $codigo);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':descripcion', $descripcion);
            $stmt->bindParam(':precio', $precio);
            $stmt->bindParam(':stock', $stock, PDO::PARAM_INT);
            $stmt->bindParam(':stock_minimo', $stock_minimo, PDO::PARAM_INT);
            $stmt->bindParam(':activo', $activo, PDO::PARAM_BOOL);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error en Repuesto::update: " . $e->getMessage());
            return false;
        }
    }

    public function delete(int $id): bool {
        try {
            $query = "DELETE FROM " . $this->table_name . " WHERE id_repuesto = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error en Repuesto::delete: " . $e->getMessage());
            return false;
        }
    }
}
