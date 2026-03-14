import React, { useState, useEffect, useRef } from 'react';
import StorageService from '../storage/localStorage';
import { STORAGE_KEYS } from '../config/constants';
import { Search, UserCheck, Clock, UserMinus, Users, GraduationCap, ShieldCheck } from 'lucide-react';

const RegistroRetiroPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [preceptorAsignado, setPreceptorAsignado] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    // Estado del Formulario de Retiro
    const [motivo, setMotivo] = useState('Enfermedad');
    const [adultoId, setAdultoId] = useState('');
    const [celador, setCelador] = useState(sessionStorage.getItem('activeUserId'));

    const searchDebounceRef = useRef(null);

    useEffect(() => {
        // Implementar Debounce para la búsqueda
        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }

        if (searchTerm.trim().length === 0) {
            setResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        searchDebounceRef.current = setTimeout(() => {
            const allStudents = StorageService.get(STORAGE_KEYS.STUDENTS, []);
            const term = searchTerm.toLowerCase();

            const filtered = allStudents.filter(s => {
                const nombre = (s.nombre || '').toLowerCase();
                const apellido = (s.apellido || '').toLowerCase();
                const dni = String(s.dni || '');
                const curso = (s.curso || '').toLowerCase();

                return nombre.includes(term) ||
                    apellido.includes(term) ||
                    dni.includes(term) ||
                    curso.includes(term);
            }).slice(0, 10); // Limitar a los mejores 10 para rendimiento

            setResults(filtered);
            setIsSearching(false);
        }, 300); // 300ms de debounce

    }, [searchTerm]);

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        setSearchTerm('');
        setResults([]);

        // Buscar el preceptor asociado
        const preceptores = StorageService.get(STORAGE_KEYS.PRECEPTORS, []);
        let preceptorMatch = null;
        
        // 1. Prioridad: El alumno tiene un preceptor.id explícitamente guardado
        if (student.preceptor) {
            preceptorMatch = preceptores.find(p => p.id === student.preceptor);
        }

        // 2. Si no tiene id/nombre preciso o no se encontró, buscar según el curso del alumno en las listas de cursos de preceptores
        if (!preceptorMatch) {
             preceptorMatch = preceptores.find(p => {
                 if (p.cursos && p.cursos.length > 0) {
                     return p.cursos.some(c => c.curso === student.curso && c.division === student.division);
                 } else { // Compatibilidad con estructura vieja de preceptor (curso string y division string)
                     return p.curso === student.curso && p.division === student.division;
                 }
             });
        }
        
        setPreceptorAsignado(preceptorMatch || null);
    };

    const handleRegistrar = (e) => {
        e.preventDefault();
        if (!selectedStudent || !adultoId) return;

        // Buscar la información del adulto
        const adulto = selectedStudent.familiares?.find(f => f.dni === adultoId) || { nombre: 'Desconocido' };

        const retiro = {
            alumnoId: selectedStudent.id,
            alumnoNombre: `${selectedStudent.apellido}, ${selectedStudent.nombre}`,
            curso: selectedStudent.curso,
            division: selectedStudent.division,
            adultoNombre: `${adulto.nombre} ${adulto.apellido || ''}`,
            adultoDni: adulto.dni,
            motivo,
            celadorId: celador,
            fecha: new Date().toISOString().split('T')[0],
            hora: new Date().toLocaleTimeString('en-US', { hour12: false })
        };

        try {
            StorageService.addItem(STORAGE_KEYS.WITHDRAWALS, retiro);
            alert('Retiro registrado exitosamente');
            setSelectedStudent(null);
            setPreceptorAsignado(null);
            setMotivo('Enfermedad');
            setAdultoId('');
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto w-full animate-in fade-in duration-500 pb-20">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Registro de Retiro</h1>
                <p className="text-slate-500 mt-2">Busque al alumno y seleccione el familiar autorizado.</p>
            </header>

            {/* Buscador Inteligente */}
            {!selectedStudent && (
                <div className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-6 w-6 text-blue-500" />
                        </div>
                        <input
                            type="text"
                            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-transparent bg-slate-50 focus:bg-white rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                            placeholder="Buscar por nombre, apellido, DNI o curso..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Resultados */}
                    {searchTerm && (
                        <div className="mt-4 bg-white rounded-xl border border-slate-100 max-h-96 overflow-y-auto divide-y divide-slate-100 shadow-inner">
                            {isSearching ? (
                                <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                                    Buscando...
                                </div>
                            ) : results.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">No se encontraron alumnos coincidentes.</div>
                            ) : (
                                results.map(student => (
                                    <button
                                        key={student.id}
                                        className="w-full flex items-center justify-between p-4 hover:bg-indigo-50/50 focus:bg-indigo-50 focus:ring-2 focus:ring-inset focus:ring-indigo-500 outline-none transition-all text-left group"
                                        onClick={() => handleSelectStudent(student)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-indigo-100 text-indigo-600 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                                                <GraduationCap size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-lg group-hover:text-indigo-900 transition-colors">{student.apellido}, {student.nombre}</p>
                                                <p className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                                                    DNI: {student.dni} <span className="text-slate-300">|</span>
                                                    Curso: {student.curso} "{student.division}"
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-amber-50 px-3 py-1.5 rounded-full shadow-sm border border-amber-100 text-xs font-bold text-amber-700 flex items-center gap-1.5 shrink-0 group-hover:bg-amber-100 transition-colors">
                                            <ShieldCheck size={14} className="text-amber-600" />
                                            {student.familiares?.length || 0} fam.
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Formulario de Retiro (Al seleccionar alumno) */}
            {selectedStudent && (
                <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-900/10 border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95 duration-400">
                    <div className="bg-gradient-to-r from-indigo-700 to-blue-600 p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
                        <div className="flex items-start gap-4">
                            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm hidden sm:block shadow-inner">
                                <GraduationCap size={32} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{selectedStudent.apellido}, {selectedStudent.nombre}</h2>
                                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-indigo-100 text-sm font-medium">
                                    <span className="bg-indigo-800/50 px-2.5 py-1 rounded-lg border border-indigo-500/30">DNI: {selectedStudent.dni}</span>
                                    <span className="bg-indigo-800/50 px-2.5 py-1 rounded-lg border border-indigo-500/30">Curso: {selectedStudent.curso} "{selectedStudent.division}"</span>
                                    <span className="bg-indigo-800/50 px-2.5 py-1 rounded-lg border border-indigo-500/30">Turno: {selectedStudent.turno}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedStudent(null)}
                            className="text-indigo-200 hover:text-white bg-indigo-900/40 hover:bg-indigo-900/80 px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 text-sm font-bold flex items-center gap-2 border border-indigo-400/20 w-full sm:w-auto justify-center"
                        >
                            Cambiar Estudiante
                        </button>
                    </div>

                    <form onSubmit={handleRegistrar} className="p-6 sm:p-8 space-y-8">
                        {preceptorAsignado ? (
                            <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-xl text-sm border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                                <span className="flex items-center gap-2 font-medium">
                                    <UserCheck size={18} className="text-blue-600" /> 
                                    Preceptor Asignado
                                </span>
                                <span className="font-bold text-base bg-white px-3 py-1 rounded-lg shadow-sm">{preceptorAsignado.nombre} {preceptorAsignado.apellido}</span>
                            </div>
                        ) : (
                            <div className="bg-slate-50 text-slate-500 px-4 py-3 rounded-xl text-sm border border-slate-200 flex items-center gap-2">
                                <UserCheck size={18} /> Sin preceptor asociado para el curso actual.
                            </div>
                        )}
                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3 items-start">
                            <Clock className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-orange-900">Hora de Registro</p>
                                <p className="text-orange-700 text-sm">
                                    {new Date().toLocaleDateString('es-AR')} - {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                    <br /><span className="text-xs opacity-75">(Se guardará la hora exacta al confirmar)</span>
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                                    <ShieldCheck className="text-amber-500" size={18} />
                                    Seleccionar Adulto que Retira
                                </label>
                                {(!selectedStudent.familiares || selectedStudent.familiares.length === 0) ? (
                                    <div className="bg-red-50 text-red-600 p-5 rounded-2xl border border-red-200 flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left shadow-sm">
                                        <div className="bg-red-100 p-3 rounded-full shrink-0">
                                            <UserMinus size={24} />
                                        </div>
                                        <div>
                                            <span className="font-bold block text-lg">Sin Familiares Autorizados</span>
                                            <span className="text-sm opacity-90 block mt-1">Este estudiante no tiene personas autorizadas cargadas en el sistema. El retiro requiere autorización superior.</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {selectedStudent.familiares.map((fam, idx) => (
                                            <label 
                                                key={idx} 
                                                className={`flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 shadow-sm relative overflow-hidden group hover:shadow-md ${adultoId === fam.dni ? 'border-amber-500 bg-amber-50/50 ring-4 ring-amber-500/10' : 'border-slate-200 hover:border-amber-300 bg-white'}`}
                                            >
                                                {/* Indicador visual activo (el check azul) lo ocultamos por css, usamos el border */}
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className={`p-2 rounded-xl transition-colors ${adultoId === fam.dni ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400 group-hover:text-amber-500 group-hover:bg-amber-50'}`}>
                                                        <ShieldCheck size={20} />
                                                    </div>
                                                    <input
                                                        type="radio"
                                                        name="adulto"
                                                        value={fam.dni}
                                                        checked={adultoId === fam.dni}
                                                        onChange={(e) => setAdultoId(e.target.value)}
                                                        className="w-5 h-5 text-amber-600 border-gray-300 focus:ring-amber-500 mt-1 cursor-pointer"
                                                    />
                                                </div>
                                                <div className="mt-auto pt-2">
                                                    <p className="font-bold text-slate-800 leading-tight">{fam.nombre} {fam.apellido}</p>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <span className="text-xs font-medium text-slate-500">DNI {fam.dni}</span>
                                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${adultoId === fam.dni ? 'bg-amber-200 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>
                                                            {fam.relacion}
                                                        </span>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pt-4">
                                <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">Motivo del Retiro</label>
                                <select
                                    value={motivo}
                                    onChange={(e) => setMotivo(e.target.value)}
                                    className="w-full sm:w-1/2 border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-700 bg-white shadow-sm"
                                >
                                    <option value="Enfermedad">Enfermedad</option>
                                    <option value="Cita Médica">Cita Médica</option>
                                    <option value="Problemas Familiares">Problemas Familiares</option>
                                    <option value="Trámite Personal">Trámite Personal</option>
                                    <option value="Actividad Extracurricular">Actividad Extracurricular</option>
                                    <option value="Otro">Otro Motivo</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-6 mt-8 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={!adultoId}
                                className={`flex items-center justify-center w-full sm:w-auto gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${adultoId ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/30 hover:-translate-y-1 active:translate-y-0 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200'}`}
                            >
                                <UserCheck size={24} /> {adultoId ? "Confirmar Retiro" : "Seleccione Adulto Primero"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default RegistroRetiroPage;
