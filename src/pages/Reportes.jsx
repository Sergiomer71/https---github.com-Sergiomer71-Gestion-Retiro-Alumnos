import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import StorageService from '../storage/localStorage';
import { STORAGE_KEYS } from '../config/constants';
import { FileText, Printer, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const ReportesPage = () => {
    const generateAlumnosReport = () => {
        const doc = new jsPDF();
        const students = StorageService.get(STORAGE_KEYS.STUDENTS, []);

        // Título
        doc.setFontSize(18);
        doc.text('Reporte de Alumnos por Curso', 14, 22);

        // Metadatos
        doc.setFontSize(11);
        doc.text(`Fecha de Emisión: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);

        // Preparar datos ordenados por Curso y División
        const sortedStudents = [...students].sort((a, b) => {
            const c1 = `${a.curso}${a.division}`;
            const c2 = `${b.curso}${b.division}`;
            return c1.localeCompare(c2);
        });

        const tableData = sortedStudents.map(s => [
            `${s.curso} "${s.division}"`,
            s.turno,
            `${s.apellido}, ${s.nombre}`,
            s.dni,
            s.preceptor || 'No Asignado',
            s.familiares ? s.familiares.length.toString() : '0'
        ]);

        autoTable(doc, {
            startY: 38,
            head: [['Curso', 'Turno', 'Alumno', 'DNI', 'Preceptor', 'Familiares Auth.']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }, // Azul 500 de Tailwind
            didDrawPage: (data) => {
                // Paginación del pie de página
                let str = 'Página ' + doc.internal.getNumberOfPages();
                doc.setFontSize(10);
                let pageSize = doc.internal.pageSize;
                let pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
                doc.text(str, data.settings.margin.left, pageHeight - 10);
            }
        });

        doc.save(`alumnos_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
    };

    const generateRetirosReport = () => {
        const doc = new jsPDF('landscape');
        const withdrawals = StorageService.get(STORAGE_KEYS.WITHDRAWALS, []);

        // Título
        doc.setFontSize(18);
        doc.text('Historial de Retiros', 14, 22);

        doc.setFontSize(11);
        doc.text(`Total Registros: ${withdrawals.length} | Fecha de Emisión: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);

        const sortedWithdrawals = [...withdrawals].sort((a, b) => new Date(`${b.fecha}T${b.hora}`) - new Date(`${a.fecha}T${a.hora}`));

        const tableData = sortedWithdrawals.map(w => [
            w.fecha,
            w.hora,
            w.alumnoNombre,
            `${w.curso} "${w.division}"`,
            w.adultoNombre,
            w.adultoDni,
            w.motivo
        ]);

        autoTable(doc, {
            startY: 38,
            head: [['Fecha', 'Hora', 'Alumno', 'Curso', 'Retirado por', 'DNI Adulto', 'Motivo']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }
        });

        doc.save(`retiros_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <FileText className="text-blue-600" /> Reportes Estadísticos
                </h1>
                <p className="text-slate-500 mt-2">Generación de reportes PDF para la gestión administrativa.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Reporte de Alumnos */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-4 text-slate-800 font-bold text-xl">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <Printer size={24} />
                            </div>
                            Alumnos por Curso
                        </div>
                        <p className="text-slate-500 text-sm mb-6">
                            Listado completo de todos los alumnos segregados por curso y división,
                            incluyendo información de familiares autorizados.
                        </p>
                    </div>
                    <button
                        onClick={generateAlumnosReport}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                    >
                        Descargar PDF
                    </button>
                </div>

                {/* Reporte de Retiros */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-4 text-slate-800 font-bold text-xl">
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                                <Calendar size={24} />
                            </div>
                            Historial de Retiros
                        </div>
                        <p className="text-slate-500 text-sm mb-6">
                            Registro histórico de todos los retiros realizados, incluyendo detalles del alumno,
                            adulto responsable, fecha, hora y motivo.
                        </p>
                    </div>
                    <button
                        onClick={generateRetirosReport}
                        className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-slate-800/20"
                    >
                        Descargar PDF
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ReportesPage;
