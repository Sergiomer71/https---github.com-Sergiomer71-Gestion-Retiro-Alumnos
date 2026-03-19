// ─────────────────────────────────────────
// ARCHIVO: constants.js
// DESCRIPCIÓN: Definición de constantes globales del sistema
// MÓDULO: Configuración
// DEPENDENCIAS: Ninguna
// ─────────────────────────────────────────

/**
 * Claves utilizadas para identificar los datos en el LocalStorage del navegador.
 * Cada clave agrupa un conjunto de información específica.
 */
export const STORAGE_KEYS = {
    STUDENTS: 'school_withdrawal_students',     // Listado de alumnos inscritos
    WITHDRAWALS: 'school_withdrawal_records',   // Historial de retiros realizados
    USERS: 'school_withdrawal_users',           // Usuarios del sistema (Admin/Celador)
    SETTINGS: 'school_withdrawal_settings',     // Configuraciones generales de la app
    PRECEPTORS: 'school_withdrawal_preceptors', // Listado de preceptores asignados
};

/**
 * Roles de usuario permitidos en el sistema para control de acceso.
 */
export const ROLES = {
    ADMIN: 'ADMIN',     // Acceso total a todas las funciones y reportes
    CELADOR: 'CELADOR', // Acceso limitado solo al registro de retiros
};

/**
 * Usuario administrador inicial por defecto.
 * Útil para el primer inicio de sesión del sistema.
 * [NOTA]: En producción, las contraseñas deben estar encriptadas.
 */
export const DEFAULT_ADMIN = {
    id: 'admin-0',
    username: 'admin',
    password: '123',
    role: ROLES.ADMIN,
    name: 'Administrador Principal',
};

/**
 * Usuario celador/sereno por defecto para pruebas iniciales.
 */
export const DEFAULT_CELADOR = {
    id: 'celador-0',
    username: 'celador',
    password: '123',
    role: ROLES.CELADOR,
    name: 'Celador / Portería',
};

