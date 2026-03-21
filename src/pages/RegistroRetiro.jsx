// ─────────────────────────────────────────
// ARCHIVO: RegistroRetiro.jsx
// DESCRIPCIÓN: Pantalla principal para registrar la salida (retiro) de alumnos.
// MÓDULO: Operaciones Diarias
// DEPENDENCIAS: React, StorageService, Lucide Icons, Constants
// ─────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import StorageService from '../storage/localStorage';
import { STORAGE_KEYS, ROLES } from '../config/constants';
import { useAuth } from '../core/AuthContext';
import { Search, UserCheck, Clock, UserMinus, Users, GraduationCap, ShieldCheck } from 'lucide-react';

/**
 * Componente para registrar el retiro de un alumno por parte de un adulto autorizado.
 * Incluye búsqueda en tiempo real, validación de familiares y registro histórico.
 */
const RegistroRetiroPage = () => {
    // --- ESTADOS DE BÚSQUEDA ---
    const [searchTerm, setSearchTerm] = useState(''); // Texto ingresado en el buscador
    const [results, setResults] = useState([]); // Alumnos que coinciden con la búsqueda
    const [selectedStudent, setSelectedStudent] = useState(null); // Alumno elegido para el retiro
    const [preceptorAsignado, setPreceptorAsignado] = useState(null); // Preceptor del alumno seleccionado
    const [isSearching, setIsSearching] = useState(false); // Estado visual de carga durante la búsqueda

    // --- ESTADOS DEL FORMULARIO DE RETIRO ---
    const [motivo, setMotivo] = useState('Enfermedad'); // Razón de la salida
    const [adultoId, setAdultoId] = useState(''); // DNI del familiar que retira
    const [celador, setCelador] = useState(sessionStorage.getItem('activeUserId')); // Usuario que registra (sereno/celador)
    
    // --- ESTADOS PARA SELECCIÓN DE CELADOR ---
    const [celadoresDisponibles, setCeladoresDisponibles] = useState([]);
    const [celadorSeleccionado, setCeladorSeleccionado] = useState(''); // Requerido para Celadores

    const { user } = useAuth(); // Obtener información del usuario logueado
    const searchDebounceRef = useRef(null); // Referencia para el temporizador de búsqueda (debounce)

    // Cargar la lista de celadores al iniciar
    useEffect(() => {
        const celadores = StorageService.get(STORAGE_KEYS.CELADORES, []);
        setCeladoresDisponibles(celadores);
    }, []);

    // Efecto que reacciona a los cambios en el término de búsqueda
    useEffect(() => {
        // Limpiamos el temporizador anterior si el usuario sigue escribiendo
        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }

        // Si el buscador está vacío, limpiamos resultados
        if (searchTerm.trim().length === 0) {
            setResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        // Iniciamos un retraso de 300ms antes de realizar la búsqueda (mejor rendimiento)
        searchDebounceRef.current = setTimeout(() => {
            const allStudents = StorageService.get(STORAGE_KEYS.STUDENTS, []);
            const term = searchTerm.toLowerCase();

            // Filtramos por nombre, apellido, DNI o curso
            const filtered = allStudents.filter(s => {
                const nombre = (s.nombre || '').toLowerCase();
                const apellido = (s.apellido || '').toLowerCase();
                const dni = String(s.dni || '');
                const curso = (s.curso || '').toLowerCase();

                return nombre.includes(term) ||
                    apellido.includes(term) ||
                    dni.includes(term) ||
                    curso.includes(term);
            }).slice(0, 10); // Mostramos máximo 10 resultados

            setResults(filtered);
            setIsSearching(false);
        }, 300);

    }, [searchTerm]);

    /**
     * Configura el alumno seleccionado y busca automáticamente su preceptor.
     * @param {object} student - Datos del estudiante seleccionado.
     */
    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        setSearchTerm(''); // Limpiamos el buscador
        setResults([]);

        // Buscar el preceptor que corresponde a este alumno
        const preceptores = StorageService.get(STORAGE_KEYS.PRECEPTORS, []);
        let preceptorMatch = null;
        
        // 1. Prioridad: Si el alumno ya tiene un ID de preceptor grabado
        if (student.preceptor) {
            preceptorMatch = preceptores.find(p => p.id === student.preceptor);
        }

        // 2. Prioridad: Buscar por curso y división si no hay ID directo
        if (!preceptorMatch) {
             preceptorMatch = preceptores.find(p => {
                 if (p.cursos && p.cursos.length > 0) {
                     return p.cursos.some(c => c.curso === student.curso && c.division === student.division);
                 } else { 
                     // Compatibilidad con registros antiguos
                     return p.curso === student.curso && p.division === student.division;
                 }
             });
        }
        
        setPreceptorAsignado(preceptorMatch || null);
    };

    /**
     * Guarda el registro del retiro en la base de datos local.
     */
    const handleRegistrar = (e) => {
        e.preventDefault();
        // Validación: Necesitamos alumno y el DNI del adulto responsable
        if (!selectedStudent || !adultoId) return;

        let finalCeladorId = celador;
        let finalCeladorNombre = user?.username || 'Administrador'; // Fallback genérico

        if (user?.role === ROLES.CELADOR) {
            if (!celadorSeleccionado) {
                alert("Debe seleccionar un celador responsable.");
                return;
            }
            const celData = celadoresDisponibles.find(c => c.id === celadorSeleccionado);
            if (celData) {
                finalCeladorId = celData.id;
                finalCeladorNombre = `${celData.nombre} ${celData.apellido}`;
            }
        }

        // Buscamos los detalles del familiar seleccionado dentro de la ficha del alumno
        const adulto = selectedStudent.familiares?.find(f => f.dni === adultoId) || { nombre: 'Desconocido' };

        // Creamos el objeto del retiro con la fecha y hora actual
        const retiro = {
            alumnoId: selectedStudent.id,
            alumnoNombre: `${selectedStudent.apellido}, ${selectedStudent.nombre}`,
            curso: selectedStudent.curso,
            division: selectedStudent.division,
            adultoNombre: `${adulto.nombre} ${adulto.apellido || ''}`,
            adultoDni: adulto.dni,
            motivo,
            celadorId: finalCeladorId,
            celadorNombre: finalCeladorNombre,
            fecha: new Date().toISOString().split('T')[0], // Formato AAAA-MM-DD
            hora: new Date().toLocaleTimeString('en-US', { hour12: false }) // Formato HH:MM:SS
        };

        try {
            StorageService.addItem(STORAGE_KEYS.WITHDRAWALS, retiro);
            alert('Retiro registrado exitosamente');
            // Reiniciamos todo para el siguiente registro
            setSelectedStudent(null);
            setPreceptorAsignado(null);
            setMotivo('Enfermedad');
            setAdultoId('');
            setCeladorSeleccionado('');
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto w-full animate-in fade-in duration-500 pb-20">
            {/* Cabecera Informativa */}
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Registro de Retiro</h1>
                <p className="text-slate-500 mt-2">Busque al alumno y seleccione el familiar autorizado.</p>
            </header>

            {/* BUSCADOR: Se muestra solo si no hay un alumno ya seleccionado */}
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

                    {/* Lista desplegable de resultados de la búsqueda */}
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
                                            {student.familiares?.length || 0} autorizados
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* FORMULARIO DE DETALLES: Se activa tras elegir un alumno */}
            {selectedStudent && (
                <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-900/10 border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95 duration-400">
                    {/* Encabezado con datos del alumno seleccionado */}
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
                        {/* Bloque de Información del Preceptor */}
                        {preceptorAsignado ? (
                            <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-xl text-sm border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                                <span className="flex items-center gap-2 font-medium">
                                    <UserCheck size={18} className="text-blue-600" /> 
                                    Preceptor Responsable del Curso
                                </span>
                                <span className="font-bold text-base bg-white px-3 py-1 rounded-lg shadow-sm">{preceptorAsignado.nombre} {preceptorAsignado.apellido}</span>
                            </div>
                        ) : (
                            <div className="bg-slate-50 text-slate-500 px-4 py-3 rounded-xl text-sm border border-slate-200 flex items-center gap-2">
                                <UserCheck size={18} /> Sin preceptor asociado para este curso.
                            </div>
                        )}

                        {/* Fecha y Hora actuales (informativo) */}
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

                        {/* SELECCIÓN DE ADULTO: Tarjetas interactivas de familiares */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                                <ShieldCheck className="text-amber-500" size={18} />
                                Seleccionar Familiar / Adulto Responsable
                            </label>
                            
                            {/* Alerta si no tiene familiares autorizados cargados */}
                            {(!selectedStudent.familiares || selectedStudent.familiares.length === 0) ? (
                                <div className="bg-red-50 text-red-600 p-5 rounded-2xl border border-red-200 flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left shadow-sm">
                                    <div className="bg-red-100 p-3 rounded-full shrink-0">
                                        <UserMinus size={24} />
                                    </div>
                                    <div>
                                        <span className="font-bold block text-lg">Sin Autorizaciones Registradas</span>
                                        <span className="text-sm opacity-90 block mt-1">Este alumno no tiene personas autorizadas. El retiro debe ser autorizado por dirección.</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {selectedStudent.familiares.map((fam, idx) => (
                                        <label 
                                            key={idx} 
                                            className={`flex flex-col p-5 border-2 rounded-3xl cursor-pointer transition-all duration-300 shadow-sm relative overflow-hidden group hover:shadow-xl ${adultoId === fam.dni ? 'border-amber-500 bg-amber-50 ring-4 ring-amber-500/10 -translate-y-1' : 'border-slate-100 hover:border-amber-300 bg-white hover:-translate-y-0.5'}`}
                                        >
                                            {/* Marca de verificación si está seleccionado */}
                                            {adultoId === fam.dni && (
                                                <div className="absolute top-0 right-0 p-2 bg-amber-500 text-white rounded-bl-xl shadow-md animate-in zoom-in duration-300">
                                                    <UserCheck size={14} />
                                                </div>
                                            )}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={`p-3 rounded-2xl transition-all duration-300 ${adultoId === fam.dni ? 'bg-amber-100 text-amber-600 scale-110 shadow-inner' : 'bg-slate-50 text-slate-400 group-hover:text-amber-500 group-hover:bg-amber-50'}`}>
                                                    <ShieldCheck size={24} />
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="adulto"
                                                    value={fam.dni}
                                                    checked={adultoId === fam.dni}
                                                    onChange={(e) => setAdultoId(e.target.value)}
                                                    className="sr-only"
                                                />
                                            </div>
                                            <div className="mt-auto">
                                                <p className={`font-black text-lg leading-tight transition-colors ${adultoId === fam.dni ? 'text-amber-900' : 'text-slate-800'}`}>{fam.nombre} {fam.apellido}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border tracking-wider transition-colors uppercase ${adultoId === fam.dni ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                        {fam.relacion}
                                                    </span>
                                                    <span className="text-xs font-black text-slate-400 tracking-tighter">DNI {fam.dni}</span>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Motivo de la salida y Selector de Celador */}
                        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">Motivo del Retiro</label>
                                <select
                                    value={motivo}
                                    onChange={(e) => setMotivo(e.target.value)}
                                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-700 bg-white shadow-sm"
                                >
                                    <option value="Enfermedad">Enfermedad</option>
                                    <option value="Cita Médica">Cita Médica</option>
                                    <option value="Problemas Familiares">Problemas Familiares</option>
                                    <option value="Trámite Personal">Trámite Personal</option>
                                    <option value="Actividad Extracurricular">Actividad Extracurricular</option>
                                    <option value="Otro">Otro Motivo</option>
                                </select>
                            </div>

                            {/* Selector de Celador (SOLO para rol CELADOR) */}
                            {user?.role === ROLES.CELADOR && (
                                <div className="animate-in fade-in zoom-in-95 duration-300">
                                    <label className="flex items-center justify-between text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                                        <span>Celador a Cargo</span>
                                        {celadoresDisponibles.length === 0 && <span className="text-[10px] text-red-500 font-bold ml-2">* Solicite alta al Administrador</span>}
                                    </label>
                                    <select
                                        value={celadorSeleccionado}
                                        onChange={(e) => setCeladorSeleccionado(e.target.value)}
                                        required
                                        disabled={celadoresDisponibles.length === 0}
                                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-700 bg-white shadow-sm disabled:bg-slate-100 disabled:cursor-not-allowed text-ellipsis"
                                    >
                                        <option value="">Seleccione su identidad...</option>
                                        {celadoresDisponibles.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.nombre} {c.apellido} — Turno {c.turno}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Botón de Confirmación Final */}
                        <div className="pt-6 mt-8 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={!adultoId}
                                className={`group flex items-center justify-center w-full sm:w-auto gap-3 px-10 py-5 rounded-3xl font-black text-xl transition-all duration-500 ${adultoId ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-2xl shadow-amber-500/40 hover:-translate-y-1.5 hover:brightness-110 active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed border-2 border-slate-200 uppercase tracking-widest text-sm'}`}
                            >
                                <UserCheck size={28} className={adultoId ? "group-hover:scale-125 transition-transform" : ""} /> 
                                {adultoId ? "CONFIRMAR RETIRO" : "Seleccione Adulto para Confirmar"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default RegistroRetiroPage;
