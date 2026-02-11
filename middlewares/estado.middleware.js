import pool from '../config/db.js';

/**
 * Middleware para verificar el estado del usuario.
 * - Consulta la base de datos para confirmar que el usuario esté activo.
 * - Bloquea acceso si el usuario no existe o está deshabilitado.
 *
 * Decisión técnica:
 * Se usa `req.usuario` (inyectado previamente por `auth.middleware.js`)
 * para obtener el `id_usuario` desde el token ya validado.
 *
 * Validaciones críticas:
 * - Si no existe `id_usuario` en el token, se retorna 400.
 * - Si el usuario no está en la base de datos, se retorna 404.
 * - Si el estado del usuario es distinto de 1 (activo), se retorna 403.
 * - Si ocurre un error en la consulta, se retorna 500.
 */
export const verificarEstadoUsuario = async (req, res, next) => {
  const idUsuario = req.usuario?.id_usuario;

  // Validación crítica: token sin id_usuario
  if (!idUsuario) {
    return res.status(400).json({ message: 'Usuario no definido en token' });
  }

  try {
    // Consultar estado del usuario en la BD
    const [rows] = await pool.query(
      'SELECT estado FROM Usuario WHERE id_usuario = ?',
      [idUsuario]
    );

    // Validación crítica: usuario no encontrado
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Validación crítica: usuario deshabilitado
    if (rows[0].estado !== 1) {
      return res.status(403).json({ message: 'Usuario deshabilitado' });
    }

    // Usuario válido y activo → continuar
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Error en verificación de estado', error: err });
  }
};