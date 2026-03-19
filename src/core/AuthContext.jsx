// ─────────────────────────────────────────
// ARCHIVO: AuthContext.jsx
// DESCRIPCIÓN: Gestión centralizada del estado de autenticación (Login/Logout)
// MÓDULO: Núcleo (Core) / Seguridad
// DEPENDENCIAS: React, localStorage.js
// ─────────────────────────────────────────

import React, { createContext, useContext, useState, useEffect } from 'react';
import StorageService from '../storage/localStorage';
import { STORAGE_KEYS, ROLES } from '../config/constants';

// Creación del contexto de autenticación para ser compartido en toda la app
const AuthContext = createContext(null);

/**
 * Proveedor que envuelve la aplicación para dar acceso a los datos del usuario.
 * @param {object} children - Componentes hijos que tendrán acceso al contexto.
 */
export const AuthProvider = ({ children }) => {
    // Estado que almacena el usuario actualmente logueado
    const [user, setUser] = useState(null);
    // Estado para controlar si el sistema está cargando la sesión inicial
    const [loading, setLoading] = useState(true);

    // Efecto que se ejecuta una sola vez al cargar la aplicación
    useEffect(() => {
        // Inicializar las estructuras de datos si el almacenamiento está vacío
        StorageService.init();

        // Intentar recuperar la sesión activa del "sessionStorage" 
        // para que el usuario no tenga que loguearse de nuevo al refrescar la página
        try {
            const activeSessionId = sessionStorage.getItem('activeUserId');
            if (activeSessionId) {
                const users = StorageService.get(STORAGE_KEYS.USERS, []);
                // Buscamos si el ID guardado corresponde a un usuario válido
                const activeUser = users.find(u => u.id === activeSessionId);
                if (activeUser) {
                    setUser(activeUser);
                }
            }
        } catch (e) {
            console.error("Error al recuperar la sesión:", e);
        }
        // Indicamos que la verificación inicial ha terminado
        setLoading(false);
    }, []);

    /**
     * Función para iniciar sesión comparando credenciales.
     * @param {string} username - Nombre de usuario ingresado.
     * @param {string} password - Contraseña ingresada.
     * @returns {object} Objeto con resultado de la operación (éxito y mensaje).
     */
    const login = (username, password) => {
        const users = StorageService.get(STORAGE_KEYS.USERS, []);
        // Buscamos un usuario que coincida exactamente con lo ingresado
        const foundUser = users.find(u => u.username === username && u.password === password);
        
        if (foundUser) {
            // Guardamos el usuario en el estado y en la sesión del navegador
            setUser(foundUser);
            sessionStorage.setItem('activeUserId', foundUser.id);
            return { success: true, role: foundUser.role };
        }
        return { success: false, message: 'Usuario o contraseña incorrectos' };
    };

    /**
     * Función para cerrar la sesión actual y limpiar los datos.
     */
    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('activeUserId');
    };

    // Si aún estamos verificando la sesión, no mostramos nada (para evitar saltos visuales)
    if (loading) return null; 

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            logout, 
            isAdmin: user?.role === ROLES.ADMIN // Facilidad para saber si es administrador
        }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook personalizado para acceder fácilmente a la autenticación desde cualquier componente.
 * @returns {object} El contexto de autenticación (user, login, logout, etc).
 */
export const useAuth = () => useContext(AuthContext);

