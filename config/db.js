import mysql from 'mysql2/promise';

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
  host: 'localhost',       // Servidor de la base de datos
  user: 'root',            // Usuario de la base de datos
  password: 'admin1234',   // Contraseña del usuario (recomendable mover a .env)
  database: 'sistema_academico', // Nombre de la base de datos
});

// Exportación del pool para ser utilizado en consultas SQL
export default pool;