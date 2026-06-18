<?php

class Reporte {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getHistorialVehiculos() {
        try {
            $query = "SELECT v.*, c.nombres as cliente_nombre, c.cedula as cliente_cedula,
                             (SELECT COUNT(*) FROM orden_servicio o WHERE o.id_vehiculo = v.id_vehiculo) as total_ordenes,
                             (SELECT COUNT(*) FROM orden_servicio o WHERE o.id_vehiculo = v.id_vehiculo AND o.estado IN ('Finalizado', 'Entregado')) as ordenes_completadas,
                             (SELECT COALESCE(SUM(d.cantidad * d.precio_unitario), 0) FROM orden_servicio o JOIN detalle_orden d ON o.id_orden = d.id_orden WHERE o.id_vehiculo = v.id_vehiculo) as total_gastado
                      FROM vehiculo v
                      LEFT JOIN cliente c ON v.id_cliente = c.id_cliente
                      ORDER BY c.nombres ASC, v.placa ASC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error en Reporte::getHistorialVehiculos: " . $e->getMessage());
            return [];
        }
    }

    public function getHistorialByVehiculo(int $id_vehiculo) {
        try {
            $query = "SELECT v.*, c.nombres as cliente_nombre, c.cedula as cliente_cedula, c.telefono as cliente_telefono
                      FROM vehiculo v
                      LEFT JOIN cliente c ON v.id_cliente = c.id_cliente
                      WHERE v.id_vehiculo = :id
                      LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id_vehiculo, PDO::PARAM_INT);
            $stmt->execute();
            $vehiculo = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$vehiculo) return null;

            $query2 = "SELECT o.*,
                              (SELECT COUNT(*) FROM detalle_orden d WHERE d.id_orden = o.id_orden) as total_items,
                              (SELECT COALESCE(SUM(d.cantidad * d.precio_unitario), 0) FROM detalle_orden d WHERE d.id_orden = o.id_orden) as total_estimado,
                              u.nombre as tecnico_nombre
                       FROM orden_servicio o
                       LEFT JOIN tecnico t ON o.id_tecnico = t.id_usuario
                       LEFT JOIN usuario u ON t.id_usuario = u.id_usuario
                       WHERE o.id_vehiculo = :id_vehiculo
                       ORDER BY o.created_at DESC";
            $stmt2 = $this->conn->prepare($query2);
            $stmt2->bindParam(':id_vehiculo', $id_vehiculo, PDO::PARAM_INT);
            $stmt2->execute();
            $vehiculo['ordenes'] = $stmt2->fetchAll(PDO::FETCH_ASSOC);

            return $vehiculo;
        } catch (PDOException $e) {
            error_log("Error en Reporte::getHistorialByVehiculo: " . $e->getMessage());
            return null;
        }
    }

    public function getReporteGeneral(?string $desde = null, ?string $hasta = null) {
        try {
            $where = '';
            $params = [];
            if ($desde && $hasta) {
                $where = 'WHERE o.created_at BETWEEN :desde AND :hasta';
                $params[':desde'] = $desde . ' 00:00:00';
                $params[':hasta'] = $hasta . ' 23:59:59';
            }

            $query1 = "SELECT 
                          COUNT(*) as total_ordenes,
                          SUM(CASE WHEN o.estado IN ('Finalizado', 'Entregado') THEN 1 ELSE 0 END) as ordenes_completadas,
                          SUM(CASE WHEN o.estado = 'Pendiente' THEN 1 ELSE 0 END) as ordenes_pendientes,
                          SUM(CASE WHEN o.estado = 'En Proceso' THEN 1 ELSE 0 END) as ordenes_en_proceso,
                          SUM(CASE WHEN o.estado = 'Cancelado' THEN 1 ELSE 0 END) as ordenes_canceladas,
                          COALESCE(SUM(CASE WHEN o.estado IN ('Finalizado', 'Entregado') 
                              THEN (SELECT COALESCE(SUM(d.cantidad * d.precio_unitario), 0) FROM detalle_orden d WHERE d.id_orden = o.id_orden) 
                              ELSE 0 END), 0) as ingresos_totales
                       FROM orden_servicio o
                       $where";
            $stmt1 = $this->conn->prepare($query1);
            $stmt1->execute($params);
            $resumen = $stmt1->fetch(PDO::FETCH_ASSOC);

            // Add per-vehicle revenue breakdown
            $query2 = "SELECT v.id_vehiculo, v.placa, v.marca, v.modelo,
                              c.nombres as cliente_nombre,
                              COUNT(o.id_orden) as ordenes,
                              COALESCE(SUM(d_sub.total_orden), 0) as total
                       FROM vehiculo v
                       LEFT JOIN cliente c ON v.id_cliente = c.id_cliente
                       LEFT JOIN orden_servicio o ON o.id_vehiculo = v.id_vehiculo
                       LEFT JOIN (
                           SELECT id_orden, SUM(cantidad * precio_unitario) as total_orden
                           FROM detalle_orden
                           GROUP BY id_orden
                       ) d_sub ON o.id_orden = d_sub.id_orden
                       $where
                       GROUP BY v.id_vehiculo, v.placa, v.marca, v.modelo, c.nombres
                       HAVING ordenes > 0
                       ORDER BY total DESC";
            $stmt2 = $this->conn->prepare($query2);
            $stmt2->execute($params);
            $vehiculos = $stmt2->fetchAll(PDO::FETCH_ASSOC);

            $resumen['vehiculos'] = $vehiculos;
            return $resumen;
        } catch (PDOException $e) {
            error_log("Error en Reporte::getReporteGeneral: " . $e->getMessage());
            return null;
        }
    }
}
