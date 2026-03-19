// ─────────────────────────────────────────
// ARCHIVO: localStorage.js
// DESCRIPCIÓN: Servicio de persistencia de datos en el navegador
// MÓDULO: Almacenamiento (Storage)
// DEPENDENCIAS: constants.js
// ─────────────────────────────────────────

import { STORAGE_KEYS, DEFAULT_ADMIN, DEFAULT_CELADOR } from '../config/constants';

/**
 * Objeto que centraliza todas las operaciones de lectura y escritura de datos.
 * Utiliza localStorage para que la información persista aunque se cierre el navegador.
 */
const StorageService = {
    /**
     * Obtiene datos desde el LocalStorage.
     * @param {string} key - El nombre de la clave a buscar.
     * @param {any} defaultValue - Valor a devolver si la clave no existe (por defecto un arreglo vacío).
     * @returns {any} Los datos convertidos a objeto JS o el valor por defecto.
     */
    get(key, defaultValue = []) {
        try {
            const data = localStorage.getItem(key);
            // Si no hay datos, retornamos el valor inicial
            if (!data) return defaultValue;
            // Convertimos el texto de vuelta a formato objeto de JavaScript
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error al leer ${key} de LocalStorage:`, error);
            return defaultValue;
        }
    },

    /**
     * Guarda datos en el LocalStorage convirtiéndolos a texto.
     * @param {string} key - El nombre de la clave donde guardar.
     * @param {any} value - El objeto o valor que se desea guardar.
     */
    set(key, value) {
        try {
            // Convertimos el objeto JS a una cadena de texto (JSON) para poder guardarlo
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
        } catch (error) {
            console.error(`Error al guardar ${key} en LocalStorage:`, error);
            // Lanzamos un error descriptivo si algo falla (ej: almacenamiento lleno)
            throw new Error('Error al guardar los datos localmente. El almacenamiento podría estar lleno.');
        }
    },

    /**
     * Prepara el sistema con los datos iniciales si es la primera vez que se usa.
     */
    init() {
        // Obtenemos los usuarios existentes
        const users = this.get(STORAGE_KEYS.USERS, []);
        
        // Si no hay usuarios, cargamos los usuarios por defecto (admin y celador)
        if (users.length === 0) {
            this.set(STORAGE_KEYS.USERS, [DEFAULT_ADMIN, DEFAULT_CELADOR]);
        } else {
            // Aseguramos que el usuario celador exista para las pruebas
            if (!users.some(u => u.username === 'celador')) {
                users.push(DEFAULT_CELADOR);
                this.set(STORAGE_KEYS.USERS, users);
            }
        }

        // Inicializamos las demás secciones con arreglos u objetos vacíos si no existen
        if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) this.set(STORAGE_KEYS.STUDENTS, []);
        if (!localStorage.getItem(STORAGE_KEYS.WITHDRAWALS)) this.set(STORAGE_KEYS.WITHDRAWALS, []);
        if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) this.set(STORAGE_KEYS.SETTINGS, {});
        if (!localStorage.getItem(STORAGE_KEYS.PRECEPTORS)) this.set(STORAGE_KEYS.PRECEPTORS, []);
    },

    /**
     * Agrega un nuevo elemento a una lista específica.
     * @param {string} key - Clave del LocalStorage.
     * @param {object} item - El nuevo objeto a guardar.
     * @returns {object} El objeto guardado con su ID y fecha de creación.
     */
    addItem(key, item) {
        const list = this.get(key, []);
        // Generamos un identificador único si no tiene uno
        item.id = item.id || crypto.randomUUID(); 
        // Registramos el momento exacto de la creación
        item.createdAt = new Date().toISOString();
        list.push(item);
        this.set(key, list);
        return item;
    },

    /**
     * Modifica los datos de un elemento existente.
     * @param {string} key - Clave del LocalStorage.
     * @param {string} id - ID del elemento a modificar.
     * @param {object} updates - Objeto con los nuevos valores.
     * @returns {object} El elemento actualizado.
     */
    updateItem(key, id, updates) {
        const list = this.get(key, []);
        // Buscamos la posición del elemento por su ID
        const index = list.findIndex(i => i.id === id);
        
        if (index !== -1) {
            // Combinamos los datos viejos con los nuevos y actualizamos la fecha
            list[index] = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
            this.set(key, list);
            return list[index];
        }
        throw new Error('Elemento no encontrado para actualizar.');
    },

    /**
     * Quita un elemento de la lista por su ID.
     * @param {string} key - Clave del LocalStorage.
     * @param {string} id - ID del elemento a borrar.
     */
    removeItem(key, id) {
        let list = this.get(key, []);
        // Filtramos la lista para quedarnos con todos menos el que queremos borrar
        list = list.filter(i => i.id !== id);
        this.set(key, list);
    },

    /**
     * Crea un resumen de todos los datos en formato de texto para respaldo.
     * @returns {string} Datos del sistema en formato JSON.
     */
    exportData() {
        const backup = {
            students: this.get(STORAGE_KEYS.STUDENTS),
            withdrawals: this.get(STORAGE_KEYS.WITHDRAWALS),
            users: this.get(STORAGE_KEYS.USERS),
            settings: this.get(STORAGE_KEYS.SETTINGS),
            preceptors: this.get(STORAGE_KEYS.PRECEPTORS),
            exportDate: new Date().toISOString()
        };
        // Devolvemos el texto formateado con espacios para que sea legible
        return JSON.stringify(backup, null, 2);
    },

    /**
     * Sobrescribe los datos actuales con una copia de respaldo.
     * @param {string} jsonData - El texto JSON con los datos a restaurar.
     * @returns {boolean} True si la operación fue exitosa.
     */
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            // Validamos que existan las secciones principales antes de guardar
            if (data.students && Array.isArray(data.students)) this.set(STORAGE_KEYS.STUDENTS, data.students);
            if (data.withdrawals && Array.isArray(data.withdrawals)) this.set(STORAGE_KEYS.WITHDRAWALS, data.withdrawals);
            if (data.users && Array.isArray(data.users)) this.set(STORAGE_KEYS.USERS, data.users);
            if (data.settings) this.set(STORAGE_KEYS.SETTINGS, data.settings);
            if (data.preceptors && Array.isArray(data.preceptors)) this.set(STORAGE_KEYS.PRECEPTORS, data.preceptors);
            return true;
        } catch (err) {
            console.error('JSON no válido para importar', err);
            throw new Error('El archivo importado no es válido o la estructura no es compatible.');
        }
    },

    /**
     * Borra toda la información cargada en el sistema.
     * @returns {boolean} True si se completó el borrado.
     */
    clearAllData() {
        try {
            // Eliminamos las secciones de datos principales
            localStorage.removeItem(STORAGE_KEYS.STUDENTS);
            localStorage.removeItem(STORAGE_KEYS.WITHDRAWALS);
            localStorage.removeItem(STORAGE_KEYS.PRECEPTORS);
            localStorage.removeItem(STORAGE_KEYS.SETTINGS);
            
            // Reestablecemos la lista de usuarios a los valores de fábrica
            this.set(STORAGE_KEYS.USERS, [DEFAULT_ADMIN, DEFAULT_CELADOR]);
            
            // Volvemos a crear las estructuras vacías necesarias
            this.init();
            return true;
        } catch (error) {
            console.error('Error al borrar los datos:', error);
            throw new Error('No se pudieron eliminar todos los datos de forma segura.');
        }
    }
};

export default StorageService;

