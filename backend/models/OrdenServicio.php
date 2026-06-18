<?php

class OrdenServicio {
    private $conn;
    private $table_name = "orden_servicio";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        try {
            $query = "SELECT o.*,
                             COALESCE((SELECT COALESCE(SUM(d.cantidad * d.precio_unitario), 0) FROM detalle_orden d WHERE d.id_orden = o.id_orden), 0) as total_estimado,
                             v.placa, v.marca, v.modelo, v.id_cliente,
                             c.nombres as cliente_nombre, c.cedula as cliente_cedula,
                             u.nombre as tecnico_nombre
                      FROM " . $this->table_name . " o
                      LEFT JOIN vehiculo v ON o.id_vehiculo = v.id_vehiculo
                      LEFT JOIN cliente c ON v.id_cliente = c.id_cliente
                      LEFT JOIN tecnico t ON o.id_tecnico = t.id_usuario
                      LEFT JOIN usuario u ON t.id_usuario = u.id_usuario
                      ORDER BY o.created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Error en OrdenServicio::getAll: " . $e->getMessage());
            return null;
        }
    }

    public function getById(int $id) {
        try {
            $query = "SELECT o.*,
                             COALESCE((SELECT COALESCE(SUM(d.cantidad * d.precio_unitario), 0) FROM detalle_orden d WHERE d.id_orden = o.id_orden), 0) as total_estimado,
                             v.placa, v.marca, v.modelo, v.anio, v.color, v.id_cliente,
                             c.nombres as cliente_nombre, c.cedula as cliente_cedula, c.telefono as cliente_telefono,
                             u.nombre as tecnico_nombre, u.id_usuario as id_tecnico_usuario
                      FROM " . $this->table_name . " o
                      LEFT JOIN vehiculo v ON o.id_vehiculo = v.id_vehiculo
                      LEFT JOIN cliente c ON v.id_cliente = c.id_cliente
                      LEFT JOIN tecnico t ON o.id_tecnico = t.id_usuario
                      LEFT JOIN usuario u ON t.id_usuario = u.id_usuario
                      WHERE o.id_orden = :id LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error en OrdenServicio::getById: " . $e->getMessage());
            return false;
        }
    }

    public function create(string $numero_orden, int $id_vehiculo, int $id_tecnico, string $motivo_ingreso): ?int {
        try {
            $query = "INSERT INTO " . $this->table_name . " 
                      (numero_orden, id_vehiculo, id_tecnico, motivo_ingreso, estado) 
                      VALUES (:numero_orden, :id_vehiculo, :id_tecnico, :motivo_ingreso, 'Pendiente')";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':numero_orden', $numero_orden);
            $stmt->bindParam(':id_vehiculo', $id_vehiculo, PDO::PARAM_INT);
            $stmt->bindParam(':id_tecnico', $id_tecnico, PDO::PARAM_INT);
            $stmt->bindParam(':motivo_ingreso', $motivo_ingreso);

            if ($stmt->execute()) {
                return (int) $this->conn->lastInsertId();
            }
            return null;
        } catch (PDOException $e) {
            error_log("Error en OrdenServicio::create: " . $e->getMessage());
            return null;
        }
    }

    public function updateState(int $id, string $estado, ?string $diagnostico_tecnico = null): bool {
        try {
            $query = "UPDATE " . $this->table_name . " SET estado = :estado, updated_at = CURRENT_TIMESTAMP";
            if ($diagnostico_tecnico !== null) {
                $query .= ", diagnostico_tecnico = :diagnostico";
            }
            if ($estado === 'Finalizado' || $estado === 'Entregado') {
                $query .= ", fecha_entrega = CURRENT_TIMESTAMP";
            }
            $query .= " WHERE id_orden = :id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':estado', $estado);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            if ($diagnostico_tecnico !== null) {
                $stmt->bindParam(':diagnostico', $diagnostico_tecnico);
            }

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error en OrdenServicio::updateState: " . $e->getMessage());
            return false;
        }
    }

    public function update(int $id, int $id_vehiculo, int $id_tecnico, string $motivo_ingreso, ?string $diagnostico_tecnico): bool {
        try {
            $query = "UPDATE " . $this->table_name . " 
                      SET id_vehiculo = :id_vehiculo, id_tecnico = :id_tecnico, 
                          motivo_ingreso = :motivo_ingreso, updated_at = CURRENT_TIMESTAMP";
            if ($diagnostico_tecnico !== null) {
                $query .= ", diagnostico_tecnico = :diagnostico";
            }
            $query .= " WHERE id_orden = :id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id_vehiculo', $id_vehiculo, PDO::PARAM_INT);
            $stmt->bindParam(':id_tecnico', $id_tecnico, PDO::PARAM_INT);
            $stmt->bindParam(':motivo_ingreso', $motivo_ingreso);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            if ($diagnostico_tecnico !== null) {
                $stmt->bindParam(':diagnostico', $diagnostico_tecnico);
            }

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error en OrdenServicio::update: " . $e->getMessage());
            return false;
        }
    }

    public function delete(int $id): bool {
        try {
            $query = "DELETE FROM " . $this->table_name . " WHERE id_orden = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error en OrdenServicio::delete: " . $e->getMessage());
            return false;
        }
    }

    public function getNextNumber(): string {
        try {
            $prefix = 'ORD-' . date('Ymd') . '-';
            $query = "SELECT numero_orden FROM " . $this->table_name . "
                      WHERE numero_orden LIKE :prefix
                      ORDER BY numero_orden DESC LIMIT 1";
            $likePrefix = $prefix . '%';
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':prefix', $likePrefix);
            $stmt->execute();
            $last = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($last) {
                $parts = explode('-', $last['numero_orden']);
                $nextNum = (int) end($parts) + 1;
                return $prefix . str_pad($nextNum, 3, '0', STR_PAD_LEFT);
            }
            return $prefix . '001';
        } catch (PDOException $e) {
            error_log("Error en OrdenServicio::getNextNumber: " . $e->getMessage());
            return 'ORD-' . date('Ymd') . '-001';
        }
    }
}
