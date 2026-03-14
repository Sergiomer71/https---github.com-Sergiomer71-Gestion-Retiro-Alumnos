/**
 * Constantes utilizadas en toda la aplicación.
 */
export const STORAGE_KEYS = {
    STUDENTS: 'school_withdrawal_students',
    WITHDRAWALS: 'school_withdrawal_records',
    USERS: 'school_withdrawal_users',
    SETTINGS: 'school_withdrawal_settings',
};

export const ROLES = {
    ADMIN: 'ADMIN',
    CELADOR: 'CELADOR',
};

// Lógica de respaldo para el usuario administrador inicial
export const DEFAULT_ADMIN = {
    id: 'admin-0',
    username: 'admin',
    password: '123', // En una app real esto estaría hasheado. Se mantiene simple para la demo SPA
    role: ROLES.ADMIN,
    name: 'Administrador Principal',
};

export const DEFAULT_CELADOR = {
    id: 'celador-0',
    username: 'celador',
    password: '123',
    role: ROLES.CELADOR,
    name: 'Celador / Portería',
};
