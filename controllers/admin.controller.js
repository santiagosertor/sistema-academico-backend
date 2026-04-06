import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

// ================= DOCENTES (CON TRANSACCIONES) =================
export const crearDocente = async (req, res) => {
  const { nombre_usuario, contrasena, correo, nombre, apellido, documento } = req.body;

  if (!nombre_usuario || !contrasena || !correo || !nombre || !apellido || !documento) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  // Obtenemos conexión para la transacción
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Encriptar y Crear usuario
    const hash = await bcrypt.hash(contrasena, 10);
    const [userResult] = await conn.query(
      'INSERT INTO Usuario (nombre_usuario, correo, contrasena, estado) VALUES (?, ?, ?, 1)',
      [nombre_usuario, correo, hash]
    );
    const idUsuario = userResult.insertId;

    // 2. Asignar rol Docente
    const [rolRow] = await conn.query('SELECT id_rol FROM Rol WHERE nombre_rol = ?', ['Docente']);
    if (rolRow.length === 0) throw new Error('Rol Docente no configurado en la BD');

    await conn.query(
      'INSERT INTO Usuario_Rol (id_usuario, id_rol) VALUES (?, ?)',
      [idUsuario, rolRow[0].id_rol]
    );

    // 3. Crear docente vinculado al usuario
    const [docResult] = await conn.query(
      'INSERT INTO Docente (nombre, apellido, documento, correo, id_usuario) VALUES (?, ?, ?, ?, ?)',
      [nombre, apellido, documento, correo, idUsuario]
    );

    // Si todo salió bien, confirmamos cambios
    await conn.commit();

    res.status(201).json({
      message: 'Docente creado exitosamente',
      id_docente: docResult.insertId,
      nombre,
      apellido
    });

  } catch (error) {
    // Si algo falla (ej: documento duplicado), deshacemos todo y el ID no se salta
    await conn.rollback();
    console.error(error);
    res.status(500).json({ message: error.sqlMessage || 'Error al crear docente' });
  } finally {
    conn.release();
  }
};

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
    res.status(500).json({ message: 'Error al crear materia', error: error.sqlMessage });
  }
};

export const listarMaterias = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Materia');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al listar materias' });
  }
};

// ================= CURSOS =================
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
    res.status(500).json({ message: 'Error al crear curso', error: error.sqlMessage });
  }
};

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
    res.status(500).json({ message: 'Error al listar cursos' });
  }
};