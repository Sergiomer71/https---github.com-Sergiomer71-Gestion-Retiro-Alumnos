// ─────────────────────────────────────────
// ARCHIVO: AltaCelador.jsx
// DESCRIPCIÓN: Pantalla para gestionar el alta y listado de celadores.
// MÓDULO: Gestión de Datos / Configuración
// DEPENDENCIAS: React, StorageService, Lucide Icons, Constants
// ─────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import StorageService from '../storage/localStorage';
import { STORAGE_KEYS } from '../config/constants';
import { UserPlus, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

/**
 * Componente exclusivo para Administradores destinado al ABM de Celadores.
 */
const AltaCeladorPage = () => {
    // --- ESTADOS DE LA PÁGINA ---
    const [celadores, setCeladores] = useState([]);
    
    // --- ESTADOS DEL FORMULARIO ---
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [telefono, setTelefono] = useState('');
    const [turno, setTurno] = useState('Mañana');
    
    // --- ESTADOS DE FEEDBACK ---
    const [status, setStatus] = useState(null);

    // Cargar datos iniciales
    useEffect(() => {
        cargarCeladores();
    }, []);

    const cargarCeladores = () => {
        const data = StorageService.get(STORAGE_KEYS.CELADORES, []);
        setCeladores(data);
    };

    /**
     * Valida y guarda un nuevo celador en el LocalStorage
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validación básica (el required del html5 ya ayuda, pero aseguramos)
        if (!nombre.trim() || !apellido.trim() || !telefono.trim() || !turno) {
            setStatus({ type: 'error', msg: 'Todos los campos son obligatorios.' });
            return;
        }

        // Validar que teléfono sea numérico
        if (!/^\d+$/.test(telefono)) {
            setStatus({ type: 'error', msg: 'El teléfono debe contener solo números.' });
            return;
        }

        const nuevoCelador = {
            id: Date.now().toString(),
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            telefono: telefono.trim(),
            turno: turno
        };

        try {
            StorageService.addItem(STORAGE_KEYS.CELADORES, nuevoCelador);
            setStatus({ type: 'success', msg: 'Celador registrado exitosamente.' });
            
            // Limpiar formulario
            setNombre('');
            setApellido('');
            setTelefono('');
            setTurno('Mañana');
            
            // Recargar lista
            cargarCeladores();
            
            // Ocultar mensaje de éxito después de 3 segundos
            setTimeout(() => setStatus(null), 3000);
        } catch (error) {
            setStatus({ type: 'error', msg: 'Ocurrió un error al guardar el celador.' });
        }
    };

    /**
     * Elimina un celador seleccionado
     */
    const handleDelete = (id) => {
        if (window.confirm('¿Está seguro de eliminar a este celador?')) {
            StorageService.removeItem(STORAGE_KEYS.CELADORES, id);
            cargarCeladores();
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto w-full animate-in fade-in duration-500 pb-20">
            {/* Cabecera */}
            <header>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <UserPlus className="text-emerald-600" /> Alta de Celador
                </h1>
                <p className="text-slate-500 mt-2">Registre nuevos celadores para el sistema.</p>
            </header>

            {/* Feedback Visual */}
            {status && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 ${status.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
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
                    <h2 className="text-lg font-bold text-slate-800">Datos del Celador</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                            <input 
                                required 
                                type="text" 
                                value={nombre} 
                                onChange={e => setNombre(e.target.value)} 
                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                                placeholder="Ej: Juan"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
                            <input 
                                required 
                                type="text" 
                                value={apellido} 
                                onChange={e => setApellido(e.target.value)} 
                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                placeholder="Ej: Pérez"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                            <input 
                                required 
                                type="text" 
                                pattern="\d+"
                                title="Solo números"
                                value={telefono} 
                                onChange={e => setTelefono(e.target.value)} 
                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                placeholder="Ej: 2615555555"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Turno</label>
                            <select 
                                required
                                value={turno} 
                                onChange={e => setTurno(e.target.value)} 
                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all bg-white"
                            >
                                <option value="Mañana">Mañana</option>
                                <option value="Tarde">Tarde</option>
                                <option value="Noche">Noche</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="pt-4 flex justify-end">
                        <button 
                            type="submit" 
                            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-8 py-3 rounded-xl font-bold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            Guardar Celador
                        </button>
                    </div>
                </form>
            </div>

            {/* Listado de Celadores */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-800">Celadores Registrados</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Nombre Completo</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Teléfono</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Turno</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {celadores.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                        No hay celadores registrados en el sistema.
                                    </td>
                                </tr>
                            ) : (
                                celadores.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800">
                                            {c.apellido}, {c.nombre}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{c.telefono}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                                {c.turno}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDelete(c.id)} 
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar celador"
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

export default AltaCeladorPage;
