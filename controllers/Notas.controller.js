import pool from '../config/db.js';

// ===============================
// Guardar nota de un estudiante en un bloque
// ===============================
/**
 * Guarda una nota para un estudiante en un curso y bloque específico.
 * - Inserta registro en la tabla `Nota`.
 * - Incluye notas de quiz, parcial, trabajo y promedio del bloque.
 *
 * Validaciones críticas:
 * - Estudiante, curso y bloque son obligatorios.
 * - Si ocurre error en la consulta → 500.
 */
export const guardarNota = async (req, res) => {
  const { id_estudiante, id_curso, id_bloque, nota_quiz, nota_parcial, nota_trabajo, promedio_bloque } = req.body;

  if (!id_estudiante || !id_curso || !id_bloque) {
    return res.status(400).json({ message: 'Estudiante, curso y bloque son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO Nota (id_estudiante, id_curso, id_bloque, nota_quiz, nota_parcial, nota_trabajo, promedio_bloque)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_estudiante, id_curso, id_bloque, nota_quiz, nota_parcial, nota_trabajo, promedio_bloque]
    );

    res.status(201).json({
      id_nota: result.insertId,
      id_estudiante,
      id_curso,
      id_bloque,
      nota_quiz,
      nota_parcial,
      nota_trabajo,
      promedio_bloque
    });
  } catch (error) {
    console.error('Error guardando nota:', error.sqlMessage || error.message);
    res.status(500).json({ message: 'Error al guardar nota', error: error.sqlMessage || error.message });
  }
};

// ===============================
// Listar notas de un estudiante en un curso
// ===============================
/**
 * Lista todas las notas de un estudiante en un curso específico.
 * - Devuelve notas junto con el nombre del bloque de evaluación.
 */
export const listarNotas = async (req, res) => {
  const { id_estudiante, id_curso } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT n.*, b.nombre_bloque
       FROM Nota n
       INNER JOIN Bloque_Evaluacion b ON n.id_bloque = b.id_bloque
       WHERE n.id_estudiante = ? AND n.id_curso = ?`,
      [id_estudiante, id_curso]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error listando notas:', error.sqlMessage || error.message);
    res.status(500).json({ message: 'Error al listar notas', error: error.sqlMessage || error.message });
  }
};

// ===============================
// Calcular promedio final del curso
// ===============================
/**
 * Calcula el promedio final de un estudiante en un curso.
 * - Usa el promedio de todos los bloques registrados en la tabla `Nota`.
 * - Devuelve estado "Aprobado" si promedio >= 3.0, de lo contrario "Reprobado".
 *
 * Validaciones críticas:
 * - Si no hay notas registradas → 404.
 * - Si ocurre error en la consulta → 500.
 */
export const promedioFinal = async (req, res) => {
  const { id_estudiante, id_curso } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT AVG(promedio_bloque) AS promedio_final
       FROM Nota
       WHERE id_estudiante = ? AND id_curso = ?`,
      [id_estudiante, id_curso]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No hay notas registradas' });
    }

    const promedio_final = parseFloat(rows[0].promedio_final).toFixed(2);
    const estado = promedio_final >= 3.0 ? 'Aprobado' : 'Reprobado';

    res.status(200).json({ promedio_final, estado });
  } catch (error) {
    console.error('Error calculando promedio final:', error.sqlMessage || error.message);
    res.status(500).json({ message: 'Error al calcular promedio final', error: error.sqlMessage || error.message });
  }
};