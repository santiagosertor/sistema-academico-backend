import pool from '../config/db.js';

// ===============================
// Cursos de un docente
// ===============================
/**
 * Lista los cursos asignados a un docente.
 * - Devuelve id_curso, nombre de la materia y período.
 *
 * Validaciones críticas:
 * - Si ocurre error en la consulta, se retorna 500.
 */
export async function listarCursosDocente(req, res) {
  try {
    const docenteId = req.params.id;
    const [rows] = await pool.query(
      `SELECT c.id_curso, m.nombre_materia, c.periodo
       FROM Curso c
       JOIN Materia m ON c.id_materia = m.id_materia
       WHERE c.id_docente = ?`,
      [docenteId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error cargando cursos' });
  }
}

// ===============================
// Estudiantes de un curso
// ===============================
/**
 * Lista los estudiantes inscritos en un curso.
 * - Devuelve estudiantes con nombre, apellido y documento.
 * - Separa estudiantes con perfil completo e incompleto.
 *
 * Decisión técnica:
 * Se devuelve alerta si hay estudiantes sin nombre o apellido.
 */
export async function listarEstudiantesCurso(req, res) {
  try {
    const cursoId = req.params.id;
    const [rows] = await pool.query(
      `SELECT e.id_estudiante, e.nombre, e.apellido, e.documento
       FROM Estudiante_Curso ec
       JOIN Estudiante e ON ec.id_estudiante = e.id_estudiante
       WHERE ec.id_curso = ?`,
      [cursoId]
    );

    const estudiantesCompletos = rows.filter(e => e.nombre && e.apellido);
    const estudiantesIncompletos = rows.filter(e => !e.nombre || !e.apellido);

    res.json({
      estudiantes: estudiantesCompletos,
      alerta: estudiantesIncompletos.length > 0
        ? `Hay ${estudiantesIncompletos.length} estudiante(s) sin perfil completo`
        : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error cargando estudiantes' });
  }
}

// ===============================
// Guardar nota con porcentajes
// ===============================
/**
 * Guarda o actualiza la nota de un estudiante en un curso y bloque.
 * - Obtiene porcentajes del bloque desde la tabla `Porcentajes_Bloque`.
 * - Calcula promedio ponderado.
 * - Inserta o actualiza registro en la tabla `Nota`.
 *
 * Validaciones críticas:
 * - Si no existen porcentajes para el bloque → 400.
 * - Si ocurre error en la consulta → 500.
 */
export async function guardarNota(req, res) {
  try {
    const cursoId = req.params.id;
    const { id_estudiante, id_bloque, notaQuiz, notaParcial, notaTrabajo } = req.body;

    // Obtener porcentajes del bloque
    const [porcentajes] = await pool.query(
      `SELECT porcentaje_quiz, porcentaje_parcial, porcentaje_trabajo
       FROM Porcentajes_Bloque
       WHERE id_bloque = ?`,
      [id_bloque]
    );

    if (!porcentajes.length) {
      return res.status(400).json({ error: 'No existen porcentajes para este bloque' });
    }

    const { porcentaje_quiz, porcentaje_parcial, porcentaje_trabajo } = porcentajes[0];

    // Calcular promedio ponderado
    const promedio = (
      (notaQuiz * porcentaje_quiz +
       notaParcial * porcentaje_parcial +
       notaTrabajo * porcentaje_trabajo) / 100
    ).toFixed(2);

    // Insertar o actualizar nota
    await pool.query(
      `INSERT INTO Nota (id_estudiante, id_curso, id_bloque, nota_quiz, nota_parcial, nota_trabajo, promedio_bloque)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         nota_quiz = VALUES(nota_quiz),
         nota_parcial = VALUES(nota_parcial),
         nota_trabajo = VALUES(nota_trabajo),
         promedio_bloque = VALUES(promedio_bloque)`,
      [id_estudiante, cursoId, id_bloque, notaQuiz, notaParcial, notaTrabajo, promedio]
    );

    res.json({ promedio_bloque: promedio, estado: promedio >= 3 ? 'Aprobado' : 'Reprobado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error guardando nota' });
  }
}
// ===============================
// Listar estudiantes disponibles
// ===============================
/**
 * Lista todos los estudiantes disponibles.
 * - Devuelve nombre, apellido y documento.
 * - Si faltan datos, se reemplaza con "SIN NOMBRE" o "SIN APELLIDO".
 *
 * Decisión técnica:
 * Se usa `COALESCE` para evitar valores nulos en la respuesta.
 */
export async function listarEstudiantesDisponibles(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id_estudiante,
              COALESCE(nombre, 'SIN NOMBRE') AS nombre,
              COALESCE(apellido, 'SIN APELLIDO') AS apellido,
              documento
       FROM Estudiante`
    );

    console.log('Estudiantes disponibles:', rows); // 👈 log de depuración
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error cargando estudiantes disponibles' });
  }
}

// ===============================
// Inscribir estudiante en curso
// ===============================
/**
 * Inscribe un estudiante en un curso.
 * - Inserta registro en la tabla `Estudiante_Curso`.
 *
 * Validaciones críticas:
 * - Si ocurre error en la consulta → 500.
 */
export async function inscribirEstudiante(req, res) {
  try {
    const { idCurso, idEstudiante } = req.params;

    await pool.query(
      `INSERT INTO Estudiante_Curso (id_curso, id_estudiante)
       VALUES (?, ?)`,
      [idCurso, idEstudiante]
    );

    res.json({ message: 'Estudiante inscrito correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error inscribiendo estudiante' });
  }
}