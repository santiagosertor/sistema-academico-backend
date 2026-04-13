import express from 'express';
import {
  crearDocente, listarDocentes,
  crearMateria, listarMaterias,
  crearCurso, listarCursos
} from '../controllers/admin.controller.js';

const router = express.Router();

/**
 * Rutas del módulo Administrador.
 * - Gestiona docentes, materias y cursos.
 * - Todas las rutas delegan la lógica al controlador `admin.controller.js`.
 *
 * Decisión técnica:
 * Se usa `express.Router()` para modularizar las rutas de administración,
 * manteniendo el código organizado y separado del resto de la aplicación.
 */

// ===== Docentes =====
/**
 * POST /api/admin/docentes
 * - Registra un nuevo docente en el sistema.
 */
router.post('/docentes', crearDocente);

/**
 * GET /api/admin/docentes
 * - Lista todos los docentes registrados.
 */
router.get('/docentes', listarDocentes);

// ===== Materias =====
/**
 * POST /api/admin/materias
 * - Crea una nueva materia en el sistema.
 */
router.post('/materias', crearMateria);

/**
 * GET /api/admin/materias
 * - Lista todas las materias registradas.
 */
router.get('/materias', listarMaterias);

// ===== Cursos (Asignación) =====
/**
 * POST /api/admin/cursos
 * - Crea un nuevo curso asignando materia y docente.
 */
router.post('/cursos', crearCurso);

/**
 * GET /api/admin/cursos
 * - Lista todos los cursos disponibles en el sistema.
 */
router.get('/cursos', listarCursos);

export default router;