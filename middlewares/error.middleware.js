/**
 * Middleware global para manejo de errores.
 * - Captura cualquier excepción que ocurra en la aplicación.
 * - Loguea el error en consola para depuración.
 * - Devuelve una respuesta genérica al cliente con status 500.
 *
 * Decisión técnica:
 * Se coloca SIEMPRE al final de la cadena de middlewares y rutas
 * para garantizar que pueda interceptar cualquier error no manejado.
 *
 * Validaciones críticas:
 * - Nunca se expone información sensible del error al cliente.
 * - Se devuelve un mensaje genérico para evitar fugas de seguridad.
 */
export const manejarErrores = (err, req, res, next) => {
  console.error('ERROR:', err);

  res.status(500).json({
    message: 'Error interno del servidor'
  });
};