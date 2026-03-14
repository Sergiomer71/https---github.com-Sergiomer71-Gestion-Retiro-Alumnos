import React, { createContext, useContext, useState, useEffect } from 'react';
import StorageService from '../storage/localStorage';
import { STORAGE_KEYS, ROLES } from '../config/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Inicializar el almacenamiento si está vacío
        StorageService.init();

        // Verificar usuario logueado en session storage para sobrevivir a recargas,
        // aunque las instrucciones indicaban localStorage completamente offline. 
        // Podemos simplemente mantener la sesión en memoria o un token en localStorage.
        try {
            const activeSessionId = sessionStorage.getItem('activeUserId');
            if (activeSessionId) {
                const users = StorageService.get(STORAGE_KEYS.USERS, []);
                const activeUser = users.find(u => u.id === activeSessionId);
                if (activeUser) {
                    setUser(activeUser);
                }
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }, []);

    const login = (username, password) => {
        const users = StorageService.get(STORAGE_KEYS.USERS, []);
        const foundUser = users.find(u => u.username === username && u.password === password);
        if (foundUser) {
            setUser(foundUser);
            sessionStorage.setItem('activeUserId', foundUser.id);
            return { success: true, role: foundUser.role };
        }
        return { success: false, message: 'Usuario o contraseña incorrectos' };
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('activeUserId');
    };

    if (loading) return null; // o un spinner de carga

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === ROLES.ADMIN }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
