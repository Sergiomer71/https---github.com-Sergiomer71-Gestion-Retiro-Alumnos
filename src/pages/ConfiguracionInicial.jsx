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
import { Landmark, UploadCloud, Building2, MapPin, Phone, Mail, Globe, Image as ImageIcon } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 border border-slate-200">
                
                {/* Cabecera / Título (Con diseño ajustado al estilo del sistema) */}
                <div className="p-8 pb-4 border-b border-slate-100 bg-slate-50/50">
                    <h1 className="text-3xl font-extrabold text-slate-800 flex items-center justify-center md:justify-start gap-4">
                        <span className="p-3 bg-indigo-100 text-indigo-600 rounded-xl shadow-inner border border-indigo-200">
                            <Landmark size={32} strokeWidth={2} />
                        </span>
                        <div>
                            <span>Bienvenidos al Sistema</span>
                            <span className="text-indigo-600 tracking-wider text-lg ml-2 uppercase font-black bg-indigo-100 px-3 py-1 rounded-lg border border-indigo-200/50">Registro de Retiros</span>
                        </div>
                    </h1>
                </div>

                {/* Mensaje de error (si ocurre) */}
                {error && (
                    <div className="mx-8 mt-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-200 flex items-center">
                        <span className="w-2 h-2 bg-red-600 rounded-full block mr-3 animate-pulse"></span>
                        {error}
                    </div>
                )}

                <div className="p-8">
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col md:flex-row gap-10">
                            {/* Columna Izquierda: Entradas de texto */}
                            <div className="flex-1 space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                        <Building2 size={16} className="text-indigo-400" />
                                        Nombre de la Institución <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        autoFocus
                                        value={nombre}
                                        onChange={e => setNombre(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-700 placeholder-slate-400"
                                        placeholder="Ej: Instituto San Martín"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                        <MapPin size={16} className="text-indigo-400" />
                                        Dirección <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={direccion}
                                        onChange={e => setDireccion(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-700 placeholder-slate-400"
                                        placeholder="Ej: Av. Principal 1234, Ciudad"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                            <Phone size={16} className="text-indigo-400" />
                                            Teléfono
                                        </label>
                                        <input
                                            type="tel"
                                            value={telefono}
                                            onChange={e => setTelefono(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-700 placeholder-slate-400"
                                            placeholder="Ej: 011 4455-6677"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                            <Mail size={16} className="text-indigo-400" />
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-700 placeholder-slate-400"
                                            placeholder="contacto@instituto.edu.ar"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                        <Globe size={16} className="text-indigo-400" />
                                        Sitio Web <span className="text-slate-400 font-normal text-xs">(Opcional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={sitioWeb}
                                        onChange={e => setSitioWeb(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-700 placeholder-slate-400"
                                        placeholder="https://www.instituto.edu.ar"
                                    />
                                </div>
                            </div>

                            {/* Columna Derecha: Logo */}
                            <div className="w-full md:w-[320px] shrink-0">
                                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center h-full text-center relative overflow-hidden group">
                                    <label className="block text-sm font-extrabold text-slate-700 mb-5 uppercase tracking-wider text-xs z-10">
                                        Logo de la Institución
                                    </label>
                                    
                                    <div 
                                        onClick={() => document.getElementById('logo-upload').click()}
                                        className="w-40 h-40 bg-white rounded-full flex flex-col items-center justify-center overflow-hidden border-4 border-indigo-100 shadow-md mb-6 relative cursor-pointer hover:border-indigo-300 transition-colors z-10"
                                    >
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Vista Previa" className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                                        ) : (
                                            <div className="text-indigo-600 flex flex-col items-center select-none pt-4 group-hover:scale-105 transition-transform">
                                                {/* Figura adaptada al pedido del usuario ("REGISTRO DE RETIROS") */}
                                                <div className="w-7 h-7 rounded-full bg-indigo-600 mb-1 shadow-sm"></div>
                                                <div className="w-14 h-16 bg-indigo-600 mb-1 shadow-sm" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
                                                <span className="text-[9px] font-black tracking-widest text-indigo-700 mt-[-5px]">REGISTRO DE RETIROS</span>
                                            </div>
                                        )}
                                        
                                        {!logoPreview && (
                                            <div className="absolute inset-0 bg-indigo-900/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            </div>
                                        )}
                                    </div>

                                    <button 
                                        type="button" 
                                        onClick={() => document.getElementById('logo-upload').click()}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm z-10"
                                    >
                                        <UploadCloud size={18} /> Seleccionar Imagen
                                    </button>
                                    <p className="text-xs font-medium text-slate-400 mt-4 z-10">
                                        Formatos soportados: PNG o JPG<br/>Tamaño máximo: 500 KB
                                    </p>

                                    <input
                                        id="logo-upload"
                                        type="file"
                                        accept="image/png, image/jpeg"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                    />
                                    
                                    {/* Decoración de fondo */}
                                    <div className="absolute w-64 h-64 bg-indigo-50 rounded-full blur-3xl -bottom-10 -right-10 pointer-events-none opacity-60"></div>
                                </div>
                            </div>
                        </div>

                        {/* Boton Guardar */}
                        <div className="pt-8 mt-6 border-t border-slate-200 flex justify-end">
                            <button
                                type="submit"
                                className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                            >
                                Guardar y Comenzar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ConfiguracionInicial;
