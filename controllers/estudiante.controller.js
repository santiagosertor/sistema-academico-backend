import pool from '../config/db.js';

// ===============================
// OBTENER PERFIL
// ===============================
/**
 * Obtiene el perfil completo del estudiante autenticado.
 * - Devuelve id_estudiante, nombre, apellido, documento y correo.
 *
 * Validaciones críticas:
 * - Si no existe perfil → 404.
 * - Si ocurre error en la consulta → 500.
 */
export async function getPerfil(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id_estudiante, nombre, apellido, documento, correo
       FROM Estudiante
       WHERE id_usuario = ?`,
      [req.usuario.id_usuario]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error en getPerfil:', err);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
}

// ===============================
// ACTUALIZAR PERFIL
// ===============================
/**
 * Actualiza el perfil del estudiante autenticado.
 * - Permite modificar nombre, apellido y documento.
 *
 * Validaciones críticas:
 * - Todos los campos son obligatorios.
 * - Si no se encuentra el estudiante → 404.
 */
export async function updatePerfil(req, res) {
  const { nombre, apellido, documento } = req.body;

  if (!nombre || !apellido || !documento) {
    return res.status(400).json({
      error: 'Nombre, apellido y documento son obligatorios'
    });
  }

  try {
    const [result] = await pool.query(
      `UPDATE Estudiante
       SET nombre = ?, apellido = ?, documento = ?
       WHERE id_usuario = ?`,
      [nombre, apellido, documento, req.usuario.id_usuario]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    res.json({ message: 'Perfil actualizado correctamente' });
  } catch (err) {
    console.error('Error en updatePerfil:', err);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
}

// ===============================
// DATOS MÍNIMOS (DASHBOARD)
// ===============================
/**
 * Devuelve datos básicos del estudiante para el dashboard.
 * - Incluye id_estudiante, nombre, apellido, documento y correo.
 *
 * Decisión técnica:
 * Se devuelve id_estudiante como clave para relacionar cursos, notas e historial.
 */
export async function getMe(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id_estudiante, nombre, apellido, documento, correo
       FROM Estudiante
       WHERE id_usuario = ?`,
      [req.usuario.id_usuario]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    res.json({
      id_estudiante: rows[0].id_estudiante, // 👈 clave para cursos/notas/historial
      nombre: rows[0].nombre || '',
      apellido: rows[0].apellido || '',
      documento: rows[0].documento || '',
      correo: rows[0].correo || ''
    });
  } catch (err) {
    console.error('Error en getMe:', err);
    res.status(500).json({ error: 'Error al obtener estudiante' });
  }
}

// ===============================
// Cursos inscritos
// ===============================
/**
 * Lista los cursos en los que está inscrito un estudiante.
 * - Devuelve id_curso, nombre de la materia y período.
 */
export async function cursosEstudiante(req, res) {
  const { id } = req.params;
  const [rows] = await pool.query(
    `SELECT c.id_curso, m.nombre_materia, c.periodo
     FROM Estudiante_Curso ec
     JOIN Curso c ON ec.id_curso = c.id_curso
     JOIN Materia m ON c.id_materia = m.id_materia
     WHERE ec.id_estudiante = ?`,
    [id]
  );
  res.json(rows);
}

// ===============================
// Notas de un curso específico
// ===============================
/**
 * Devuelve las notas de un estudiante en un curso específico.
 * - Incluye notas de quiz, parcial, trabajo y promedio por bloque.
 */
export async function notasCursoEstudiante(req, res) {
  const { id, idCurso } = req.params;
  const [rows] = await pool.query(
    `SELECT b.nombre_bloque, n.nota_quiz, n.nota_parcial, n.nota_trabajo, n.promedio_bloque
     FROM Nota n
     JOIN Bloque_Evaluacion b ON n.id_bloque = b.id_bloque
     WHERE n.id_estudiante = ? AND n.id_curso = ?`,
    [id, idCurso]
  );
  res.json(rows);
}

// ===============================
// Todas las notas del estudiante
// ===============================
/**
 * Devuelve todas las notas del estudiante en todos sus cursos.
 * - Incluye estado (Aprobado/Reprobado) según promedio_bloque.
 */
export async function notasEstudiante(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT m.nombre_materia, b.nombre_bloque,
              n.nota_quiz, n.nota_parcial, n.nota_trabajo, n.promedio_bloque,
              CASE WHEN n.promedio_bloque >= 3 THEN 'Aprobado' ELSE 'Reprobado' END AS estado
       FROM Nota n
       JOIN Curso c ON n.id_curso = c.id_curso
       JOIN Materia m ON c.id_materia = m.id_materia
       JOIN Bloque_Evaluacion b ON n.id_bloque = b.id_bloque
       WHERE n.id_estudiante = ?`,
      [id]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error en notasEstudiante:', err);
    res.status(500).json({ error: 'Error al obtener notas' });
  }
}

// ===============================
// Historial académico
// ===============================
/**
 * Devuelve el historial académico del estudiante.
 * - Calcula promedio final por curso.
 * - Incluye estado (Aprobado/Reprobado).
 *
 * Decisión técnica:
 * Se usa `AVG(promedio_bloque)` agrupado por curso.
 */
export async function historialEstudiante(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT m.nombre_materia, c.periodo,
              CAST(AVG(n.promedio_bloque) AS DECIMAL(5,2)) AS promedio_final,
              CASE WHEN AVG(n.promedio_bloque) >= 3 THEN 'Aprobado' ELSE 'Reprobado' END AS estado
       FROM Nota n
       JOIN Curso c ON n.id_curso = c.id_curso
       JOIN Materia m ON c.id_materia = m.id_materia
       WHERE n.id_estudiante = ?
       GROUP BY c.id_curso`,
      [id]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error en historialEstudiante:', err);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
}