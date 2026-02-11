import jwt from 'jsonwebtoken';

/**
 * Middleware para verificar el token JWT en las rutas protegidas.
 * - Extrae el token desde el header `Authorization`.
 * - Valida el token usando la clave secreta definida en `.env`.
 * - Normaliza el objeto `req.usuario` con id_usuario y roles.
 *
 * Decisión técnica:
 * Se usa `jwt.verify` para validar la firma y decodificar el payload.
 * Esto asegura que el token no haya sido manipulado y que provenga
 * de una fuente confiable.
 *
 * Validaciones críticas:
 * - Si no se envía token, se retorna 401.
 * - Si el token es inválido o no puede verificarse, se retorna 401.
 * - Se asegura que siempre exista `req.usuario` con propiedades mínimas.
 */
export const verificarToken = (req, res, next) => {
  const auth = req.headers.authorization;

  // Validación crítica: si no hay header Authorization, rechazar
  if (!auth) {
    return res.status(401).json({ message: 'Token no enviado' });
  }

  // Extraer token del formato "Bearer <token>"
  const token = auth.split(' ')[1];

  try {
    // Verificar y decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Payload del token:', decoded); // 👀 Log para depuración

    // Normalizar siempre el objeto usuario en la request
    req.usuario = {
      id_usuario: decoded.id_usuario,
      roles: decoded.roles || []
    };

    // Continuar con la siguiente función/middleware
    next();
  } catch (error) {
    console.error('Error verificando token:', error.message);
    return res.status(401).json({ message: 'Token inválido' });
  }
};