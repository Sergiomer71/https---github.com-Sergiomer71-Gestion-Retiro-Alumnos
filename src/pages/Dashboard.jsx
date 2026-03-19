// ─────────────────────────────────────────
// ARCHIVO: Dashboard.jsx
// DESCRIPCIÓN: Panel principal con estadísticas y gráficos
// MÓDULO: Administración / Vista General
// DEPENDENCIAS: React, Chart.js, Lucide Icons, StorageService
// ─────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import StorageService from '../storage/localStorage';
import { STORAGE_KEYS } from '../config/constants';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { GraduationCap, Clock, LayoutDashboard, Users, BookOpen } from 'lucide-react';

// Registro de los componentes necesarios de Chart.js para renderizar el gráfico de barras
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

/**
 * Pantalla que muestra un resumen cuantitativo del estado del sistema.
 */
const Dashboard = () => {
    // Definición de estados para los indicadores numéricos y los datos del gráfico
    const [stats, setStats] = useState({ alumnos: 0, retirosHoy: 0, cursos: 0 }); // Cifras generales
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });    // Estructura del gráfico

    // Efecto Inicial: Se cargan los datos al montar la pantalla
    useEffect(() => {
        loadDashboardData();
    }, []);

    /**
     * Recupera la información del LocalStorage y procesa las estadísticas.
     */
    const loadDashboardData = () => {
        const students = StorageService.get(STORAGE_KEYS.STUDENTS, []);
        const withdrawals = StorageService.get(STORAGE_KEYS.WITHDRAWALS, []);

        // Cálculo: Total de alumnos registrados en el sistema
        const totalAlumnos = students.length;

        // Cálculo: Retiros realizados en la fecha actual (hoy)
        const hoyStr = new Date().toISOString().split('T')[0];
        const retirosHoy = withdrawals.filter(w => w.fecha === hoyStr).length;

        // Cálculo: Cantidad de cursos únicos (combinación de curso y división)
        const uniqueCursos = new Set(students.map(s => `${s.curso} ${s.division}`));
        const totalCursos = uniqueCursos.size;

        // Actualizamos el estado con las cifras calculadas
        setStats({ alumnos: totalAlumnos, retirosHoy, cursos: totalCursos });

        // Procesamiento para el gráfico: Cantidad de Retiros Históricos por cada Curso
        const retirosPorCurso = {};
        withdrawals.forEach(w => {
            const cursoDiv = `${w.curso} ${w.division}`;
            if (!retirosPorCurso[cursoDiv]) retirosPorCurso[cursoDiv] = 0;
            retirosPorCurso[cursoDiv]++;
        });

        const labels = Object.keys(retirosPorCurso);
        const data = Object.values(retirosPorCurso);

        // Configuramos la estructura necesaria para que React-Chartjs2 dibuje el gráfico
        setChartData({
            labels: labels.length > 0 ? labels : ['Sin datos'],
            datasets: [
                {
                    label: 'Cantidad de Retiros',
                    data: data.length > 0 ? data : [0],
                    backgroundColor: 'rgba(59, 130, 246, 0.8)', // Estilo de color (Azul-500 de Tailwind)
                    borderRadius: 4,
                }
            ]
        });
    };

    /**
     * Opciones de personalización del gráfico de barras.
     */
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Retiros Históricos por Curso',
                font: { size: 16 }
            },
        },
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full pb-10">
            {/* Cabecera del Panel con Fecha Actual */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 text-white rounded-xl">
                            <LayoutDashboard size={28} />
                        </div>
                        Resumen General
                    </h1>
                    <p className="text-slate-500 mt-1 ml-11">Panel de control del sistema de retiros de alumnos.</p>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-2xl text-sm font-bold border border-indigo-100">
                    {/* Visualización de la fecha formateada en español */}
                    {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </header>

            {/* Tarjetas de Estadísticas (Grid de 3 columnas) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tarjeta: Total de Alumnos */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <GraduationCap size={80} className="text-indigo-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Inscriptos</span>
                    <div className="flex items-center gap-3 mt-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <Users size={24} />
                        </div>
                        <span className="text-5xl font-black text-slate-800 tracking-tighter">{stats.alumnos}</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-4 font-medium italic">Total de alumnos en el sistema</p>
                </div>

                {/* Tarjeta: Retiros del día */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Clock size={80} className="text-emerald-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Salidas de Hoy</span>
                    <div className="flex items-center gap-3 mt-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <Clock size={24} />
                        </div>
                        <span className="text-5xl font-black text-emerald-600 tracking-tighter">{stats.retirosHoy}</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-4 font-medium italic">Retiros registrados el día de hoy</p>
                </div>

                {/* Tarjeta: Secciones/Cursos activos */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <BookOpen size={80} className="text-amber-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Secciones</span>
                    <div className="flex items-center gap-3 mt-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                            <BookOpen size={24} />
                        </div>
                        <span className="text-5xl font-black text-slate-800 tracking-tighter">{stats.cursos}</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-4 font-medium italic">Cursos y divisiones activos</p>
                </div>
            </div>

            {/* Sección del Gráfico de Barras */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[450px]">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                    <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wider">Estadísticas por Curso</h3>
                </div>
                {/* Contenedor responsivo para el componente canvas de Chart.js */}
                <div className="w-full h-[350px]">
                    <Bar options={chartOptions} data={chartData} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

