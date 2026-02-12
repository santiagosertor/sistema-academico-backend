import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();
/**
 * Configuración de conexión a la base de datos MySQL.
 * - Se utiliza `mysql2/promise` para trabajar con async/await.
 * - Se crea un pool de conexiones para mejorar rendimiento y escalabilidad.
 *
 * Decisión técnica:
 * El uso de `createPool` permite manejar múltiples conexiones simultáneas
 * sin necesidad de abrir/cerrar manualmente cada conexión.
 *
 * Validaciones críticas:
 * - Las credenciales deben mantenerse seguras (idealmente en variables de entorno).
 * - El pool debe apuntar a la base de datos correcta (`sistema_academico`).
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'admin1234',
  database: process.env.DB_NAME || 'sistema_academico',
});

// Exportación del pool para ser utilizado en consultas SQL
export default pool;