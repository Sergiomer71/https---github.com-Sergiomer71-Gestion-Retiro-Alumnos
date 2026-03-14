import React, { useState, useEffect, useRef } from 'react';
import StorageService from '../storage/localStorage';
import { STORAGE_KEYS } from '../config/constants';
import { Search, UserCheck, Clock, UserMinus, Users } from 'lucide-react';

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
                        <div className="mt-4 bg-slate-50 rounded-xl border border-slate-100 max-h-96 overflow-y-auto divide-y divide-slate-100">
                            {isSearching ? (
                                <div className="p-4 text-center text-slate-500">Buscando...</div>
                            ) : results.length === 0 ? (
                                <div className="p-4 text-center text-slate-500">No se encontraron alumnos coincidentes.</div>
                            ) : (
                                results.map(student => (
                                    <button
                                        key={student.id}
                                        className="w-full flex items-center justify-between p-4 hover:bg-blue-50 focus:bg-blue-50 outline-none transition-colors text-left"
                                        onClick={() => handleSelectStudent(student)}
                                    >
                                        <div>
                                            <p className="font-bold text-slate-800 text-lg">{student.apellido}, {student.nombre}</p>
                                            <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                                DNI: {student.dni} <span className="text-slate-300">|</span>
                                                Curso: {student.curso} "{student.division}"
                                            </p>
                                        </div>
                                        <div className="bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200 text-xs font-semibold text-slate-600 flex items-center gap-1">
                                            <Users size={12} className="text-blue-500" />
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
                <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-blue-600 p-6 text-white flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">{selectedStudent.apellido}, {selectedStudent.nombre}</h2>
                            <div className="flex gap-4 mt-2 text-blue-100 text-sm">
                                <span>DNI: {selectedStudent.dni}</span>
                                <span>Curso: {selectedStudent.curso} "{selectedStudent.division}"</span>
                                <span>Turno: {selectedStudent.turno}</span>
                            </div>
                            {preceptorAsignado ? (
                                <div className="mt-4 bg-blue-800/50 text-blue-50 px-3 py-2.5 rounded-lg text-sm border border-blue-400/30 flex items-center gap-2 w-max">
                                    <UserCheck size={16} /> Preceptor Asignado: <span className="font-bold">{preceptorAsignado.nombre} {preceptorAsignado.apellido}</span>
                                </div>
                            ) : (
                                <div className="mt-4 bg-blue-800/50 text-blue-200 px-3 py-2.5 rounded-lg text-sm border border-blue-400/30 flex items-center gap-2 w-max opacity-80">
                                    <UserCheck size={16} /> Sin preceptor asignado
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setSelectedStudent(null)}
                            className="text-blue-200 hover:text-white bg-blue-700/50 hover:bg-blue-700 px-3 py-1 rounded-lg transition-colors text-sm font-medium"
                        >
                            Cambiar Alumno
                        </button>
                    </div>

                    <form onSubmit={handleRegistrar} className="p-6 space-y-6">
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
                                <label className="block text-sm font-bold text-slate-700 mb-2">Persona Autorizada que Retira</label>
                                {(!selectedStudent.familiares || selectedStudent.familiares.length === 0) ? (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-2">
                                        <UserMinus size={20} />
                                        <span className="font-medium">Este alumno no tiene familiares autorizados cargados.</span>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {selectedStudent.familiares.map((fam, idx) => (
                                            <label key={idx} className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${adultoId === fam.dni ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                                                <input
                                                    type="radio"
                                                    name="adulto"
                                                    value={fam.dni}
                                                    checked={adultoId === fam.dni}
                                                    onChange={(e) => setAdultoId(e.target.value)}
                                                    className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 shrink-0"
                                                />
                                                <div className="ml-3">
                                                    <p className="font-bold text-slate-800">{fam.nombre} {fam.apellido} <span className="text-slate-400 font-normal text-sm ml-2">({fam.relacion})</span></p>
                                                    <p className="text-sm text-slate-500">DNI: {fam.dni}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Motivo del Retiro</label>
                                <select
                                    value={motivo}
                                    onChange={(e) => setMotivo(e.target.value)}
                                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 bg-white"
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

                        <div className="pt-4 mt-6 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={!adultoId}
                                className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all ${adultoId ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                            >
                                <UserCheck size={24} /> Registrar Retiro
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default RegistroRetiroPage;
