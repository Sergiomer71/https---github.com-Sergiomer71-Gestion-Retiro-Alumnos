import React, { useState, useEffect } from 'react';
import StorageService from '../storage/localStorage';
import { STORAGE_KEYS } from '../config/constants';
import { Plus, Edit, Trash2, Users, UserPlus, X } from 'lucide-react';

const AlumnosPage = () => {
    const [students, setStudents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [familiares, setFamiliares] = useState([]);
    const [newFamiliar, setNewFamiliar] = useState({ nombre: '', apellido: '', dni: '', relacion: 'Madre' });

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = () => {
        const data = StorageService.get(STORAGE_KEYS.STUDENTS, []);
        setStudents(data);
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
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Plus size={18} /> Nuevo Alumno
                </button>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
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
                                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800">
                                            {student.apellido}, {student.nombre}
                                        </td>
                                        <td className="px-6 py-4">{student.dni}</td>
                                        <td className="px-6 py-4">{student.curso} "{student.division}"</td>
                                        <td className="px-6 py-4">{student.turno}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                                                {student.familiares?.length || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            {/* Nota: En una app real tendríamos una página separada o un modal anidado para familiares */}
                                            <button onClick={() => openEdit(student)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Editar / Familiares">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(student.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Eliminar">
                                                <Trash2 size={18} />
                                            </button>
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
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                                    <input name="nombre" defaultValue={currentStudent?.nombre} required className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
                                    <input name="apellido" defaultValue={currentStudent?.apellido} required className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">DNI</label>
                                    <input type="number" name="dni" defaultValue={currentStudent?.dni} required className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Curso</label>
                                    <input name="curso" defaultValue={currentStudent?.curso} required placeholder="Ej: 1ro, 2do" className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">División</label>
                                    <input name="division" defaultValue={currentStudent?.division} required placeholder="Ej: A, B" className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Turno</label>
                                    <select name="turno" defaultValue={currentStudent?.turno || 'Mañana'} className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="Mañana">Mañana</option>
                                        <option value="Tarde">Tarde</option>
                                        <option value="Vespertino">Vespertino</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Hora Salida Habitual</label>
                                    <input type="time" name="horaSalida" defaultValue={currentStudent?.horaSalida} required className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Preceptor Asignado</label>
                                    <input name="preceptor" defaultValue={currentStudent?.preceptor} className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>

                            {/* Seccion de Familiares */}
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <h4 className="font-semibold text-slate-800 mb-4">Familiares Autorizados</h4>

                                {/* Formulario para agregar familiar */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <input
                                            placeholder="Nombre"
                                            value={newFamiliar.nombre}
                                            onChange={(e) => setNewFamiliar({ ...newFamiliar, nombre: e.target.value })}
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                        <input
                                            placeholder="Apellido"
                                            value={newFamiliar.apellido}
                                            onChange={(e) => setNewFamiliar({ ...newFamiliar, apellido: e.target.value })}
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                        <input
                                            placeholder="DNI"
                                            type="number"
                                            value={newFamiliar.dni}
                                            onChange={(e) => setNewFamiliar({ ...newFamiliar, dni: e.target.value })}
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                        <div className="flex gap-2">
                                            <select
                                                value={newFamiliar.relacion}
                                                onChange={(e) => setNewFamiliar({ ...newFamiliar, relacion: e.target.value })}
                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                                                className="bg-slate-800 text-white p-2 rounded-lg hover:bg-slate-900 disabled:opacity-50 transition-colors"
                                                title="Agregar Familiar"
                                            >
                                                <UserPlus size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Lista de familiares agregados */}
                                {familiares.length === 0 ? (
                                    <p className="text-sm text-slate-500 text-center py-2">No hay familiares autorizados agregados.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {familiares.map((fam, i) => (
                                            <li key={i} className="flex justify-between items-center bg-white border border-slate-200 p-3 rounded-lg text-sm">
                                                <div>
                                                    <span className="font-semibold text-slate-800">{fam.nombre} {fam.apellido}</span>
                                                    <span className="text-slate-500 ml-2">DNI: {fam.dni}</span>
                                                    <span className="ml-3 bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-medium">{fam.relacion}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveFamiliar(i)}
                                                    className="text-red-400 hover:text-red-600 p-1"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    Guardar
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
