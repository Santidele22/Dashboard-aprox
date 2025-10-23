-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS sensor_db;

-- Usar la base de datos
USE sensor_db;

-- Crear tabla de movimientos
CREATE TABLE IF NOT EXISTS movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    fecha_hora DATETIME NOT NULL,
    INDEX idx_fecha_hora (fecha_hora)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar datos de prueba (opcional)
INSERT INTO movimientos (descripcion, fecha_hora) VALUES
('Movimiento detectado - Prueba 1', NOW()),
('Movimiento detectado - Prueba 2', NOW() - INTERVAL 1 HOUR),
('Movimiento detectado - Prueba 3', NOW() - INTERVAL 2 HOUR);