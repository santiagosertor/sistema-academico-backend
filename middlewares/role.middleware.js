/**
 * Middleware para control de acceso basado en roles.
 * - Recibe una lista de roles permitidos.
 * - Verifica si el usuario autenticado (inyectado en `req.usuario` por `auth.middleware.js`)
 *   tiene al menos uno de los roles requeridos.
 *
 * Decisión técnica:
 * Se implementa como función de orden superior (higher-order function),
 * que devuelve un middleware configurado dinámicamente según los roles permitidos.
 *
 * Validaciones críticas:
 * - Si no existen roles en el token, se retorna 403.
 * - Si el usuario no posee ninguno de los roles requeridos, se retorna 403.
 * - Si cumple con los roles, se permite continuar con la ejecución de la ruta.
 */
export const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    const rolesUsuario = req.usuario?.roles;

    // Validación crítica: token sin roles
    if (!rolesUsuario) {
      return res.status(403).json({ message: 'Roles no encontrados en token' });
    }

    // Verificar autorización: al menos un rol permitido debe coincidir
    const autorizado = rolesPermitidos.some(r => rolesUsuario.includes(r));

    if (!autorizado) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Usuario autorizado → continuar
    next();
  };
};