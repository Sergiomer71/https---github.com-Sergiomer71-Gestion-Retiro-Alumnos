import React from 'react';
import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';
import StorageService from '../storage/localStorage';
import { LogOut, LayoutDashboard, Users, UserCheck, Settings, FileText, Calendar, Upload, Image as ImageIcon } from 'lucide-react';

const Layout = () => {
    const { user, logout, isAdmin } = useAuth();

    const [logoPreview, setLogoPreview] = React.useState(null);
    const fileInputRef = React.useRef(null);

    React.useEffect(() => {
        // Cargar logo guardado si existe
        const savedLogo = StorageService.get('SCHOOL_LOGO_BASE64');
        if (savedLogo) setLogoPreview(savedLogo);
    }, []);

    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { // Limite 2MB
            alert('El archivo es demasiado grande. El límite es 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result;
            setLogoPreview(base64String);
            StorageService.addItem('CONFIG', 'fake-key'); // Hack for generic wrapper, best to use raw localStorage
            localStorage.setItem('SCHOOL_LOGO_BASE64', base64String);
        };
        reader.readAsDataURL(file);
    };

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            {/* Menú Lateral */}
            <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col transition-all duration-300">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                        {/* Logo o Icono por defecto */}
                        <div className="relative group w-12 h-12 flex-shrink-0 bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden border border-slate-700">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo de la Escuela" className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon className="w-6 h-6 text-blue-400" />
                            )}

                            {/* Botón Overlay para subir logo (aparece al hacer hover) */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                title="Cambiar Logo de la Escuela"
                            >
                                <Upload size={16} className="text-white" />
                            </button>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleLogoUpload}
                            className="hidden"
                        />

                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-bold tracking-tight text-white truncate break-words leading-tight">
                                Retiro Alumnos
                            </h1>
                        </div>
                    </div>
                    <p className="text-sm text-slate-400 mt-2 truncate px-1 bg-slate-800/50 rounded inline-block text-xs uppercase tracking-wide font-medium">Rol: {user.role}</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {isAdmin && (
                        <NavLink to="/" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
                            <LayoutDashboard size={20} /> Dashboard
                        </NavLink>
                    )}

                    {!isAdmin && (
                        <NavLink to="/registro-retiro" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
                            <UserCheck size={20} /> Registrar Retiro
                        </NavLink>
                    )}

                    {isAdmin && (
                        <>
                            <NavLink to="/alumnos" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
                                <Users size={20} /> Alumnos y Familiares
                            </NavLink>
                            <NavLink to="/historial-retiros" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-orange-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
                                <Calendar size={20} /> Historial de Retiros
                            </NavLink>
                            <NavLink to="/reportes" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
                                <FileText size={20} /> Reportes
                            </NavLink>
                            <NavLink to="/configuracion" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
                                <Settings size={20} /> Configuración / Info
                            </NavLink>
                        </>
                    )}
                </nav>

                <div className="p-4">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                    >
                        <LogOut size={18} /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Contenido Principal */}
            <main className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
