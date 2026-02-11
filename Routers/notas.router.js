import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

/* ======================================================
   GUARDAR NOTA DE UN ESTUDIANTE EN UN CURSO Y BLOQUE
   POST /api/notas
====================================================== */
/**
 * Endpoint para guardar una nota de un estudiante en un curso y bloque específico.
 * - Obtiene los porcentajes de evaluación del bloque desde la base de datos.
 * - Calcula el promedio ponderado en base a las notas y porcentajes.
 * - Inserta la nota en la tabla `Nota`.
 *
 * Validaciones críticas:
 * - Si no existen porcentajes para el bloque, se retorna error 400.
 * - Se maneja cualquier error de SQL con respuesta 500.
 *
 * Decisión técnica:
 * Se usa `.toFixed(2)` para asegurar consistencia en el formato del promedio.
 */
router.post('/', async (req, res) => {
  const { id_estudiante, id_curso, id_bloque, nota_quiz, nota_parcial, nota_trabajo } = req.body;

  try {
    // Obtener porcentajes del bloque
    const [porcentajes] = await pool.query(
      `SELECT porcentaje_quiz, porcentaje_parcial, porcentaje_trabajo
       FROM Porcentajes_Bloque
       WHERE id_bloque = ?`,
      [id_bloque]
    );

    if (porcentajes.length === 0) {
      return res.status(400).json({ message: 'No se encontraron porcentajes para el bloque' });
    }

    const { porcentaje_quiz, porcentaje_parcial, porcentaje_trabajo } = porcentajes[0];

    // Calcular promedio ponderado
    const promedio_bloque = (
      (nota_quiz * (porcentaje_quiz / 100)) +
      (nota_parcial * (porcentaje_parcial / 100)) +
      (nota_trabajo * (porcentaje_trabajo / 100))
    ).toFixed(2);

    // Insertar nota en la base de datos
    await pool.query(
      `INSERT INTO Nota (id_estudiante, id_curso, id_bloque, nota_quiz, nota_parcial, nota_trabajo, promedio_bloque)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_estudiante, id_curso, id_bloque, nota_quiz, nota_parcial, nota_trabajo, promedio_bloque]
    );

    res.status(201).json({ message: 'Nota guardada correctamente', promedio_bloque });
  } catch (err) {
    console.error('Error guardando nota:', err.sqlMessage || err.message);
    res.status(500).json({ message: 'Error al guardar nota' });
  }
});

/* ======================================================
   LISTAR NOTAS DE UN ESTUDIANTE EN UN CURSO
   GET /api/notas/:id_estudiante/:id_curso
====================================================== */
/**
 * Endpoint para listar todas las notas de un estudiante en un curso.
 * - Realiza un JOIN con la tabla `Bloque_Evaluacion` para obtener nombres de bloques.
 * - Devuelve notas detalladas por bloque con sus respectivos promedios.
 *
 * Validaciones críticas:
 * - Se maneja cualquier error de SQL con respuesta 500.
 */
router.get('/:id_estudiante/:id_curso', async (req, res) => {
  const { id_estudiante, id_curso } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT n.id_nota, b.nombre_bloque, n.nota_quiz, n.nota_parcial, n.nota_trabajo, n.promedio_bloque
       FROM Nota n
       INNER JOIN Bloque_Evaluacion b ON n.id_bloque = b.id_bloque
       WHERE n.id_estudiante = ? AND n.id_curso = ?`,
      [id_estudiante, id_curso]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error('Error listando notas:', err.sqlMessage || err.message);
    res.status(500).json({ message: 'Error al listar notas' });
  }
});

export default router;