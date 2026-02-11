import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

// ================= DOCENTES =================
/**
 * Crear un nuevo docente.
 * - Registra primero un usuario en la tabla `Usuario` con estado activo.
 * - Asigna automáticamente el rol "Docente".
 * - Crea el registro en la tabla `Docente` vinculado al usuario.
 *
 * Validaciones críticas:
 * - Todos los campos son obligatorios.
 * - Se encripta la contraseña con bcrypt antes de guardar.
 * - Se asegura que el rol "Docente" exista en la tabla `Rol`.
 */
export const crearDocente = async (req, res) => {
  const { nombre_usuario, contrasena, correo, nombre, apellido, documento } = req.body;

  if (!nombre_usuario || !contrasena || !correo || !nombre || !apellido || !documento) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    // 1. Crear usuario
    const hash = await bcrypt.hash(contrasena, 10);
    const [userResult] = await pool.query(
      'INSERT INTO Usuario (nombre_usuario, correo, contrasena, estado) VALUES (?, ?, ?, 1)',
      [nombre_usuario, correo, hash]
    );
    const idUsuario = userResult.insertId;

    // 2. Asignar rol Docente
    const [rolRow] = await pool.query('SELECT id_rol FROM Rol WHERE nombre_rol = ?', ['Docente']);
    await pool.query(
      'INSERT INTO Usuario_Rol (id_usuario, id_rol) VALUES (?, ?)',
      [idUsuario, rolRow[0].id_rol]
    );

    // 3. Crear docente vinculado al usuario
    const [docResult] = await pool.query(
      'INSERT INTO Docente (nombre, apellido, documento, correo, id_usuario) VALUES (?, ?, ?, ?, ?)',
      [nombre, apellido, documento, correo, idUsuario]
    );

    res.status(201).json({
      message: 'Docente creado exitosamente',
      id_docente: docResult.insertId,
      id_usuario: idUsuario,
      nombre,
      apellido,
      documento,
      correo
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear docente' });
  }
};

/* ======================================================
   LISTAR DOCENTES
====================================================== */
/**
 * Lista todos los docentes registrados en el sistema.
 */
export const listarDocentes = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Docente');
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al listar docentes' });
  }
};

// ================= MATERIAS =================
/**
 * Crear una nueva materia.
 * - Inserta registro en la tabla `Materia`.
 * - La descripción es opcional.
 *
 * Validaciones críticas:
 * - El nombre de la materia es obligatorio.
 */
export const crearMateria = async (req, res) => {
  const { nombre_materia, descripcion } = req.body;

  if (!nombre_materia) {
    return res.status(400).json({ message: 'El nombre de la materia es obligatorio' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO Materia (nombre_materia, descripcion) VALUES (?, ?)',
      [nombre_materia, descripcion || null]
    );

    res.status(201).json({
      id_materia: result.insertId,
      nombre_materia,
      descripcion
    });
  } catch (error) {
    console.error('Error creando materia:', error.sqlMessage || error.message);
    res.status(500).json({ message: 'Error al crear materia', error: error.sqlMessage || error.message });
  }
};

/**
 * Lista todas las materias registradas en el sistema.
 */
export const listarMaterias = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Materia');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error listando materias:', error.sqlMessage || error.message);
    res.status(500).json({ message: 'Error al listar materias', error: error.sqlMessage || error.message });
  }
};

// ================= CURSOS =================
/**
 * Crear un nuevo curso.
 * - Vincula un docente y una materia a un período específico.
 *
 * Validaciones críticas:
 * - Docente, materia y período son obligatorios.
 */
export const crearCurso = async (req, res) => {
  const { id_docente, id_materia, periodo } = req.body;

  if (!id_docente || !id_materia || !periodo) {
    return res.status(400).json({ message: 'Docente, materia y período son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO Curso (id_docente, id_materia, periodo) VALUES (?, ?, ?)',
      [id_docente, id_materia, periodo]
    );

    res.status(201).json({
      id_curso: result.insertId,
      id_docente,
      id_materia,
      periodo
    });
  } catch (error) {
    console.error('Error creando curso:', error.sqlMessage || error.message);
    res.status(500).json({ message: 'Error al crear curso', error: error.sqlMessage || error.message });
  }
};

/**
 * Lista todos los cursos registrados.
 * - Incluye nombre y apellido del docente, nombre de la materia y período.
 */
export const listarCursos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.id_curso, d.nombre AS nombre_docente, d.apellido AS apellido_docente,
             m.nombre_materia, c.periodo
      FROM Curso c
      INNER JOIN Docente d ON c.id_docente = d.id_docente
      INNER JOIN Materia m ON c.id_materia = m.id_materia
    `);

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error listando cursos:', error.sqlMessage || error.message);
    res.status(500).json({ message: 'Error al listar cursos', error: error.sqlMessage || error.message });
  }
};