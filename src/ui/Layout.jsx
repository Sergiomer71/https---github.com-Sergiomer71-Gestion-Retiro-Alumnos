// ─────────────────────────────────────────
// ARCHIVO: Layout.jsx
// DESCRIPCIÓN: Estructura visual principal (Sidebar y Contenedor)
// MÓDULO: Interfaz de Usuario (UI)
// DEPENDENCIAS: React Router, AuthContext, Lucide Icons, StorageService
// ─────────────────────────────────────────

import React from 'react';
import { Outlet, Navigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';
import StorageService from '../storage/localStorage';
import { STORAGE_KEYS } from '../config/constants';
import { LogOut, LayoutDashboard, Users, UserCheck, Settings, FileText, Calendar, Upload, Image as ImageIcon, Download, Menu, X, UserPlus, BookOpen } from 'lucide-react';

/**
 * Componente que define la estructura común de la aplicación:
 * Incluye el sidebar de navegación y el área donde se renderizan las páginas.
 */
const Layout = () => {
    // Datos de autenticación para roles y cierre de sesión
    const { user, logout, isAdmin } = useAuth();
    // Hook para detectar cambios en la dirección URL actual
    const location = useLocation();

    // Estados locales del componente
    const [logoPreview, setLogoPreview] = React.useState(null); // Imagen del logo de la escuela
    const [sidebarOpen, setSidebarOpen] = React.useState(false); // Control del menú en dispositivos móviles
    const [deferredPrompt, setDeferredPrompt] = React.useState(null); // Evento para instalar la PWA
    
    // Referencia al input de archivos oculto para subir el logo
    const fileInputRef = React.useRef(null);

    // Efecto: Cierra el menú lateral automáticamente al navegar (útil en móviles)
    React.useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Efecto Inicial: Carga configuraciones y prepara la instalación de la App
    React.useEffect(() => {
        // Recuperar el la configuración de la institución (si existe)
        const institucion = StorageService.get(STORAGE_KEYS.INSTITUCION);
        if (institucion && institucion.logo) {
            setLogoPreview(institucion.logo);
        }

        // Lógica de instalación (PWA)
        if (window.deferredInstallPrompt) {
            setDeferredPrompt(window.deferredInstallPrompt);
        }

        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);

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
     * Muestra el diálogo nativo del navegador para instalar la aplicación.
     */
    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            window.deferredInstallPrompt = null;
        }
    };

    /**
     * Procesa la subida de una imagen para usarla como logo de la escuela.
     * @param {Event} e - Evento de cambio del input de archivo.
     */
    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validación de tamaño máximo (2MB)
        if (file.size > 2 * 1024 * 1024) { 
            alert('El archivo es demasiado grande. El límite es 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result;
            // Actualizamos la vista previa y guardamos en la key oficial de la configuración actual
            setLogoPreview(base64String);
            
            // Re-Guardamos la imagen dentro del paquete 'Institucion', no como variable suelta,
            // ya que el header se basa en leer este JSON directamente para poblar todo el perfil.
            const institucionConfig = StorageService.get(STORAGE_KEYS.INSTITUCION) || {};
            
            // IMPORTANT: Si existía previamente un arreglo por el bug viejo, lo reseteamos a objeto
            const safeConfig = Array.isArray(institucionConfig) ? (institucionConfig[0] || {}) : institucionConfig;
            
            safeConfig.logo = base64String;
            StorageService.set(STORAGE_KEYS.INSTITUCION, safeConfig);
        };
        reader.readAsDataURL(file);
    };

    // Redirección de seguridad: Si no hay usuario, vuelve al login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    /**
     * Función auxiliar para aplicar estilos a los enlaces de navegación según su estado activo.
     */
    const navLinkClass = ({ isActive }, activeColor = 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30') =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? activeColor : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-100'}`;

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">

            {/* Fondo oscuro traslúcido en móviles cuando el menú está abierto */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Barra Lateral (Sidebar) */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-40
                w-72 bg-slate-950 text-slate-100 flex flex-col
                transition-transform duration-300 ease-in-out shadow-2xl
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Cabecera del Sidebar: Logo y Nombre de la App */}
                <div className="p-6 lg:p-8 border-b border-slate-800/50 bg-slate-900/40 backdrop-blur-md flex items-center gap-3">
                    <div className="relative group w-12 h-12 flex-shrink-0 bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden border border-slate-700">
                        {logoPreview ? (
                            <img src={logoPreview} alt="Logo de la Escuela" className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon className="w-6 h-6 text-blue-400" />
                        )}

                        {/* Botón flotante para cambiar el logo (visible al pasar el mouse o tocar) */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Cambiar Logo de la Escuela"
                        >
                            <Upload size={16} className="text-white" />
                        </button>
                    </div>
                    {/* Input de archivo invisible encargado de la carga */}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                        className="hidden"
                    />

                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-bold tracking-tight text-white truncate leading-tight">
                            {StorageService.get(STORAGE_KEYS.INSTITUCION)?.nombre || "Institución no configurada"}
                        </h1>
                        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.1em] mt-0.5 truncate bg-slate-800/40 rounded px-1.5 py-0.5 inline-block">SISTEMA REGISTRO DE SALIDAS</p>
                    </div>

                    {/* Botón para cerrar el menú en dispositivos móviles */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        aria-label="Cerrar menú"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Links de Navegación del Menú */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {/* Sección visible solo para Administradores */}
                    {isAdmin && (
                        <NavLink to="/" className={(state) => navLinkClass(state)}>
                            <LayoutDashboard size={20} className="group-hover:text-indigo-400 transition-colors" />
                            <span className="font-semibold tracking-wide">Dashboard</span>
                        </NavLink>
                    )}

                    {/* Sección visible para Celadores (o Administradores en su defecto si se desea) */}
                    {!isAdmin && (
                        <NavLink to="/registro-retiro" className={(state) => navLinkClass(state)}>
                            <UserCheck size={20} className="group-hover:text-indigo-400 transition-colors" />
                            <span className="font-semibold tracking-wide">Registrar Retiro</span>
                        </NavLink>
                    )}

                    {isAdmin && (
                        <>
                            <div className="pt-4 pb-2 px-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Administración</span>
                            </div>
                            <NavLink to="/alumnos" className={(state) => navLinkClass(state)}>
                                <Users size={20} /> <span className="font-semibold tracking-wide">Alumnos</span>
                            </NavLink>
                            <NavLink to="/preceptores" className={(state) => navLinkClass(state)}>
                                <UserCheck size={20} /> <span className="font-semibold tracking-wide">Preceptores</span>
                            </NavLink>
                            <NavLink to="/alta-celador" className={(state) => navLinkClass(state)}>
                                <UserPlus size={20} /> <span className="font-semibold tracking-wide">Alta Celador</span>
                            </NavLink>
                            <NavLink to="/alta-curso" className={(state) => navLinkClass(state)}>
                                <BookOpen size={20} /> <span className="font-semibold tracking-wide">Alta Curso</span>
                            </NavLink>

                            <div className="pt-4 pb-2 px-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Reportes</span>
                            </div>
                            <NavLink to="/historial-retiros" className={(state) => navLinkClass(state, 'bg-amber-600 text-white shadow-lg shadow-amber-600/30')}>
                                <Calendar size={20} /> <span className="font-semibold tracking-wide">Historial</span>
                            </NavLink>
                            <NavLink to="/reportes" className={(state) => navLinkClass(state, 'bg-slate-800 text-white shadow-lg')}>
                                <FileText size={20} /> <span className="font-semibold tracking-wide">Reportes PDF</span>
                            </NavLink>

                            <div className="pt-4 pb-2 px-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Sistema</span>
                            </div>
                            <NavLink to="/configuracion" className={(state) => navLinkClass(state, 'bg-slate-800 text-white shadow-lg')}>
                                <Settings size={20} /> <span className="font-semibold tracking-wide">Configuración</span>
                            </NavLink>
                        </>
                    )}
                </nav>

                {/* Pie del Sidebar: Botones de Acción */}
                <div className="p-4 space-y-2">
                    {/* Botón de instalación (solo si es instalable como PWA) */}
                    {deferredPrompt && (
                        <button
                            onClick={handleInstallClick}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95 group font-black text-xs uppercase tracking-wider"
                        >
                            <Download size={18} /> Instalar Aplicación
                        </button>
                    )}
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-semibold"
                    >
                        <LogOut size={18} /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Contenedor del Contenido Principal */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Cabecera superior que solo aparece en pantallas pequeñas (móviles) */}
                <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-slate-950 text-white shadow-lg z-20 shrink-0">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-xl hover:bg-slate-800 transition-colors"
                        aria-label="Abrir menú"
                    >
                        <Menu size={22} />
                    </button>
                    <div className="flex items-center gap-2">
                        {logoPreview ? (
                            <img src={logoPreview} alt="Logo" className="w-7 h-7 rounded-lg object-cover" />
                        ) : (
                            <ImageIcon size={20} className="text-blue-400" />
                        )}
                        <span className="font-bold text-[13px] tracking-tight truncate max-w-[150px]">
                            {StorageService.get(STORAGE_KEYS.INSTITUCION)?.nombre || "Institución no conf."}
                        </span>
                    </div>
                </header>

                {/* Área Scrollable donde se cargan las diferentes páginas (Outlet) */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;

