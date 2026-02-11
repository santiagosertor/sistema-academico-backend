import express from 'express';
import pool from '../config/db.js'; // conexión MySQL

const router = express.Router();

/* ======================================================
   CREAR NUEVO DOCENTE
   POST /api/materias/docentes
====================================================== */
/**
 * Endpoint para registrar un nuevo docente.
 * - Recibe datos básicos del docente desde el body de la petición.
 * - Inserta el registro en la tabla `Docente`.
 * - Devuelve el objeto creado con su nuevo `id_docente`.
 *
 * Validaciones críticas:
 * - Si ocurre un error en la consulta SQL, se retorna status 500.
 *
 * Decisión técnica:
 * Se usa `pool.query` con placeholders (?) para prevenir inyección SQL.
 */
router.post('/docentes', (req, res) => {
  const { nombre, apellido, documento, correo } = req.body;
  pool.query(
    'INSERT INTO Docente (nombre, apellido, documento, correo) VALUES (?, ?, ?, ?)',
    [nombre, apellido, documento, correo],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id_docente: result.insertId, nombre, apellido, documento, correo });
    }
  );
});

/* ======================================================
   LISTAR DOCENTES
   GET /api/materias/docentes
====================================================== */
/**
 * Endpoint para listar todos los docentes registrados.
 * - Consulta la tabla `Docente` y devuelve todos los registros.
 *
 * Validaciones críticas:
 * - Si ocurre un error en la consulta SQL, se retorna status 500.
 *
 * Decisión técnica:
 * Se devuelve directamente el array de filas para simplicidad,
 * permitiendo que el frontend renderice la lista completa.
 */
router.get('/docentes', (req, res) => {
  pool.query('SELECT * FROM Docente', (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
});

export default router;