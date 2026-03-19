// ─────────────────────────────────────────
// ARCHIVO: HistorialRetiros.jsx
// DESCRIPCIÓN: Pantalla de consulta histórica de todos los retiros realizados.
// MÓDULO: Reportes / Auditoría
// DEPENDENCIAS: React, StorageService, Lucide Icons, Constants
// ─────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import StorageService from '../storage/localStorage';
import { STORAGE_KEYS } from '../config/constants';
import { Calendar, Search, Clock } from 'lucide-react';

/**
 * Componente que muestra una tabla con todos los registros de retiros guardados.
 * Permite filtrar por texto para encontrar alumnos, adultos o fechas específicas.
 */
const HistorialRetirosPage = () => {
    // --- ESTADOS ---
    const [withdrawals, setWithdrawals] = useState([]); // Array con todos los retiros de la BD
    const [searchTerm, setSearchTerm] = useState(''); // Estado para el filtro de búsqueda

    // Carga inicial al montar el componente
    useEffect(() => {
        loadWithdrawals();
    }, []);

    /**
     * Recupera los retiros del LocalStorage y los ordena cronológicamente.
     */
    const loadWithdrawals = () => {
        const data = StorageService.get(STORAGE_KEYS.WITHDRAWALS, []);
        
        // Ordenamos: Los más recientes aparecen primero en la lista
        const sortedData = [...data].sort((a, b) => 
            new Date(`${b.fecha}T${b.hora}`) - new Date(`${a.fecha}T${a.hora}`)
        );
        setWithdrawals(sortedData);
    };

    /**
     * Filtra la lista de retiros según el texto ingresado en el buscador.
     * Busca coincidencias en: Nombre del alumno, Nombre del adulto, Curso o Fecha.
     */
    const filteredWithdrawals = withdrawals.filter(w =>
        w.alumnoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.adultoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.curso.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.fecha.includes(searchTerm)
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Cabecera con Buscador integrado */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="text-orange-500" /> Historial de Retiros
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Ver todos los registros de alumnos retirados por el personal.</p>
                </div>

                {/* Input de Búsqueda */}
                <div className="relative w-full md:w-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por alumno, adulto, fecha..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-80 pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                    />
                </div>
            </header>

            {/* Tabla de Datos Principal */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-medium border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Fecha y Hora</th>
                                <th className="px-6 py-4">Estudiante</th>
                                <th className="px-6 py-4">Curso / Div</th>
                                <th className="px-6 py-4">Persona que Retiró</th>
                                <th className="px-6 py-4">DNI Adulto</th>
                                <th className="px-6 py-4">Motivo de Salida</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredWithdrawals.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                                        No se encontraron registros coincidentes.
                                    </td>
                                </tr>
                            ) : (
                                filteredWithdrawals.map((retiro, index) => (
                                    <tr key={index} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {/* Formateo de fecha argentina */}
                                                <div className="font-semibold text-slate-800">
                                                    {new Date(retiro.fecha + 'T12:00:00').toLocaleDateString('es-AR')}
                                                </div>
                                                {/* Etiqueta de hora (HH:MM) */}
                                                <div className="text-xs text-slate-400 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                                                    <Clock size={12} /> {retiro.hora.substring(0, 5)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">{retiro.alumnoNombre}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded text-xs font-medium">
                                                {retiro.curso} "{retiro.division}"
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{retiro.adultoNombre}</td>
                                        <td className="px-6 py-4 text-slate-500 font-mono">{retiro.adultoDni}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border border-orange-100">
                                                {retiro.motivo}
                                            </span>
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

export default HistorialRetirosPage;
