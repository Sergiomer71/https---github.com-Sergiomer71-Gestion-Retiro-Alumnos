import React, { useState, useEffect } from 'react';
import StorageService from '../storage/localStorage';
import { STORAGE_KEYS } from '../config/constants';
import { Plus, Edit, Trash2, Users, UserPlus, X, GraduationCap, ShieldCheck, User } from 'lucide-react';

const AlumnosPage = () => {
    const [students, setStudents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [familiares, setFamiliares] = useState([]);
    const [preceptoresDisponibles, setPreceptoresDisponibles] = useState([]);
    const [newFamiliar, setNewFamiliar] = useState({ nombre: '', apellido: '', dni: '', relacion: 'Madre' });

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = () => {
        const data = StorageService.get(STORAGE_KEYS.STUDENTS, []);
        const preceptores = StorageService.get(STORAGE_KEYS.PRECEPTORS, []);
        setStudents(data);
        setPreceptoresDisponibles(preceptores);
    };

    const handleSave = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newStudent = {
            nombre: formData.get('nombre'),
            apellido: formData.get('apellido'),
            dni: formData.get('dni'),
            curso: formData.get('curso'),
            division: formData.get('division'),
            turno: formData.get('turno'),
            horaSalida: formData.get('horaSalida'),
            preceptor: formData.get('preceptor'),
            familiares: familiares
        };

        if (currentStudent && currentStudent.id) {
            StorageService.updateItem(STORAGE_KEYS.STUDENTS, currentStudent.id, newStudent);
        } else {
            StorageService.addItem(STORAGE_KEYS.STUDENTS, newStudent);
        }

        setIsModalOpen(false);
        setCurrentStudent(null);
        setFamiliares([]);
        loadStudents();
    };

    const handleDelete = (id) => {
        if (confirm('¿Está seguro de eliminar este alumno?')) {
            StorageService.removeItem(STORAGE_KEYS.STUDENTS, id);
            loadStudents();
        }
    };

    const openEdit = (student) => {
        setCurrentStudent(student);
        setFamiliares(student.familiares || []);
        setIsModalOpen(true);
    };

    const openNew = () => {
        setCurrentStudent(null);
        setFamiliares([]);
        setIsModalOpen(true);
    };

    const handleAddFamiliar = () => {
        if (!newFamiliar.nombre || !newFamiliar.dni) return;
        setFamiliares([...familiares, newFamiliar]);
        setNewFamiliar({ nombre: '', apellido: '', dni: '', relacion: 'Madre' });
    };

    const handleRemoveFamiliar = (index) => {
        const updated = [...familiares];
        updated.splice(index, 1);
        setFamiliares(updated);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="text-blue-500" /> Gestión de Alumnos
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Administrar alumnos y sus familiares autorizados.</p>
                </div>
                <button
                    onClick={openNew}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                    <Plus size={18} /> Nuevo Alumno
                </button>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 min-w-[700px]">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-medium border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Estudiante</th>
                                <th className="px-6 py-4">DNI</th>
                                <th className="px-6 py-4">Curso / Div</th>
                                <th className="px-6 py-4">Turno</th>
                                <th className="px-6 py-4">Familiares</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                                        No hay alumnos registrados.
                                    </td>
                                </tr>
                            ) : (
                                students.map(student => (
                                    <tr key={student.id} className="hover:bg-indigo-50/30 transition-all duration-200 border-l-4 border-transparent hover:border-indigo-500 group">
                                        <td className="px-6 py-5 font-medium text-slate-800">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                                                    <GraduationCap size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 leading-none">{student.apellido}, {student.nombre}</p>
                                                    <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1">Estudiante</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-slate-500 font-medium">{student.dni}</td>
                                        <td className="px-6 py-5">
                                            <div className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded-lg text-xs font-bold border border-slate-200">
                                                {student.curso} "{student.division}"
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">{student.turno}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl text-xs font-black w-max border-2 border-amber-100/50 shadow-sm animate-pulse-subtle">
                                                <ShieldCheck size={16} className="text-amber-600" />
                                                {student.familiares?.length || 0} AUTORIZADOS
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEdit(student)} className="p-2 text-indigo-600 hover:bg-indigo-100 bg-indigo-50 rounded-xl transition-all active:scale-95 shadow-sm" title="Editar / Familiares">
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(student.id)} className="p-2 text-red-600 hover:bg-red-100 bg-red-50 rounded-xl transition-all active:scale-95 shadow-sm" title="Eliminar">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-10">
                            <h3 className="text-lg font-bold text-slate-800">
                                {currentStudent ? 'Editar Alumno' : 'Nuevo Alumno'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-6">
                            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                                <div className="flex items-center gap-2 mb-4 text-indigo-800">
                                    <GraduationCap size={20} className="text-indigo-600" />
                                    <h4 className="font-bold">Datos del Estudiante</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                                        <input name="nombre" defaultValue={currentStudent?.nombre} required className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
                                        <input name="apellido" defaultValue={currentStudent?.apellido} required className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">DNI</label>
                                        <input type="number" name="dni" defaultValue={currentStudent?.dni} required className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Curso</label>
                                        <input name="curso" defaultValue={currentStudent?.curso} required placeholder="Ej: 1ro, 2do" className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">División</label>
                                        <input name="division" defaultValue={currentStudent?.division} required placeholder="Ej: A, B" className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Turno</label>
                                        <select name="turno" defaultValue={currentStudent?.turno || 'Mañana'} className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white">
                                            <option value="Mañana">Mañana</option>
                                            <option value="Tarde">Tarde</option>
                                            <option value="Vespertino">Vespertino</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Hora Salida Habitual</label>
                                        <input type="time" name="horaSalida" defaultValue={currentStudent?.horaSalida} required className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Preceptor Asignado (Opcional)</label>
                                        <select name="preceptor" defaultValue={currentStudent?.preceptor || ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white">
                                            <option value="">Seleccione o autodetectar (Por Curso)</option>
                                            {preceptoresDisponibles.map(p => (
                                                <option key={p.id} value={p.id}>{p.apellido}, {p.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Seccion de Familiares */}
                            <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/50">
                                <div className="flex items-center gap-2 mb-4 text-amber-900 border-b border-amber-200/50 pb-2">
                                    <ShieldCheck size={20} className="text-amber-600" />
                                    <h4 className="font-bold">Familiares Autorizados / Retiro</h4>
                                </div>

                                {/* Formulario para agregar familiar */}
                                <div className="bg-white p-4 rounded-xl border border-amber-200 mb-4 shadow-sm">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                        <input
                                            placeholder="Nombre"
                                            value={newFamiliar.nombre}
                                            onChange={(e) => setNewFamiliar({ ...newFamiliar, nombre: e.target.value })}
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm transition-colors"
                                        />
                                        <input
                                            placeholder="Apellido"
                                            value={newFamiliar.apellido}
                                            onChange={(e) => setNewFamiliar({ ...newFamiliar, apellido: e.target.value })}
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm transition-colors"
                                        />
                                        <input
                                            placeholder="DNI"
                                            type="number"
                                            value={newFamiliar.dni}
                                            onChange={(e) => setNewFamiliar({ ...newFamiliar, dni: e.target.value })}
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm transition-colors"
                                        />
                                        <div className="flex gap-2 sm:col-span-2 lg:col-span-2">
                                            <select
                                                value={newFamiliar.relacion}
                                                onChange={(e) => setNewFamiliar({ ...newFamiliar, relacion: e.target.value })}
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm bg-white transition-colors"
                                            >
                                                <option value="Madre">Madre</option>
                                                <option value="Padre">Padre</option>
                                                <option value="Tutor">Tutor/a</option>
                                                <option value="Hermano/a">Hermano/a</option>
                                                <option value="Abuelo/a">Abuelo/a</option>
                                                <option value="Tío/a">Tío/a</option>
                                                <option value="Otro">Otro</option>
                                            </select>
                                            <button
                                                type="button"
                                                onClick={handleAddFamiliar}
                                                disabled={!newFamiliar.nombre || !newFamiliar.dni}
                                                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 active:scale-95 disabled:opacity-50 transition-all shadow-sm font-medium flex items-center justify-center shrink-0"
                                                title="Agregar Familiar"
                                            >
                                                <UserPlus size={18} /> <span className="ml-1 hidden sm:inline lg:hidden xl:inline">Agregar</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Lista de familiares agregados */}
                                {familiares.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-6 text-amber-700/60 bg-white/50 rounded-xl border border-dashed border-amber-200">
                                        <User size={32} className="mb-2 opacity-50" />
                                        <p className="text-sm">Agregue familiares autorizados arriba.</p>
                                    </div>
                                ) : (
                                    <ul className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                                        {familiares.map((fam, i) => (
                                            <li key={i} className="flex justify-between items-center bg-white border border-amber-200 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="bg-amber-100 text-amber-700 p-2 rounded-full shrink-0">
                                                        <User size={16} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-800 text-sm truncate">{fam.nombre} {fam.apellido}</p>
                                                        <p className="text-slate-500 text-xs flex gap-2 items-center">
                                                            <span className="truncate">DNI: {fam.dni}</span>
                                                            <span className="bg-amber-50 border border-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide shrink-0">{fam.relacion}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveFamiliar(i)}
                                                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors shrink-0"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 w-full">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 active:scale-95 hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md">
                                    Guardar Alumno y Familiares
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlumnosPage;
