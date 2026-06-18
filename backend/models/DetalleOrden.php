<?php

class DetalleOrden {
    private $conn;
    private $table_name = "detalle_orden";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create(int $id_orden, int $id_item, int $cantidad, float $precio_unitario): ?int {
        try {
            $subtotal = $cantidad * $precio_unitario;
            $query = "INSERT INTO " . $this->table_name . " 
                      (id_orden, id_item, cantidad, precio_unitario, subtotal) 
                      VALUES (:id_orden, :id_item, :cantidad, :precio_unitario, :subtotal)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id_orden', $id_orden, PDO::PARAM_INT);
            $stmt->bindParam(':id_item', $id_item, PDO::PARAM_INT);
            $stmt->bindParam(':cantidad', $cantidad, PDO::PARAM_INT);
            $stmt->bindParam(':precio_unitario', $precio_unitario);
            $stmt->bindParam(':subtotal', $subtotal);

            if ($stmt->execute()) {
                return (int) $this->conn->lastInsertId();
            }
            return null;
        } catch (PDOException $e) {
            error_log("Error en DetalleOrden::create: " . $e->getMessage());
            return null;
        }
    }

    public function update(int $id, int $cantidad, float $precio_unitario): bool {
        try {
            $subtotal = $cantidad * $precio_unitario;
            $query = "UPDATE " . $this->table_name . " 
                      SET cantidad = :cantidad, precio_unitario = :precio_unitario, subtotal = :subtotal
                      WHERE id_detalle = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':cantidad', $cantidad, PDO::PARAM_INT);
            $stmt->bindParam(':precio_unitario', $precio_unitario);
            $stmt->bindParam(':subtotal', $subtotal);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error en DetalleOrden::update: " . $e->getMessage());
            return false;
        }
    }

    public function getByOrden(int $id_orden) {
        try {
            $query = "SELECT d.*, 
                             (d.cantidad * d.precio_unitario) as subtotal,
                             i.codigo as item_codigo, i.nombre as item_nombre, i.tipo as item_tipo
                      FROM " . $this->table_name . " d
                      LEFT JOIN item_catalogo i ON d.id_item = i.id_item
                      WHERE d.id_orden = :id_orden
                      ORDER BY d.created_at ASC";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id_orden', $id_orden, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error en DetalleOrden::getByOrden: " . $e->getMessage());
            return [];
        }
    }

    public function delete(int $id): bool {
        try {
            $query = "DELETE FROM " . $this->table_name . " WHERE id_detalle = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error en DetalleOrden::delete: " . $e->getMessage());
            return false;
        }
    }
}
