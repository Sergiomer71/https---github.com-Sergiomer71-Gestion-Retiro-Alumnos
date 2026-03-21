// ─────────────────────────────────────────
// ARCHIVO: Login.jsx
// DESCRIPCIÓN: Pantalla de inicio de sesión y puerta de acceso al sistema
// MÓDULO: Autenticación / Acceso
// DEPENDENCIAS: AuthContext, React Router, Lucide Icons
// ─────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { useAuth } from '../core/AuthContext';
import { UserCheck, Download } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import StorageService from '../storage/localStorage';
import { STORAGE_KEYS } from '../config/constants';

/**
 * Componente que gestiona el ingreso de usuarios mediante nombre y contraseña.
 */
const Login = () => {
    // Definición de estados locales para el formulario y mensajes de error
    const [username, setUsername] = useState(''); // Nombre de usuario ingresado
    const [password, setPassword] = useState(''); // Contraseña ingresada
    const [error, setError] = useState('');      // Almacena mensajes si las credenciales fallan
    const [deferredPrompt, setDeferredPrompt] = useState(null); // Evento para instalación de App

    // Hooks de autenticación y navegación
    const { login, user, isAdmin } = useAuth();
    const navigate = useNavigate();

    // Redirección automática: Si el usuario ya está logueado, lo mandamos a su pantalla correspondiente
    if (user) {
        if (isAdmin) {
            const institucion = StorageService.get(STORAGE_KEYS.INSTITUCION);
            const isConfigured = institucion && institucion.nombre;
            if (!isConfigured) {
                return <Navigate to="/configuracion-inicial" replace />;
            }
            return <Navigate to="/" replace />;
        }
        return <Navigate to="/registro-retiro" replace />;
    }

    /**
     * Procesa el envío del formulario de inicio de sesión.
     * @param {Event} e - Evento de envío del formulario.
     */
    const handleSubmit = (e) => {
        e.preventDefault(); // Evitamos que la página se recargue
        setError('');       // Limpiamos errores previos 

        // Intentamos realizar el login con el servicio de autenticación
        const result = login(username, password);

        if (!result.success) {
            // Si falla, mostramos el mensaje de error correspondiente
            setError(result.message);
        } else {
            // Si es exitoso, navegamos según el rol del usuario y el estado de la inicialización
            if (result.role === 'ADMIN') {
                const institucion = StorageService.get(STORAGE_KEYS.INSTITUCION);
                const isConfigured = institucion && institucion.nombre;
                if (!isConfigured) {
                    navigate('/configuracion-inicial', { replace: true });
                } else {
                    navigate('/', { replace: true });
                }
            } else {
                navigate('/registro-retiro', { replace: true });
            }
        }
    };

    // Efecto para gestionar la instalación de la aplicación como PWA
    useEffect(() => {
        // 1. Revisar si el navegador ya disparó el evento de instalación
        if (window.deferredInstallPrompt) {
            setDeferredPrompt(window.deferredInstallPrompt);
        }

        // 2. Escuchar si el evento ocurre mientras la página está abierta
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);

        // 3. Escuchar notificación personalizada del sistema
        const customHandler = () => {
            if (window.deferredInstallPrompt) {
                setDeferredPrompt(window.deferredInstallPrompt);
            }
        };
        window.addEventListener('pwa-installable', customHandler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('pwa-installable', customHandler);
        };
    }, []);

    /**
     * Lanza el diálogo nativo de instalación cuando el usuario hace clic.
     */
    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('Aplicación instalada por el usuario');
            setDeferredPrompt(null);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 transform transition-all">
                {/* Encabezado Visual del Login */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                        <UserCheck size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Sistema de Retiros</h2>
                    <p className="text-slate-500 mt-2">Ingreso de Personal</p>
                </div>

                {/* Área de visualización de errores de credenciales */}
                {error && (
                    <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                        {error}
                    </div>
                )}

                {/* Formulario de Login */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Usuario</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                            placeholder="Ej: admin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-2.5 px-4 rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:shadow-md active:scale-95"
                    >
                        Iniciar Sesión
                    </button>
                    
                    {/* Botón de Instalación (PWA) - Solo aparece si el navegador lo permite */}
                    {deferredPrompt && (
                        <div className="pt-6 border-t border-slate-100 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                             <button
                                type="button"
                                onClick={handleInstallClick}
                                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl shadow-lg shadow-emerald-900/20 text-base font-bold text-white bg-emerald-800 hover:bg-emerald-900 transition-all duration-300 active:scale-95 uppercase tracking-wide group"
                            >
                                <Download size={22} className="group-hover:translate-y-0.5 transition-transform" /> 
                                INSTALAR APLICACIÓN (DESKTOP/MÓVIL)
                            </button>
                        </div>
                    )}
                </form>

                {/* Información de ayuda para el usuario en demo */}
                <div className="mt-6 text-center text-xs text-slate-400">
                    <p>Credenciales por defecto (Pass: 123):<br />Admin: <strong>admin</strong> | Celador: <strong>celador</strong></p>
                </div>
            </div>
        </div>
    );
};

export default Login;

