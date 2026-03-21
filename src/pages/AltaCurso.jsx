// ─────────────────────────────────────────
// ARCHIVO: AltaCurso.jsx
// DESCRIPCIÓN: Pantalla para gestionar el alta y listado de cursos y divisiones.
// MÓDULO: Gestión de Datos / Configuración
// DEPENDENCIAS: React, StorageService, Lucide Icons, Constants
// ─────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import StorageService from '../storage/localStorage';
import { STORAGE_KEYS } from '../config/constants';
import { BookOpen, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

/**
 * Componente exclusivo para Administradores destinado al ABM de Cursos.
 */
const AltaCursoPage = () => {
    // --- ESTADOS DE LA PÁGINA ---
    const [cursos, setCursos] = useState([]);
    
    // --- ESTADOS DEL FORMULARIO ---
    const [nombreCurso, setNombreCurso] = useState('');
    
    // --- ESTADOS DE FEEDBACK ---
    const [status, setStatus] = useState(null);

    // Cargar datos iniciales
    useEffect(() => {
        cargarCursos();
    }, []);

    const cargarCursos = () => {
        const data = StorageService.get(STORAGE_KEYS.CURSOS, []);
        setCursos(data);
    };

    /**
     * Estandariza el texto para comparar duplicados
     * Elimina espacios extra y pasa a minúsculas
     */
    const normalizarTexto = (texto) => {
        return texto.trim().toLowerCase().replace(/\s+/g, ' ');
    };

    /**
     * Valida y guarda un nuevo curso en el LocalStorage
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        
        const valorLimpio = nombreCurso.trim();

        // Validar vacío
        if (!valorLimpio) {
            setStatus({ type: 'error', msg: 'El nombre del curso es obligatorio.' });
            return;
        }

        // Validar duplicados exactos (ignorando mayúsculas/minúsculas y espacios extra)
        const textoNormalizado = normalizarTexto(valorLimpio);
        const existeDuplicado = cursos.some(c => normalizarTexto(c.nombre) === textoNormalizado);

        if (existeDuplicado) {
            setStatus({ type: 'error', msg: 'Este curso ya se encuentra registrado.' });
            return;
        }

        const nuevoCursoObj = {
            id: Date.now().toString(),
            nombre: valorLimpio
        };

        try {
            StorageService.addItem(STORAGE_KEYS.CURSOS, nuevoCursoObj);
            setStatus({ type: 'success', msg: 'Curso registrado exitosamente.' });
            
            // Limpiar formulario
            setNombreCurso('');
            
            // Recargar lista
            cargarCursos();
            
            // Ocultar mensaje de éxito después de 3 segundos
            setTimeout(() => setStatus(null), 3000);
        } catch (error) {
            setStatus({ type: 'error', msg: 'Ocurrió un error al guardar el curso.' });
        }
    };

    /**
     * Elimina un curso seleccionado
     */
    const handleDelete = (id) => {
        if (window.confirm('¿Está seguro de eliminar este curso?')) {
            StorageService.removeItem(STORAGE_KEYS.CURSOS, id);
            cargarCursos();
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto w-full animate-in fade-in duration-500 pb-20">
            {/* Cabecera */}
            <header>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <BookOpen className="text-blue-600" /> Alta de Curso y División
                </h1>
                <p className="text-slate-500 mt-2">Agregue nuevos cursos y divisiones disponibles en la institución.</p>
            </header>

            {/* Feedback Visual */}
            {status && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 ${status.type === 'success' ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {status.type === 'success' ? <CheckCircle2 className="shrink-0" /> : <AlertTriangle className="shrink-0" />}
                    <div>
                        <p className="font-bold">{status.type === 'success' ? 'Operación Exitosa' : 'Error'}</p>
                        <p className="text-sm mt-1">{status.msg}</p>
                    </div>
                </div>
            )}

            {/* Formulario de Alta */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-800">Datos del Curso</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Curso y División (texto libre)</label>
                            <input 
                                required 
                                type="text" 
                                value={nombreCurso} 
                                onChange={e => setNombreCurso(e.target.value)} 
                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-lg" 
                                placeholder='Ej: "1° 1ra", "5° 3ra", "3° B"'
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-8 py-2.5 rounded-xl font-bold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 h-[46px]"
                        >
                            Guardar Curso
                        </button>
                    </div>
                </form>
            </div>

            {/* Listado de Cursos */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-800">Cursos Registrados</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Curso / División</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider text-right w-32">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {cursos.length === 0 ? (
                                <tr>
                                    <td colSpan="2" className="px-6 py-12 text-center text-slate-500">
                                        No hay cursos registrados en el sistema.
                                    </td>
                                </tr>
                            ) : (
                                cursos.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800 text-lg">
                                            {c.nombre}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDelete(c.id)} 
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar curso"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AltaCursoPage;
