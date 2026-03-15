import { STORAGE_KEYS, DEFAULT_ADMIN, DEFAULT_CELADOR } from '../config/constants';

/**
 * Utilidad de almacenamiento que mapea operaciones CRUD a localStorage
 * Manejo robusto de errores mediante try/catch y JSON estructurado.
 */
const StorageService = {
    /**
     * Getter genérico para una clave de local storage
     * @param {string} key
     * @param {any} defaultValue
     * @returns {any}
     */
    get(key, defaultValue = []) {
        try {
            const data = localStorage.getItem(key);
            if (!data) return defaultValue;
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error reading ${key} from LocalStorage:`, error);
            return defaultValue;
        }
    },

    /**
     * Setter genérico para una clave de local storage
     * @param {string} key
     * @param {any} value
     */
    set(key, value) {
        try {
            // Verificación básica de sanitización para funciones o elementos no serializables
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
        } catch (error) {
            console.error(`Error saving ${key} to LocalStorage:`, error);
            throw new Error('Error al guardar los datos localmente. El almacenamiento podría estar lleno.');
        }
    },

    /**
     * Inicializar local storage con la base de datos por defecto si está vacío
     */
    init() {
        // Verificar si existen usuarios, de lo contrario crear los por defecto
        const users = this.get(STORAGE_KEYS.USERS, []);
        if (users.length === 0) {
            this.set(STORAGE_KEYS.USERS, [DEFAULT_ADMIN, DEFAULT_CELADOR]);
        } else {
            if (!users.some(u => u.username === 'celador')) {
                users.push(DEFAULT_CELADOR);
                this.set(STORAGE_KEYS.USERS, users);
            }
        }

        // Asegurar que todas las claves estén presentes como arreglos/objetos vacíos si no existen
        if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) this.set(STORAGE_KEYS.STUDENTS, []);
        if (!localStorage.getItem(STORAGE_KEYS.WITHDRAWALS)) this.set(STORAGE_KEYS.WITHDRAWALS, []);
        if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) this.set(STORAGE_KEYS.SETTINGS, {});
        if (!localStorage.getItem(STORAGE_KEYS.PRECEPTORS)) this.set(STORAGE_KEYS.PRECEPTORS, []);
    },

    /**
     * Agregar elemento genérico
     */
    addItem(key, item) {
        const list = this.get(key, []);
        item.id = item.id || crypto.randomUUID(); // Autogenerar ID
        item.createdAt = new Date().toISOString();
        list.push(item);
        this.set(key, list);
        return item;
    },

    /**
     * Actualizar un elemento existente
     */
    updateItem(key, id, updates) {
        const list = this.get(key, []);
        const index = list.findIndex(i => i.id === id);
        if (index !== -1) {
            list[index] = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
            this.set(key, list);
            return list[index];
        }
        throw new Error('Elemento no encontrado para actualizar.');
    },

    /**
     * Eliminar un elemento
     */
    removeItem(key, id) {
        let list = this.get(key, []);
        list = list.filter(i => i.id !== id);
        this.set(key, list);
    },

    /**
     * Respaldar todo como un blob JSON
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
        return JSON.stringify(backup, null, 2);
    },

    /**
     * Importar datos desde JSON
     */
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.students && Array.isArray(data.students)) this.set(STORAGE_KEYS.STUDENTS, data.students);
            if (data.withdrawals && Array.isArray(data.withdrawals)) this.set(STORAGE_KEYS.WITHDRAWALS, data.withdrawals);
            if (data.users && Array.isArray(data.users)) this.set(STORAGE_KEYS.USERS, data.users);
            if (data.settings) this.set(STORAGE_KEYS.SETTINGS, data.settings);
            if (data.preceptors && Array.isArray(data.preceptors)) this.set(STORAGE_KEYS.PRECEPTORS, data.preceptors);
            return true;
        } catch (err) {
            console.error('Invalid JSON for import', err);
            throw new Error('El archivo importado no es un JSON válido o la estructura no es compatible.');
        }
    },

    /**
     * Eliminar todos los datos del sistema (excepto usuarios por defecto)
     */
    clearAllData() {
        try {
            localStorage.removeItem(STORAGE_KEYS.STUDENTS);
            localStorage.removeItem(STORAGE_KEYS.WITHDRAWALS);
            localStorage.removeItem(STORAGE_KEYS.PRECEPTORS);
            localStorage.removeItem(STORAGE_KEYS.SETTINGS);
            
            // Reiniciar usuarios a los de fábrica
            this.set(STORAGE_KEYS.USERS, [DEFAULT_ADMIN, DEFAULT_CELADOR]);
            
            // Re-inicializar estructuras vacías
            this.init();
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            throw new Error('No se pudieron eliminar todos los datos de forma segura.');
        }
    }
};

export default StorageService;
