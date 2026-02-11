import { Router } from 'express';
import { register, login, refreshToken } from '../controllers/auth.controller.js';

const router = Router();

/**
 * Rutas del módulo de Autenticación.
 * - Gestiona registro, inicio de sesión y refresco de tokens.
 * - Todas las rutas delegan la lógica al controlador `auth.controller.js`.
 *
 * Decisión técnica:
 * Se usa `Router()` de Express para modularizar las rutas de autenticación,
 * manteniendo el código organizado y separado del resto de la aplicación.
 */

// ===== Registro =====
/**
 * POST /api/auth/register
 * - Registra un nuevo usuario en el sistema.
 */
router.post('/register', register);

// ===== Login =====
/**
 * POST /api/auth/login
 * - Autentica al usuario y devuelve tokens de acceso y refresco.
 */
router.post('/login', login);

// ===== Refresh Token =====
/**
 * POST /api/auth/refreshToken
 * - Genera un nuevo accessToken usando el refreshToken válido.
 */
router.post('/refreshToken', refreshToken);

export default router;