// Importación de dependencias principales
import express from 'express';   // Framework para construir el servidor HTTP
import cors from 'cors';         // Middleware para habilitar CORS
import dotenv from 'dotenv';     // Manejo de variables de entorno

// Importación de rutas de la aplicación
import router from './Routers/auth.routers.js';        // Rutas de autenticación (login, registro, refresh)
import estudianteRoutes from './Routers/estudiante.routes.js'; // Rutas específicas para estudiantes
import adminRoutes from './Routers/admin.routes.js';           // Rutas específicas para administradores
import docenteRoutes from './Routers/docente.routers.js';      // Rutas específicas para docentes
import notasRoutes from './Routers/notas.router.js';           // Rutas para gestión de notas

// Configuración de variables de entorno
// 🔴 OBLIGATORIO PARA JWT: asegura que las claves secretas y configuraciones
// estén disponibles en process.env
dotenv.config();

// Inicialización de la aplicación Express
const app = express();

// Middlewares globales
app.use(cors());           // Permite solicitudes desde distintos orígenes
app.use(express.json());   // Habilita parsing de JSON en el body de las peticiones

// ===============================
// Rutas principales de la API
// ===============================

// Rutas públicas de autenticación
app.use('/api/auth', router);

// Rutas de estudiantes
app.use('/api/estudiante', estudianteRoutes);

// Rutas de administración
app.use('/api/admin', adminRoutes);

// Rutas de docentes
app.use('/api/docente', docenteRoutes);

// Rutas de notas
app.use('/api/notas', notasRoutes);

// Exportación de la aplicación para ser utilizada en index.js
// Decisión técnica: se separa la configuración de la app de la inicialización
// del servidor para facilitar pruebas y modularidad.
export default app;