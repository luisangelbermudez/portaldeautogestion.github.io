-- ============================================================
-- SCRIPT DE BASE DE DATOS
-- Sistema: Portal de Autogestión - Acegrasco S.A.
-- Evidencia: GA7-220501096-AA2-EV01
-- Autor: Grupo 9
-- ============================================================

CREATE DATABASE IF NOT EXISTS acegrasco_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE acegrasco_db;

-- ── Tabla de usuarios (login / registro) ─────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario      INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    correo          VARCHAR(150) NOT NULL UNIQUE,
    contrasena      VARCHAR(255) NOT NULL,       -- hash SHA-256
    rol             ENUM('ADMIN','USUARIO') DEFAULT 'USUARIO',
    activo          BOOLEAN DEFAULT TRUE,
    fecha_registro  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Tabla de solicitudes ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS solicitudes (
    id_solicitud    INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario      INT NOT NULL,
    tipo_solicitud  VARCHAR(100) NOT NULL,
    descripcion     TEXT NOT NULL,
    estado          ENUM('PENDIENTE','EN_PROCESO','RESUELTA','CANCELADA') DEFAULT 'PENDIENTE',
    fecha_creacion  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_solicitud_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- ── Datos iniciales ──────────────────────────────────────────
-- Contraseña admin123456 → SHA-256
INSERT INTO usuarios (nombre_completo, correo, contrasena, rol) VALUES
('Jose Leonardo Triviño',  'jltrivino@acegrasco.com.co', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'ADMIN'),
('Gennifer Silvana',       'gsilvana@acegrasco.com.co',  '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'ADMIN'),
('Richard Acevedo',        'racevedo@acegrasco.com.co',  '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'ADMIN'),
('Nicolas Luna',           'nluna@acegrasco.com.co',     '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'ADMIN');

INSERT INTO usuarios (nombre_completo, correo, contrasena, rol) VALUES
('Julio Cesar Sanchez', 'jcsanchez@acegrasco.com.co',
 '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'USUARIO');

INSERT INTO solicitudes (id_usuario, tipo_solicitud, descripcion, estado) VALUES
(2, 'Certificado laboral', 'Solicito certificado laboral para trámite bancario.', 'PENDIENTE'),
(2, 'Permiso de salida', 'Requiero permiso para salir temprano el viernes 20.', 'EN_PROCESO');
