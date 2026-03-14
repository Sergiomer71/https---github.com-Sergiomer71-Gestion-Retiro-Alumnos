import React, { useState, useEffect } from 'react';
import StorageService from '../storage/localStorage';
import { STORAGE_KEYS } from '../config/constants';
import { Users, Plus, Trash2, Edit, Search } from 'lucide-react';

const PreceptoresPage = () => {
    const [preceptores, setPreceptores] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    // Form state
    const [editingId, setEditingId] = useState(null);
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [dni, setDni] = useState('');
    
    // Multi-course assignment state
    const [cursosAsignados, setCursosAsignados] = useState([]);
    const [tempCurso, setTempCurso] = useState('1ro');
    const [tempDivision, setTempDivision] = useState('');

    useEffect(() => {
        cargarPreceptores();
    }, []);

    const cargarPreceptores = () => {
        const data = StorageService.get(STORAGE_KEYS.PRECEPTORS, []);
        setPreceptores(data);
    };

    const handleOpenForm = (preceptor = null) => {
        if (preceptor) {
            setEditingId(preceptor.id);
            setNombre(preceptor.nombre);
            setApellido(preceptor.apellido);
            setDni(preceptor.dni);
            // Si el preceptor es anterior (formato viejo), lo convertimos
            if (preceptor.curso && preceptor.division && (!preceptor.cursos || preceptor.cursos.length === 0)) {
                setCursosAsignados([{ curso: preceptor.curso, division: preceptor.division }]);
            } else {
                setCursosAsignados(preceptor.cursos || []);
            }
        } else {
            setEditingId(null);
            setNombre('');
            setApellido('');
            setDni('');
            setCursosAsignados([]);
        }
        setTempCurso('1ro');
        setTempDivision('');
        setIsFormOpen(true);
    };

    const handleAddCurso = () => {
        if (!tempDivision) return;
        setCursosAsignados([...cursosAsignados, { curso: tempCurso, division: tempDivision }]);
        setTempDivision(''); // Reseteamos division
    };

    const handleRemoveCurso = (index) => {
        const nuevos = [...cursosAsignados];
        nuevos.splice(index, 1);
        setCursosAsignados(nuevos);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (cursosAsignados.length === 0) {
            alert("Debe asignar al menos un curso a este preceptor.");
            return;
        }

        // Mantenemos curso y division raiz por compatibilidad hacia atras en el buscador simple,
        // usando el primer curso de la lista
        const preceptorData = { 
            nombre, 
            apellido, 
            dni, 
            cursos: cursosAsignados,
            curso: cursosAsignados[0].curso,
            division: cursosAsignados[0].division
        };

        if (editingId) {
            StorageService.updateItem(STORAGE_KEYS.PRECEPTORS, editingId, preceptorData);
        } else {
            StorageService.addItem(STORAGE_KEYS.PRECEPTORS, preceptorData);
        }
        cargarPreceptores();
        setIsFormOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Está seguro de eliminar a este preceptor?')) {
            StorageService.removeItem(STORAGE_KEYS.PRECEPTORS, id);
            cargarPreceptores();
        }
    };

    const filtrados = preceptores.filter(p => {
        const busqueda = searchTerm.toLowerCase();
        const coincideNombre = p.nombre.toLowerCase().includes(busqueda) || p.apellido.toLowerCase().includes(busqueda);
        const coincideCurso = p.cursos?.some(c => c.curso.toLowerCase().includes(busqueda) || c.division.toLowerCase().includes(busqueda)) || p.curso?.toLowerCase().includes(busqueda);
        return coincideNombre || coincideCurso;
    });

    return (
        <div className="space-y-6 max-w-6xl mx-auto w-full animate-in fade-in duration-500 pb-20">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <Users className="text-blue-600" /> Gestión de Preceptores
                    </h1>
                    <p className="text-slate-500 mt-2">Administre los preceptores y asígnelos a los cursos.</p>
                </div>
                <button
                    onClick={() => handleOpenForm()}
                    className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
                >
                    <Plus size={20} /> Nuevo Preceptor
                </button>
            </header>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
                <Search className="text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Buscar por nombre, apellido o curso..." 
                    className="w-full bg-transparent outline-none text-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Preceptor</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">DNI</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Curso Asignado</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtrados.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                        No se encontraron preceptores.
                                    </td>
                                </tr>
                            ) : (
                                filtrados.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-800">{p.apellido}, {p.nombre}</p>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{p.dni}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {(p.cursos && p.cursos.length > 0) ? (
                                                    p.cursos.map((c, i) => (
                                                        <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {c.curso} "{c.division}"
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {p.curso} "{p.division}"
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenForm(p)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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

            {/* Modal de Formulario */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Editar Preceptor' : 'Nuevo Preceptor'}</h2>
                            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                                    <input required type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
                                    <input required type="text" value={apellido} onChange={e => setApellido(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">DNI</label>
                                <input required type="text" value={dni} onChange={e => setDni(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div className="pt-2 border-t border-slate-100 mt-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Cursos Asignados</label>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div className="grid grid-cols-[1fr,1fr,auto] gap-2 items-end">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Curso</label>
                                            <select value={tempCurso} onChange={e => setTempCurso(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                                                <option value="1ro">1ro</option>
                                                <option value="2do">2do</option>
                                                <option value="3ro">3ro</option>
                                                <option value="4to">4to</option>
                                                <option value="5to">5to</option>
                                                <option value="6to">6to</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">División</label>
                                            <input type="text" placeholder="Ej: A, Unica, 1ra..." value={tempDivision} onChange={e => setTempDivision(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                                        </div>
                                        <button type="button" onClick={handleAddCurso} disabled={!tempDivision} className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 disabled:opacity-50 transition-colors text-sm font-medium">
                                            Agregar
                                        </button>
                                    </div>
                                    
                                    <div className="mt-4 space-y-2">
                                        {cursosAsignados.length === 0 ? (
                                            <p className="text-sm text-slate-500 text-center italic py-2">Agregue al menos un curso a este preceptor.</p>
                                        ) : (
                                            cursosAsignados.map((c, i) => (
                                                <div key={i} className="flex justify-between items-center bg-white border border-slate-200 p-2 rounded-lg text-sm">
                                                    <span className="font-medium text-slate-700">{c.curso} "{c.division}"</span>
                                                    <button type="button" onClick={() => handleRemoveCurso(i)} className="text-red-400 hover:text-red-600 px-2">✕</button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3 justify-end mt-4">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors w-full sm:w-auto">Cancelar</button>
                                <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 active:translate-y-0 w-full sm:w-auto">Guardar Preceptor</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PreceptoresPage;
