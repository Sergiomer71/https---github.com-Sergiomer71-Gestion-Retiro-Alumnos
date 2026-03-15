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
            <aside className="w-72 bg-slate-950 text-slate-100 flex flex-col transition-all duration-500 shadow-2xl z-20">
                <div className="p-8 border-b border-slate-800/50 bg-slate-900/40 backdrop-blur-md">
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

                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {isAdmin && (
                        <NavLink to="/" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-100'}`}>
                            <LayoutDashboard size={20} className="group-hover:text-indigo-400 transition-colors" /> 
                            <span className="font-semibold tracking-wide">Dashboard</span>
                        </NavLink>
                    )}

                    {!isAdmin && (
                        <NavLink to="/registro-retiro" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-100'}`}>
                            <UserCheck size={20} className="group-hover:text-indigo-400 transition-colors" /> 
                            <span className="font-semibold tracking-wide">Registrar Retiro</span>
                        </NavLink>
                    )}

                    {isAdmin && (
                        <>
                            <div className="pt-4 pb-2 px-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Administración</span>
                            </div>
                            <NavLink to="/alumnos" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-100'}`}>
                                <Users size={20} /> <span className="font-semibold tracking-wide">Alumnos</span>
                            </NavLink>
                            <NavLink to="/preceptores" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-100'}`}>
                                <UserCheck size={20} /> <span className="font-semibold tracking-wide">Preceptores</span>
                            </NavLink>
                            
                            <div className="pt-4 pb-2 px-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Reportes</span>
                            </div>
                            <NavLink to="/historial-retiros" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-100'}`}>
                                <Calendar size={20} /> <span className="font-semibold tracking-wide">Historial</span>
                            </NavLink>
                            <NavLink to="/reportes" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-slate-800 text-white shadow-lg' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-100'}`}>
                                <FileText size={20} /> <span className="font-semibold tracking-wide">Reportes PDF</span>
                            </NavLink>
                            
                            <div className="pt-4 pb-2 px-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Sistema</span>
                            </div>
                            <NavLink to="/configuracion" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-slate-800 text-white shadow-lg' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-100'}`}>
                                <Settings size={20} /> <span className="font-semibold tracking-wide">Configuración</span>
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
