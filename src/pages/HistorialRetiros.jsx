import React, { useState, useEffect } from 'react';
import StorageService from '../storage/localStorage';
import { STORAGE_KEYS } from '../config/constants';
import { Calendar, Search, Clock } from 'lucide-react';

const HistorialRetirosPage = () => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadWithdrawals();
    }, []);

    const loadWithdrawals = () => {
        const data = StorageService.get(STORAGE_KEYS.WITHDRAWALS, []);
        // Sort newest first
        const sortedData = [...data].sort((a, b) => new Date(`${b.fecha}T${b.hora}`) - new Date(`${a.fecha}T${a.hora}`));
        setWithdrawals(sortedData);
    };

    const filteredWithdrawals = withdrawals.filter(w =>
        w.alumnoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.adultoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.curso.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.fecha.includes(searchTerm)
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="text-orange-500" /> Historial de Retiros
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Ver todos los registros de alumnos retirados por el personal.</p>
                </div>

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

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-medium border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Fecha y Hora</th>
                                <th className="px-6 py-4">Alumno</th>
                                <th className="px-6 py-4">Curso</th>
                                <th className="px-6 py-4">Retirado por</th>
                                <th className="px-6 py-4">DNI Adulto</th>
                                <th className="px-6 py-4">Motivo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredWithdrawals.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                                        No hay registros de retiros encontrados.
                                    </td>
                                </tr>
                            ) : (
                                filteredWithdrawals.map((retiro, index) => (
                                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="font-semibold text-slate-800">{new Date(retiro.fecha + 'T12:00:00').toLocaleDateString('es-AR')}</div>
                                                <div className="text-xs text-slate-400 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded"><Clock size={12} /> {retiro.hora.substring(0, 5)}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-800">{retiro.alumnoNombre}</td>
                                        <td className="px-6 py-4">{retiro.curso} "{retiro.division}"</td>
                                        <td className="px-6 py-4">{retiro.adultoNombre}</td>
                                        <td className="px-6 py-4">{retiro.adultoDni}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs font-semibold">
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
