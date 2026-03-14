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

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const [stats, setStats] = useState({ alumnos: 0, retirosHoy: 0, cursos: 0 });
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = () => {
        const students = StorageService.get(STORAGE_KEYS.STUDENTS, []);
        const withdrawals = StorageService.get(STORAGE_KEYS.WITHDRAWALS, []);

        // Calc total alumnos
        const totalAlumnos = students.length;

        // Calc retiros hoy
        const hoyStr = new Date().toISOString().split('T')[0];
        const retirosHoy = withdrawals.filter(w => w.fecha === hoyStr).length;

        // Calc cursos activos
        const uniqueCursos = new Set(students.map(s => `${s.curso} ${s.division}`));
        const totalCursos = uniqueCursos.size;

        setStats({ alumnos: totalAlumnos, retirosHoy, cursos: totalCursos });

        // Calc chart data: Retiros por Curso
        const retirosPorCurso = {};
        withdrawals.forEach(w => {
            const cursoDiv = `${w.curso} ${w.division}`;
            if (!retirosPorCurso[cursoDiv]) retirosPorCurso[cursoDiv] = 0;
            retirosPorCurso[cursoDiv]++;
        });

        const labels = Object.keys(retirosPorCurso);
        const data = Object.values(retirosPorCurso);

        setChartData({
            labels: labels.length > 0 ? labels : ['Sin datos'],
            datasets: [
                {
                    label: 'Cantidad de Retiros',
                    data: data.length > 0 ? data : [0],
                    backgroundColor: 'rgba(59, 130, 246, 0.8)', // Tailwind Blue-500
                    borderRadius: 4,
                }
            ]
        });
    };

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
        <div className="space-y-6 animate-in fade-in duration-500 w-full">
            <header>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
                <p className="text-slate-500 mt-1">Resumen general del sistema de retiros de alumnos.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Alumnos</span>
                    <span className="text-4xl font-bold text-slate-800 mt-2">{stats.alumnos}</span>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Retiros Hoy</span>
                    <span className="text-4xl font-bold text-blue-600 mt-2">{stats.retirosHoy}</span>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Cursos Activos</span>
                    <span className="text-4xl font-bold text-slate-800 mt-2">{stats.cursos}</span>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[400px] flex items-center justify-center">
                <div className="w-full h-[350px]">
                    <Bar options={chartOptions} data={chartData} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
