import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/* ======================================================
   REGISTRO (Estudiante por defecto)
====================================================== */
/**
 * Registrar un nuevo usuario como Estudiante.
 * - Valida campos obligatorios.
 * - Verifica que no exista usuario o correo duplicado.
 * - Encripta la contraseña con bcrypt.
 * - Inserta usuario en la tabla `Usuario` con estado activo.
 * - Asigna rol "Estudiante" y crea registro mínimo en tabla `Estudiante`.
 *
 * Decisión técnica:
 * Se usa una transacción (`beginTransaction`, `commit`, `rollback`)
 * para garantizar consistencia entre las tablas `Usuario`, `Usuario_Rol` y `Estudiante`.
 *
 * Validaciones críticas:
 * - Usuario/correo duplicado → rollback y error 409.
 * - Rol "Estudiante" debe existir en la BD.
 * - Si ocurre cualquier error → rollback y status 500.
 */
export const register = async (req, res) => {
  const { nombre_usuario, correo, contrasena } = req.body;

  if (!nombre_usuario || !correo || !contrasena) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1️⃣ Verificar usuario existente
    const [existe] = await conn.query(
      'SELECT id_usuario FROM Usuario WHERE nombre_usuario = ? OR correo = ?',
      [nombre_usuario, correo]
    );

    if (existe.length > 0) {
      await conn.rollback();
      return res.status(409).json({ message: 'Usuario o correo ya existe' });
    }

    // 2️⃣ Crear usuario
    const hash = await bcrypt.hash(contrasena, 10);
    const [result] = await conn.query(
      'INSERT INTO Usuario (nombre_usuario, correo, contrasena, estado) VALUES (?, ?, ?, 1)',
      [nombre_usuario, correo, hash]
    );
    const idUsuario = result.insertId;

    // 3️⃣ Obtener rol Estudiante
    const [rolRow] = await conn.query(
      'SELECT id_rol FROM Rol WHERE nombre_rol = "Estudiante"'
    );
    if (rolRow.length === 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Rol Estudiante no existe en la BD' });
    }

    const idRol = rolRow[0].id_rol;
    await conn.query(
      'INSERT INTO Usuario_Rol (id_usuario, id_rol) VALUES (?, ?)',
      [idUsuario, idRol]
    );

    // 4️⃣ Crear registro mínimo en Estudiante
    await conn.query(
      `INSERT INTO Estudiante (correo, id_usuario) VALUES (?, ?)`,
      [correo, idUsuario]
    );

    await conn.commit();
    res.status(201).json({ message: 'Registro exitoso como Estudiante' });

  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error interno' });
  } finally {
    conn.release();
  }
};

/* ======================================================
   LOGIN (Genérico)
====================================================== */
/**
 * Login de usuario.
 * - Valida credenciales contra la base de datos.
 * - Verifica que el usuario esté activo.
 * - Compara contraseña ingresada con la encriptada.
 * - Obtiene roles y genera accessToken con payload dinámico.
 *
 * Decisión técnica:
 * - El payload incluye siempre `id_usuario` y roles.
 * - Si el usuario es Docente o Estudiante, se agregan sus IDs específicos.
 * - Se devuelve información adicional según el rol.
 *
 * Validaciones críticas:
 * - Usuario inexistente o inactivo → 404.
 * - Contraseña incorrecta → 401.
 * - Usuario sin roles → 403.
 */
export const login = async (req, res) => {
  const { nombre_usuario, contrasena } = req.body;

  try {
    // 1. Buscar usuario activo
    const [rows] = await pool.query(
      'SELECT * FROM Usuario WHERE nombre_usuario = ? AND estado = 1',
      [nombre_usuario]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado o inactivo' });
    }

    const user = rows[0];

    // 2. Validar contraseña
    const validPassword = await bcrypt.compare(contrasena, user.contrasena);
    if (!validPassword) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // 3. Obtener roles
    const [rolesRows] = await pool.query(
      `SELECT r.nombre_rol
       FROM Rol r
       INNER JOIN Usuario_Rol ur ON r.id_rol = ur.id_rol
       WHERE ur.id_usuario = ?`,
      [user.id_usuario]
    );

    const roles = rolesRows.map(r => r.nombre_rol);
    if (roles.length === 0) {
      return res.status(403).json({ message: 'Usuario sin roles asignados' });
    }

    // 4. Generar payload dinámico
    let payload = { id_usuario: user.id_usuario, roles };

    if (roles.includes('Docente')) {
      const [docRows] = await pool.query(
        'SELECT id_docente FROM Docente WHERE id_usuario = ?',
        [user.id_usuario]
      );
      if (docRows.length > 0) payload.id_docente = docRows[0].id_docente;
    }

    if (roles.includes('Estudiante')) {
      const [estRows] = await pool.query(
        'SELECT id_estudiante FROM Estudiante WHERE id_usuario = ?',
        [user.id_usuario]
      );
      if (estRows.length > 0) payload.id_estudiante = estRows[0].id_estudiante;
    }

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

    // 5. Info adicional por rol
    let docente = null;
    let estudiante = null;

    if (roles.includes('Docente')) {
      const [docRows] = await pool.query(
        'SELECT id_docente, nombre, apellido, correo FROM Docente WHERE id_usuario = ?',
        [user.id_usuario]
      );
      if (docRows.length > 0) docente = docRows[0];
    }

    if (roles.includes('Estudiante')) {
      const [estRows] = await pool.query(
        'SELECT id_estudiante, nombre, apellido, correo FROM Estudiante WHERE id_usuario = ?',
        [user.id_usuario]
      );
      if (estRows.length > 0) estudiante = estRows[0];
    }

    // 6. Respuesta final
    res.status(200).json({
      message: 'Login exitoso',
      accessToken,
      usuario: {
        id_usuario: user.id_usuario,
        nombre_usuario: user.nombre_usuario,
        correo: user.correo,
        roles
      },
      docente,
      estudiante
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

/* ======================================================
   REFRESH TOKEN
====================================================== */
/**
 * Refresh Token.
 * - Valida el refreshToken recibido desde el cliente.
 * - Verifica que el usuario aún tenga roles asignados en la BD.
 * - Genera un nuevo accessToken con expiración corta.
 *
 * Decisión técnica:
 * - Se usa un secreto distinto para refreshToken (`JWT_REFRESH_SECRET`).
 * - El refreshToken tiene mayor duración que el accessToken.
 * - El nuevo accessToken se expira en 15 minutos para mayor seguridad.
 *
 * Validaciones críticas:
 * - Si no se envía refreshToken → 401.
 * - Si el refreshToken es inválido o expiró → 403.
 * - Usuario sin roles → 403.
 */
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token requerido' });
  }

  try {
    // 1. Verificar refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // 2. Obtener roles actuales del usuario
    const [rolesRows] = await pool.query(
      `SELECT r.nombre_rol
       FROM Rol r
       INNER JOIN Usuario_Rol ur ON r.id_rol = ur.id_rol
       WHERE ur.id_usuario = ?`,
      [decoded.id_usuario]
    );

    if (rolesRows.length === 0) {
      return res.status(403).json({ message: 'Usuario sin roles asignados' });
    }

    const roles = rolesRows.map(r => r.nombre_rol);

    // 3. Generar nuevo access token
    const newAccessToken = jwt.sign(
      {
        id_usuario: decoded.id_usuario,
        roles
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // 4. Respuesta final
    res.status(200).json({ accessToken: newAccessToken });

  } catch (error) {
    console.error('Error refresh token:', error);
    res.status(403).json({ message: 'Refresh token inválido o expirado' });
  }
};