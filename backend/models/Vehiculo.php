<?php
// Archivo: /models/Vehiculo.php

class Vehiculo {
    private $conn;
    private $table_name = "vehiculo";

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Obtiene todos los vehículos de la base de datos.
     * Incorpora tolerancia a fallos mediante try-catch.
     */
    public function getAll() {
        try {
            $query = "SELECT v.*, c.nombres as cliente_nombre FROM " . $this->table_name . " v
                      LEFT JOIN cliente c ON v.id_cliente = c.id_cliente
                      ORDER BY v.created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error en Vehiculo::getAll: " . $e->getMessage());
            return null; // Devuelve null si ocurre un fallo para que el controlador actúe
        }
    }

    /**
     * Obtiene un vehículo por su ID.
     */
    public function getById(int $id) {
        try {
            $query = "SELECT * FROM " . $this->table_name . " WHERE id_vehiculo = :id LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error en Vehiculo::getById: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Crea un nuevo vehículo con control transaccional básico (o tolerancia a fallos en el insert).
     */
    public function create(string $placa, string $marca, string $modelo, ?int $anio, ?string $color, ?int $kilometraje, int $id_cliente): ?int {
        try {
            $query = "INSERT INTO " . $this->table_name . " 
                      (placa, marca, modelo, anio, color, kilometraje, id_cliente) 
                      VALUES (:placa, :marca, :modelo, :anio, :color, :kilometraje, :id_cliente)";
            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(':placa', $placa);
            $stmt->bindParam(':marca', $marca);
            $stmt->bindParam(':modelo', $modelo);
            $stmt->bindParam(':anio', $anio, PDO::PARAM_INT);
            $stmt->bindParam(':color', $color);
            $stmt->bindParam(':kilometraje', $kilometraje, PDO::PARAM_INT);
            $stmt->bindParam(':id_cliente', $id_cliente, PDO::PARAM_INT);

            if ($stmt->execute()) {
                return (int) $this->conn->lastInsertId();
            }
            return null;
        } catch (PDOException $e) {
            error_log("Error en Vehiculo::create: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Actualiza un vehículo existente. Tolerancia a fallos controlada por try-catch.
     */
    public function update(int $id, string $placa, string $marca, string $modelo, ?int $anio, ?string $color, ?int $kilometraje, int $id_cliente): bool {
        try {
            $query = "UPDATE " . $this->table_name . " 
                      SET placa = :placa, marca = :marca, modelo = :modelo, anio = :anio, 
                          color = :color, kilometraje = :kilometraje, id_cliente = :id_cliente, updated_at = CURRENT_TIMESTAMP 
                      WHERE id_vehiculo = :id";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':placa', $placa);
            $stmt->bindParam(':marca', $marca);
            $stmt->bindParam(':modelo', $modelo);
            $stmt->bindParam(':anio', $anio, PDO::PARAM_INT);
            $stmt->bindParam(':color', $color);
            $stmt->bindParam(':kilometraje', $kilometraje, PDO::PARAM_INT);
            $stmt->bindParam(':id_cliente', $id_cliente, PDO::PARAM_INT);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error en Vehiculo::update: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Elimina un vehículo por su ID.
     */
    public function delete(int $id): bool {
        try {
            $query = "DELETE FROM " . $this->table_name . " WHERE id_vehiculo = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error en Vehiculo::delete: " . $e->getMessage());
            return false;
        }
    }
}
