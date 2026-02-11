import express from 'express';
import * as estudianteController from '../controllers/estudiante.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * Rutas del módulo Estudiante.
 * Todas las rutas están protegidas con `verificarToken` para garantizar
 * que solo usuarios autenticados puedan acceder a la información.
 *
 * Decisión técnica:
 * Se delega la lógica de negocio al controlador (`estudianteController`)
 * para mantener separación de responsabilidades entre rutas y lógica.
 */

// ===== Perfil =====
/**
 * GET /api/estudiante/perfil
 * - Obtiene el perfil del estudiante autenticado.
 */
router.get('/perfil', verificarToken, estudianteController.getPerfil);

/**
 * PUT /api/estudiante/perfil
 * - Actualiza el perfil del estudiante autenticado.
 */
router.put('/perfil', verificarToken, estudianteController.updatePerfil);

/**
 * GET /api/estudiante/me
 * - Devuelve información básica del estudiante autenticado.
 */
router.get('/me', verificarToken, estudianteController.getMe);

// ===== Cursos =====
/**
 * GET /api/estudiante/:id/cursos
 * - Lista los cursos en los que está inscrito el estudiante.
 */
router.get('/:id/cursos', verificarToken, estudianteController.cursosEstudiante);

// ===== Notas =====
/**
 * GET /api/estudiante/:id/cursos/:idCurso/notas
 * - Devuelve las notas del estudiante en un curso específico.
 */
router.get('/:id/cursos/:idCurso/notas', verificarToken, estudianteController.notasCursoEstudiante);

/**
 * GET /api/estudiante/:id/notas
 * - Devuelve todas las notas del estudiante en un solo endpoint.
 */
router.get('/:id/notas', verificarToken, estudianteController.notasEstudiante);

// ===== Historial =====
/**
 * GET /api/estudiante/:id/historial
 * - Devuelve el historial académico completo del estudiante.
 */
router.get('/:id/historial', verificarToken, estudianteController.historialEstudiante);

export default router;