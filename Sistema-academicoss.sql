-- ================================================
--   CREACIÓN DE BASE DE DATOS
-- ================================================
CREATE DATABASE IF NOT EXISTS sistema_academico;
USE sistema_academico;
CREATE USER 'admin2'@'localhost' IDENTIFIED BY 'admin12345';
GRANT ALL PRIVILEGES ON sistema_academico.* TO 'admin2'@'localhost';
FLUSH PRIVILEGES;
-- ================================================
--   TABLAS DE SEGURIDAD (USUARIOS, ROLES, PERMISOS)
-- ================================================

-- USUARIO
CREATE TABLE Usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    correo VARCHAR(100) UNIQUE,
    estado TINYINT DEFAULT 1
);

SELECT * FROM Usuario;
SELECT * FROM Usuario_Rol;
select*from rol;
select*from permiso;
select *from Rol_Permiso;
SELECT * FROM Docente;
SELECT * FROM Materia;
SELECT * FROM Estudiante;
SELECT * FROM Nota;
SELECT * FROM Bloque_Evaluacion;
SELECT * FROM Porcentajes_Bloque;
SELECT c.id_curso,
       d.nombre AS nombre_docente,
       d.apellido AS apellido_docente,
       m.nombre_materia,
       c.periodo
FROM Curso c
INNER JOIN Docente d ON c.id_docente = d.id_docente
INNER JOIN Materia m ON c.id_materia = m.id_materia;

SELECT 
    c.id_curso,
    c.id_materia,
    m.nombre_materia,
    c.periodo,
    e.id_estudiante,
    e.nombre AS nombre_estudiante,
    e.apellido AS apellido_estudiante
FROM Estudiante_Curso ec
JOIN Curso c ON ec.id_curso = c.id_curso
JOIN Materia m ON c.id_materia = m.id_materia
JOIN Estudiante e ON ec.id_estudiante = e.id_estudiante;

-- ROL
CREATE TABLE Rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO Rol (nombre_rol) VALUES
  ('Administrador'),
  ('Docente'),
  ('Estudiante');

-- PERMISO
CREATE TABLE Permiso (
    id_permiso INT AUTO_INCREMENT PRIMARY KEY,
    nombre_permiso VARCHAR(100) NOT NULL UNIQUE
);

-- USUARIO_ROL (RELACIÓN N–M)
CREATE TABLE Usuario_Rol (
    id_usuario INT,
    id_rol INT,
    PRIMARY KEY (id_usuario, id_rol),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_rol) REFERENCES Rol(id_rol)
);

-- ROL_PERMISO (RELACIÓN N–M)
CREATE TABLE Rol_Permiso (
    id_rol INT,
    id_permiso INT,
    PRIMARY KEY (id_rol, id_permiso),
    FOREIGN KEY (id_rol) REFERENCES Rol(id_rol),
    FOREIGN KEY (id_permiso) REFERENCES Permiso(id_permiso)
);

-- ================================================
--   TABLAS ACADÉMICAS
-- ================================================

-- ESTUDIANTE
CREATE TABLE Estudiante (
    id_estudiante INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    documento VARCHAR(20) UNIQUE NOT NULL,
    correo VARCHAR(120)
);

-- DOCENTE
CREATE TABLE Docente (
    id_docente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    documento VARCHAR(20) UNIQUE NOT NULL,
    correo VARCHAR(120)
);

-- MATERIA
CREATE TABLE Materia (
    id_materia INT AUTO_INCREMENT PRIMARY KEY,
    nombre_materia VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

-- CURSO (asignación docente + materia + período)
CREATE TABLE Curso (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    id_docente INT NOT NULL,
    id_materia INT NOT NULL,
    periodo VARCHAR(20) NOT NULL,
    FOREIGN KEY (id_docente) REFERENCES Docente(id_docente),
    FOREIGN KEY (id_materia) REFERENCES Materia(id_materia)
);

-- ESTUDIANTE_CURSO (matrícula)
CREATE TABLE Estudiante_Curso (
    id_estudiante INT,
    id_curso INT,
    PRIMARY KEY (id_estudiante, id_curso),
    FOREIGN KEY (id_estudiante) REFERENCES Estudiante(id_estudiante),
    FOREIGN KEY (id_curso) REFERENCES Curso(id_curso)
);

-- BLOQUE DE EVALUACIÓN (Bloque 1, 2, 3)
CREATE TABLE Bloque_Evaluacion (
    id_bloque INT AUTO_INCREMENT PRIMARY KEY,
    nombre_bloque VARCHAR(20) NOT NULL,
    descripcion VARCHAR(200)
);
INSERT INTO Bloque_Evaluacion (nombre_bloque, descripcion)
VALUES 
  ('Bloque 1', 'Primer corte de notas'),
  ('Bloque 2', 'Segundo corte de notas'),
  ('Bloque 3', 'Tercer corte de notas');

-- PORCENTAJES POR BLOQUE (quiz, parcial, trabajo)
CREATE TABLE Porcentajes_Bloque (
    id_porcentaje INT AUTO_INCREMENT PRIMARY KEY,
    id_bloque INT NOT NULL,
    porcentaje_quiz DECIMAL(5,2) NOT NULL,
    porcentaje_parcial DECIMAL(5,2) NOT NULL,
    porcentaje_trabajo DECIMAL(5,2) NOT NULL,
    FOREIGN KEY (id_bloque) REFERENCES Bloque_Evaluacion(id_bloque)
);
-- Poblar Porcentajes por Bloque
INSERT INTO Porcentajes_Bloque (id_bloque, porcentaje_quiz, porcentaje_parcial, porcentaje_trabajo)
VALUES
  (1, 20, 50, 30),  -- Bloque 1: Quiz 20%, Parcial 50%, Trabajo 30%
  (2, 25, 50, 25),  -- Bloque 2: Quiz 25%, Parcial 50%, Trabajo 25%
  (3, 30, 40, 30);  -- Bloque 3: Quiz 30%, Parcial 40%, Trabajo 30%


-- NOTAS
CREATE TABLE Nota (
    id_nota INT AUTO_INCREMENT PRIMARY KEY,
    id_estudiante INT NOT NULL,
    id_curso INT NOT NULL,
    id_bloque INT NOT NULL,
    nota_quiz DECIMAL(5,2),
    nota_parcial DECIMAL(5,2),
    nota_trabajo DECIMAL(5,2),
    promedio_bloque DECIMAL(5,2),
    FOREIGN KEY (id_estudiante) REFERENCES Estudiante(id_estudiante),
    FOREIGN KEY (id_curso) REFERENCES Curso(id_curso),
    FOREIGN KEY (id_bloque) REFERENCES Bloque_Evaluacion(id_bloque)
);
