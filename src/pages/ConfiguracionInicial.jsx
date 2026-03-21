// ─────────────────────────────────────────
// ARCHIVO: ConfiguracionInicial.jsx
// DESCRIPCIÓN: Pantalla de primer uso para configurar el perfil de la escuela
// MÓDULO: Autenticación / Acceso / Onboarding
// DEPENDENCIAS: React, React Router, Lucide Icons, StorageService, Constants
// ─────────────────────────────────────────

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StorageService from '../storage/localStorage';
import { STORAGE_KEYS } from '../config/constants';
import { GraduationCap, Folder } from 'lucide-react';

/**
 * Pantalla que intercepta al Administrador en su primer inicio de sesión.
 */
const ConfiguracionInicial = () => {
    const navigate = useNavigate();
    const [nombre, setNombre] = useState('');
    const [direccion, setDireccion] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [sitioWeb, setSitioWeb] = useState('');
    const [logoPreview, setLogoPreview] = useState(null);
    const [error, setError] = useState('');

    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 500 * 1024) {
            alert('El archivo supera el máximo permitido de 500KB. Por favor elija uno más pequeño.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!nombre.trim() || !direccion.trim()) {
            setError('Por favor, complete al menos el Nombre y la Dirección.');
            return;
        }

        const institucion = {
            nombre: nombre.trim(),
            direccion: direccion.trim(),
            telefono: telefono.trim(),
            email: email.trim(),
            sitioWeb: sitioWeb.trim(),
            logo: logoPreview
        };

        StorageService.set(STORAGE_KEYS.INSTITUCION, institucion);
        localStorage.removeItem('SCHOOL_LOGO_BASE64');
        navigate('/', { replace: true });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-10 px-4">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden px-8 py-10">
                
                {/* Cabecera visual basada en la captura de pantalla del usuario */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-semibold text-slate-800 flex items-center justify-center gap-3">
                        <GraduationCap size={32} className="text-amber-800 fill-amber-700" />
                        Bienvenido al Sistema <span className="text-blue-600 text-lg uppercase tracking-wide font-medium mt-1">Registro de Retiros</span>
                    </h1>
                    <p className="text-slate-500 mt-2 text-[15px]">
                        Configuremos tu institución en 5 pasos simples
                    </p>
                </div>

                {/* Barra de progreso */}
                <div className="w-full bg-slate-100 h-6 rounded-md overflow-hidden mb-10 flex text-xs font-bold text-white">
                    <div className="bg-emerald-700 h-full flex items-center px-4 whitespace-nowrap" style={{ width: '20%' }}>
                        Paso 1 de 5
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 text-red-600 p-3 rounded text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col md:flex-row gap-10">
                        {/* Columna Izquierda: Entradas de texto */}
                        <div className="flex-1 space-y-6">
                            <div>
                                <label className="block text-[15px] font-semibold text-slate-800 mb-2">
                                    Nombre de la Institución *
                                </label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={nombre}
                                    onChange={e => setNombre(e.target.value)}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-[15px] font-semibold text-slate-800 mb-2">
                                    Dirección *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={direccion}
                                    onChange={e => setDireccion(e.target.value)}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[15px] font-semibold text-slate-800 mb-2">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        value={telefono}
                                        onChange={e => setTelefono(e.target.value)}
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[15px] font-semibold text-slate-800 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[15px] font-semibold text-slate-800 mb-2">
                                    Sitio Web (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={sitioWeb}
                                    onChange={e => setSitioWeb(e.target.value)}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Columna Derecha: Logo */}
                        <div className="w-full md:w-[320px] shrink-0">
                            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-8 flex flex-col items-center justify-center h-full text-center">
                                <label className="block font-semibold text-slate-800 mb-6">
                                    Logo de la Institución
                                </label>
                                
                                <div className="w-40 h-40 bg-green-50 rounded-full flex flex-col items-center justify-center overflow-hidden border-4 border-white shadow-sm mb-6 relative">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-green-600 flex flex-col items-center select-none pt-4">
                                            {/* Forma genérica basada en la imagen: una forma de persona abstracta verde estilo "HORARIOS" */}
                                            <div className="w-6 h-6 rounded-full bg-green-600 mb-1"></div>
                                            <div className="w-12 h-16 bg-green-600 mb-2" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
                                            <span className="text-[10px] font-bold tracking-widest text-green-600 mt-[-8px]">HORARIOS</span>
                                        </div>
                                    )}
                                </div>

                                <button 
                                    type="button" 
                                    onClick={() => document.getElementById('logo-upload').click()}
                                    className="flex items-center gap-2 px-6 py-2 bg-white border border-blue-200 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
                                >
                                    <Folder size={18} className="text-amber-500 fill-amber-200" /> Subir Logo
                                </button>
                                <p className="text-sm text-slate-400 mt-3">
                                    PNG o JPG, máx 500KB
                                </p>

                                <input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/png, image/jpeg"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 mt-6 border-t border-slate-100 flex justify-end">
                        <button
                            type="submit"
                            className="w-full md:w-auto px-8 py-3 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 transition-colors shadow-sm active:scale-95"
                        >
                            Guardar y Comenzar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConfiguracionInicial;
