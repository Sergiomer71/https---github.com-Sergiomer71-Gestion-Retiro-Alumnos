// ─────────────────────────────────────────
// ARCHIVO: Reportes.jsx
// DESCRIPCIÓN: Generación de reportes administrativos en formato PDF.
// MÓDULO: Reportes y Estadísticas
// DEPENDENCIAS: React, jsPDF, jspdf-autotable, StorageService, date-fns
// ─────────────────────────────────────────

import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import StorageService from '../storage/localStorage';
import { STORAGE_KEYS } from '../config/constants';
import { FileText, Printer, Calendar } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Componente que provee las funciones para generar y descargar reportes PDF.
 * Incluye el listado de alumnos por curso y el historial de retiros.
 */
const ReportesPage = () => {
    
    /**
     * Genera un archivo PDF con la lista de alumnos, organizados por curso/división.
     */
    const generateAlumnosReport = () => {
        const doc = new jsPDF();
        const students = StorageService.get(STORAGE_KEYS.STUDENTS, []);
        const preceptores = StorageService.get(STORAGE_KEYS.PRECEPTORS, []);

        // --- ENCABEZADO DEL DOCUMENTO ---
        doc.setFontSize(18);
        doc.text('Reporte de Alumnos por Curso', 14, 22);

        doc.setFontSize(11);
        doc.text(`Fecha de Emisión: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);

        // --- PROCESAMIENTO DE DATOS ---
        // Ordenamos alfabéticamente por Curso (1ro, 2do...) y luego División (A, B...)
        const sortedStudents = [...students].sort((a, b) => {
            const c1 = `${a.curso}${a.division}`;
            const c2 = `${b.curso}${b.division}`;
            return c1.localeCompare(c2);
        });

        // Mapeamos los datos de los estudiantes para la estructura de la tabla
        const tableData = sortedStudents.map(s => {
            // Buscamos quién es el preceptor a cargo (usando ID o coincidencia de curso)
            let preceptorName = 'No Asignado';
            let preceptorObj = null;

            // 1. Intentamos por ID directo
            if (s.preceptor) {
                preceptorObj = preceptores.find(p => p.id === s.preceptor);
            }
            
            // 2. Si no hay ID, buscamos por curso/división
            if (!preceptorObj) {
                preceptorObj = preceptores.find(p => {
                    if (p.cursos && p.cursos.length > 0) {
                        return p.cursos.some(c => c.curso === s.curso && c.division === s.division);
                    }
                    return p.curso === s.curso && p.division === s.division;
                });
            }

            if (preceptorObj) {
                preceptorName = `${preceptorObj.apellido}, ${preceptorObj.nombre}`;
            }

            return [
                `${s.curso} "${s.division}"`,
                s.turno,
                `${s.apellido}, ${s.nombre}`,
                s.dni,
                preceptorName,
                s.familiares ? s.familiares.length.toString() : '0'
            ];
        });

        // --- CONSTRUCCIÓN DE LA TABLA (jsPDF Autotable) ---
        autoTable(doc, {
            startY: 38,
            head: [['Curso', 'Turno', 'Alumno', 'DNI', 'Preceptor', 'Fam. Auth.']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }, // Azul vibrante
            didDrawPage: (data) => {
                // Agregar número de página al final
                let str = 'Página ' + doc.internal.getNumberOfPages();
                doc.setFontSize(10);
                let pageSize = doc.internal.pageSize;
                let pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
                doc.text(str, data.settings.margin.left, pageHeight - 10);
            }
        });

        // Descargamos el archivo con nombre dinámico (fecha actual)
        doc.save(`alumnos_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
    };

    /**
     * Genera un archivo PDF horizontal con el historial completo de retiros registrados.
     */
    const generateRetirosReport = () => {
        const doc = new jsPDF('landscape'); // Formato horizontal para más columnas
        const withdrawals = StorageService.get(STORAGE_KEYS.WITHDRAWALS, []);

        // --- ENCABEZADO ---
        doc.setFontSize(18);
        doc.text('Historial de Retiros Registrados', 14, 22);

        doc.setFontSize(11);
        doc.text(`Total Registros: ${withdrawals.length} | Fecha de Emisión: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);

        // Ordenamos los retiros del más reciente al más antiguo
        const sortedWithdrawals = [...withdrawals].sort((a, b) => 
            new Date(`${b.fecha}T${b.hora}`) - new Date(`${a.fecha}T${a.hora}`)
        );

        // Preparar filas de la tabla
        const tableData = sortedWithdrawals.map(w => [
            w.fecha,
            w.hora,
            w.alumnoNombre,
            `${w.curso} "${w.division}"`,
            w.adultoNombre,
            w.adultoDni,
            w.motivo
        ]);

        // Crear la tabla en el PDF
        autoTable(doc, {
            startY: 38,
            head: [['Fecha', 'Hora', 'Alumno', 'Curso', 'Retirado por', 'DNI Adulto', 'Motivo']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }
        });

        // Guardar/Descargar
        doc.save(`retiros_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Cabecera de la sección */}
            <header>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <FileText className="text-blue-600" /> Reportes Estadísticos
                </h1>
                <p className="text-slate-500 mt-2">Descargue reportes oficiales en formato PDF para el archivo administrativo.</p>
            </header>

            {/* Cuadrícula de opciones de reporte */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                
                {/* TARJETA 1: Alumnos */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <div className="flex items-center gap-3 mb-4 text-slate-800 font-bold text-xl">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <Printer size={24} />
                            </div>
                            Alumnos por Curso
                        </div>
                        <p className="text-slate-500 text-sm mb-6">
                            Listado completo de todos los estudiantes organizados por su curso y división. 
                            Útil para verificar la base de datos de preceptores.
                        </p>
                    </div>
                    <button
                        onClick={generateAlumnosReport}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                    >
                        Descargar Reporte PDF
                    </button>
                </div>

                {/* TARJETA 2: Retiros */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <div className="flex items-center gap-3 mb-4 text-slate-800 font-bold text-xl">
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                                <Calendar size={24} />
                            </div>
                            Historial de Retiros
                        </div>
                        <p className="text-slate-500 text-sm mb-6">
                            Registro completo de todas las salidas registradas en el sistema, detallando el alumno y 
                            la persona responsable que lo retiró.
                        </p>
                    </div>
                    <button
                        onClick={generateRetirosReport}
                        className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-slate-800/20"
                    >
                        Descargar Historial PDF
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ReportesPage;
