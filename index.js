// Importación de dependencias principales
import 'dotenv/config';   // Carga variables de entorno desde archivo .env
import express from 'express'; // Framework para construir el servidor HTTP
import cors from 'cors';       // Middleware para habilitar CORS

// Middlewares personalizados
import { verificarToken } from './middlewares/auth.middleware.js';          // Autenticación por token
import { verificarEstadoUsuario } from './middlewares/estado.middleware.js'; // Verificación de estado activo del usuario
import { permitirRoles } from './middlewares/role.middleware.js';            // Control de acceso por roles
import { manejarErrores } from './middlewares/error.middleware.js';          // Manejo centralizado de errores

// Rutas de la aplicación
import authRoutes from './Routers/auth.routers.js';          // Rutas de autenticación (login, registro, refresh)
import estudianteRoutes from './Routers/estudiante.routes.js'; // Rutas específicas para estudiantes
import docenteRoutes from './Routers/docente.routers.js';      // Rutas específicas para docentes
import adminRoutes from './Routers/admin.routes.js';           // Rutas específicas para administradores

// Inicialización de la aplicación Express
const app = express();

// Middlewares globales
app.use(cors());           // Permite solicitudes desde distintos orígenes
app.use(express.json());   // Habilita parsing de JSON en el body de las peticiones

// ===============================
// Rutas públicas
// ===============================
// No requieren autenticación ni roles
app.use('/api/auth', authRoutes);
app.use('/api/estudiante', estudianteRoutes);

// ===============================
// Rutas protegidas
// ===============================
// Se aplican middlewares de seguridad antes de acceder a las rutas
// Ruta pública para crear el primer admin (sin token, sin roles)
app.use('/api/admin', adminRoutes);

// Rutas protegidas (requieren token y rol)
app.use(
  '/api/admin-protegido',
  verificarToken,
  verificarEstadoUsuario,
  permitirRoles('Administrador'),
  adminRoutes
);

app.use(
  '/api/docente',
  verificarToken,             // Validar token JWT
  verificarEstadoUsuario,     // Verificar que el usuario esté activo
  permitirRoles('Docente'),   // Restringir acceso solo a rol Docente
  docenteRoutes
);

// ===============================
// Manejo de errores
// ===============================
// Siempre debe ir al final para capturar cualquier excepción
app.use(manejarErrores);

// ===============================
// Inicialización del servidor
// ===============================
// Se obtiene el puerto desde variables de entorno o se usa 3000 por defecto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});