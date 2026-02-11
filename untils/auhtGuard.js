/**
 * Protege rutas en el frontend verificando el token y los roles permitidos.
 * - Comprueba si existe un accessToken en localStorage.
 * - Decodifica el payload del JWT para obtener id_usuario y roles.
 * - Valida que el usuario tenga los roles requeridos para acceder.
 *
 * Decisión técnica:
 * Se usa `atob` para decodificar la parte intermedia del JWT (payload),
 * ya que contiene la información necesaria para validar permisos.
 *
 * Validaciones críticas:
 * - Si no existe token, se redirige al inicio.
 * - Si el token no contiene id_usuario o roles, se limpia la sesión.
 * - Si el rol no está autorizado, se bloquea el acceso.
 */
export function protegerRuta(rolesPermitidos = []) {
  const token = localStorage.getItem('accessToken');

  // Validación crítica: si no hay token, redirigir al inicio
  if (!token) {
    window.location.href = '/';
    return;
  }

  try {
    // Decodificar payload del JWT
    const payload = JSON.parse(atob(token.split('.')[1]));
    const idUsuario = payload.id_usuario;
    const rolesUsuario = payload.roles || [];

    // 🔴 Validación extra: si falta id_usuario o roles, limpiar sesión
    if (!idUsuario || rolesUsuario.length === 0) {
      alert('Token inválido o incompleto');
      localStorage.clear();
      window.location.href = '/';
      return;
    }

    // Verificar autorización: al menos un rol permitido debe coincidir
    const autorizado = rolesPermitidos.some(r =>
      rolesUsuario.includes(r)
    );

    if (!autorizado) {
      alert('No tienes permiso para entrar aquí');
      window.location.href = '/';
    }

    // Opcional: guardar el id_usuario en localStorage si se necesita en el frontend
    localStorage.setItem('id_usuario', idUsuario);

  } catch (e) {
    // Manejo de errores: si el token no se puede decodificar, limpiar sesión
    localStorage.clear();
    window.location.href = '/';
  }
}