-- ================================================
-- MIGRACIÓN A MYSQL - SISTEMA DE GESTIÓN DE TALLER (MODELO UNIFICADO)
-- ================================================

DROP TABLE IF EXISTS detalle_orden;
DROP TABLE IF EXISTS orden_servicio;
DROP TABLE IF EXISTS item_catalogo;
DROP TABLE IF EXISTS vehiculo;
DROP TABLE IF EXISTS usuario;

-- =========================
-- TABLA: USUARIO (Unificada)
-- =========================
CREATE TABLE usuario (
    id_usuario    INT AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(150) NOT NULL,
    correo        VARCHAR(150) UNIQUE NOT NULL,
    password      VARCHAR(200) NOT NULL,
    rol           ENUM('Admin', 'Tecnico', 'Cliente') NOT NULL,
    
    -- Campos para Perfil de Cliente / Identificación
    cedula        VARCHAR(20) UNIQUE,
    telefono      VARCHAR(30),
    direccion     VARCHAR(200),
    
    -- Campos para Perfil de Técnico (Corregido)
    especialidad  VARCHAR(100),
    disponibilidad ENUM('Disponible', 'Ocupado', 'No Disponible') DEFAULT 'Disponible',
    
    estado_cuenta BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- TABLA: VEHICULO
-- =========================
CREATE TABLE vehiculo (
    id_vehiculo  INT AUTO_INCREMENT PRIMARY KEY,
    placa        VARCHAR(20) UNIQUE NOT NULL,
    marca        VARCHAR(50) NOT NULL,
    modelo       VARCHAR(50) NOT NULL,
    anio         INT,
    color        VARCHAR(30),
    kilometraje  INT DEFAULT 0,
    id_usuario   INT NOT NULL, -- Apunta al usuario con rol 'Cliente'
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehiculo_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- =========================
-- TABLA: ITEM_CATALOGO 
-- =========================
CREATE TABLE item_catalogo (
    id_item      INT AUTO_INCREMENT PRIMARY KEY,
    codigo       VARCHAR(30) UNIQUE NOT NULL,
    nombre       VARCHAR(150) NOT NULL,
    tipo         ENUM('Repuesto', 'ManoObra') NOT NULL,
    precio_base  DECIMAL(10,2) NOT NULL,
    stock        INT DEFAULT 0,
    activo       BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABLA: ORDEN_SERVICIO
-- =========================
CREATE TABLE orden_servicio (
    id_orden            INT AUTO_INCREMENT PRIMARY KEY,
    numero_orden        VARCHAR(30) UNIQUE NOT NULL, 
    fecha_ingreso       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado              ENUM('Pendiente', 'En Proceso', 'Finalizado', 'Entregado', 'Cancelado') DEFAULT 'Pendiente',
    total_estimado      DECIMAL(10,2) DEFAULT 0,
    id_vehiculo         INT NOT NULL,
    id_tecnico          INT NOT NULL, -- Apunta al usuario con rol 'Tecnico'
    CONSTRAINT fk_orden_vehiculo FOREIGN KEY (id_vehiculo) REFERENCES vehiculo(id_vehiculo),
    CONSTRAINT fk_orden_tecnico FOREIGN KEY (id_tecnico) REFERENCES usuario(id_usuario)
);

-- =========================
-- TABLA: DETALLE_ORDEN
-- =========================
CREATE TABLE detalle_orden (
    id_detalle       INT AUTO_INCREMENT PRIMARY KEY,
    id_orden         INT NOT NULL,
    id_item          INT NOT NULL,
    cantidad         INT NOT NULL,
    precio_unitario  DECIMAL(10,2) NOT NULL,
    subtotal         DECIMAL(10,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_detalle_orden FOREIGN KEY (id_orden) REFERENCES orden_servicio(id_orden) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_item FOREIGN KEY (id_item) REFERENCES item_catalogo(id_item)
);

-- ================================================
-- TRIGGERS (Cálculo Automático)
-- ================================================
DELIMITER //

-- Calcular subtotal antes de insertar
CREATE TRIGGER trg_subtotal_insert BEFORE INSERT ON detalle_orden
FOR EACH ROW SET NEW.subtotal = NEW.cantidad * NEW.precio_unitario; //

-- Actualizar Total de Orden y Stock tras insertar detalle
CREATE TRIGGER trg_after_insert_detalle AFTER INSERT ON detalle_orden
FOR EACH ROW BEGIN
    UPDATE orden_servicio SET total_estimado = (SELECT SUM(subtotal) FROM detalle_orden WHERE id_orden = NEW.id_orden) WHERE id_orden = NEW.id_orden;
    UPDATE item_catalogo SET stock = stock - NEW.cantidad WHERE id_item = NEW.id_item AND tipo = 'Repuesto';
END //

DELIMITER ;

-- ================================================
-- DATOS DE PRUEBA
-- ================================================
INSERT INTO usuario (nombre, correo, password, rol, cedula) VALUES 
('Admin General', 'admin@taller.com', 'hash_seguro', 'Admin', '0000000000'),
('Juan Mecánico', 'tecnico@taller.com', 'hash_seguro', 'Tecnico', '1111111111'),
('Pedro Cliente', 'cliente@taller.com', 'hash_seguro', 'Cliente', '1234567890');

INSERT INTO vehiculo (placa, marca, modelo, id_usuario) VALUES ('ABC-1234', 'Toyota', 'Corolla', 3);
INSERT INTO item_catalogo (codigo, nombre, tipo, precio_base, stock) VALUES ('R001', 'Filtro Aceite', 'Repuesto', 15.00, 100);