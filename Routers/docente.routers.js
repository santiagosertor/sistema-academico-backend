import express from 'express';
import {
  listarCursosDocente,
  listarEstudiantesCurso,
  guardarNota,
  listarEstudiantesDisponibles,
  inscribirEstudiante
} from '../controllers/docente.controller.js';

const router = express.Router();

/**
 * Rutas del módulo Docente.
 * - Gestiona cursos, estudiantes inscritos y notas.
 * - Todas las rutas delegan la lógica al controlador `docente.controller.js`.
 *
 * Decisión técnica:
 * Se mantiene separación de responsabilidades: el router define endpoints,
 * mientras que el controlador implementa la lógica de negocio.
 */

// ===== Cursos =====
/**
 * GET /api/docente/:id/cursos
 * - Lista los cursos asignados a un docente específico.
 */
router.get('/:id/cursos', listarCursosDocente);

// ===== Estudiantes de un curso =====
/**
 * GET /api/docente/cursos/:id/estudiantes
 * - Lista los estudiantes inscritos en un curso específico.
 */
router.get('/cursos/:id/estudiantes', listarEstudiantesCurso);

// ===== Guardar nota =====
/**
 * POST /api/docente/cursos/:id/notas
 * - Permite al docente guardar notas de un estudiante en un curso.
 */
router.post('/cursos/:id/notas', guardarNota);

// ===== Estudiantes disponibles =====
/**
 * GET /api/docente/estudiantes/disponibles
 * - Lista estudiantes que aún no están inscritos en cursos.
 */
router.get('/estudiantes/disponibles', listarEstudiantesDisponibles);

// ===== Inscribir estudiante =====
/**
 * POST /api/docente/cursos/:idCurso/estudiantes/:idEstudiante
 * - Inscribe un estudiante en un curso específico.
 */
router.post('/cursos/:idCurso/estudiantes/:idEstudiante', inscribirEstudiante);

export default router;