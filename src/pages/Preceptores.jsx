// ─────────────────────────────────────────
// ARCHIVO: Preceptores.jsx
// DESCRIPCIÓN: Pantalla para gestionar el personal de preceptoría y sus cursos asignados.
// MÓDULO: Gestión de Datos / Configuración
// DEPENDENCIAS: React, StorageService, Lucide Icons, Constants
// ─────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import StorageService from '../storage/localStorage';
import { STORAGE_KEYS } from '../config/constants';
import { Users, Plus, Trash2, Edit, Search } from 'lucide-react';

/**
 * Componente principal para la administración de preceptores.
 * Permite dar de alta preceptores y asignarles uno o más cursos/divisiones.
 */
const PreceptoresPage = () => {
    // --- ESTADOS DE LA PÁGINA ---
    const [preceptores, setPreceptores] = useState([]); // Lista de todos los preceptores cargados
    const [searchTerm, setSearchTerm] = useState(''); // Término de búsqueda para filtrar la tabla
    const [isFormOpen, setIsFormOpen] = useState(false); // Controla la visibilidad del modal de formulario
    
    // --- ESTADOS DEL FORMULARIO (EDICIÓN/CREACIÓN) ---
    const [editingId, setEditingId] = useState(null); // ID del preceptor que se está editando (null si es nuevo)
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [dni, setDni] = useState('');
    
    // --- GESTIÓN DE CURSOS MÚLTIPLES ---
    const [cursosAsignados, setCursosAsignados] = useState([]); // Lista de {curso, division} asignados al preceptor
    const [tempCurso, setTempCurso] = useState('1ro'); // Valor temporal del selector de curso en el formulario
    const [tempDivision, setTempDivision] = useState(''); // Valor temporal del campo división

    // Cargar datos al iniciar el componente
    useEffect(() => {
        cargarPreceptores();
    }, []);

    /**
     * Obtiene la lista de preceptores desde el almacenamiento local.
     */
    const cargarPreceptores = () => {
        const data = StorageService.get(STORAGE_KEYS.PRECEPTORS, []);
        setPreceptores(data);
    };

    /**
     * Prepara y abre el formulario para crear o editar un preceptor.
     * @param {object|null} preceptor - El objeto preceptor a editar, o null para uno nuevo.
     */
    const handleOpenForm = (preceptor = null) => {
        if (preceptor) {
            // Modo Edición: Cargamos los datos existentes
            setEditingId(preceptor.id);
            setNombre(preceptor.nombre);
            setApellido(preceptor.apellido);
            setDni(preceptor.dni);
            
            // Compatibilidad: Si el preceptor tiene el formato antiguo (un solo curso/div), lo migramos a la lista
            if (preceptor.curso && preceptor.division && (!preceptor.cursos || preceptor.cursos.length === 0)) {
                setCursosAsignados([{ curso: preceptor.curso, division: preceptor.division }]);
            } else {
                setCursosAsignados(preceptor.cursos || []);
            }
        } else {
            // Modo Creación: Limpiamos todos los campos
            setEditingId(null);
            setNombre('');
            setApellido('');
            setDni('');
            setCursosAsignados([]);
        }
        // Reiniciamos selectores temporales de curso
        setTempCurso('1ro');
        setTempDivision('');
        setIsFormOpen(true);
    };

    /**
     * Agrega un curso y división a la lista temporal del preceptor actual.
     */
    const handleAddCurso = () => {
        if (!tempDivision) return; // Validación simple: requiere división
        setCursosAsignados([...cursosAsignados, { curso: tempCurso, division: tempDivision }]);
        setTempDivision(''); // Limpiamos para el siguiente curso
    };

    /**
     * Quita un curso de la lista temporal.
     * @param {number} index - Índice del elemento en el array.
     */
    const handleRemoveCurso = (index) => {
        const nuevos = [...cursosAsignados];
        nuevos.splice(index, 1);
        setCursosAsignados(nuevos);
    };

    /**
     * Envía los datos del formulario al servicio de almacenamiento.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validación: Un preceptor debe tener al menos un curso asignado
        if (cursosAsignados.length === 0) {
            alert("Debe asignar al menos un curso a este preceptor.");
            return;
        }

        /**
         * Objeto de datos del preceptor.
         * Mantenemos curso y division en la raíz por compatibilidad con funciones de búsqueda simple.
         */
        const preceptorData = { 
            nombre, 
            apellido, 
            dni, 
            cursos: cursosAsignados,
            curso: cursosAsignados[0].curso,
            division: cursosAsignados[0].division
        };

        // Guardamos o actualizamos según corresponda
        if (editingId) {
            StorageService.updateItem(STORAGE_KEYS.PRECEPTORS, editingId, preceptorData);
        } else {
            StorageService.addItem(STORAGE_KEYS.PRECEPTORS, preceptorData);
        }
        
        cargarPreceptores(); // Refrescamos la tabla
        setIsFormOpen(false); // Cerramos el modal
    };

    /**
     * Elimina un preceptor tras confirmar la acción con el usuario.
     * @param {string} id - ID único del preceptor.
     */
    const handleDelete = (id) => {
        if (window.confirm('¿Está seguro de eliminar a este preceptor?')) {
            StorageService.removeItem(STORAGE_KEYS.PRECEPTORS, id);
            cargarPreceptores();
        }
    };

    // --- LÓGICA DE BÚSQUEDA ---
    // Filtramos la lista basándonos en nombre, apellido o cursos asignados
    const filtrados = preceptores.filter(p => {
        const busqueda = searchTerm.toLowerCase();
        const coincideNombre = p.nombre.toLowerCase().includes(busqueda) || p.apellido.toLowerCase().includes(busqueda);
        
        // Buscamos dentro de todos los cursos que tiene asignados
        const coincideCurso = p.cursos?.some(c => 
            c.curso.toLowerCase().includes(busqueda) || 
            c.division.toLowerCase().includes(busqueda)
        ) || p.curso?.toLowerCase().includes(busqueda);
        
        return coincideNombre || coincideCurso;
    });

    return (
        <div className="space-y-6 max-w-6xl mx-auto w-full animate-in fade-in duration-500 pb-20">
            {/* Cabecera Principal */}
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

            {/* Barra de Búsqueda */}
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

            {/* Listado / Tabla de Preceptores */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Preceptor</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">DNI</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Cursos Asignados</th>
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
                                                {/* Mostramos todos los cursos como etiquetas (badges) */}
                                                {(p.cursos && p.cursos.length > 0) ? (
                                                    p.cursos.map((c, i) => (
                                                        <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {c.curso} "{c.division}"
                                                        </span>
                                                    ))
                                                ) : (
                                                    /* Caso de compatibilidad con datos viejos */
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

            {/* Modal del Formulario de Alta/Edición */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Cabecera del Modal */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Editar Preceptor' : 'Nuevo Preceptor'}</h2>
                            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Datos personales básicos */}
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

                            {/* Sección para agregar múltiples cursos */}
                            <div className="pt-2 border-t border-slate-100 mt-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Asignación de Cursos</label>
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
                                            <input type="text" placeholder="A, B, Unica..." value={tempDivision} onChange={e => setTempDivision(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                                        </div>
                                        <button type="button" onClick={handleAddCurso} disabled={!tempDivision} className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 disabled:opacity-50 transition-colors text-sm font-medium">
                                            Agregar
                                        </button>
                                    </div>
                                    
                                    {/* Lista de cursos ya agregados al preceptor actual */}
                                    <div className="mt-4 space-y-2">
                                        {cursosAsignados.length === 0 ? (
                                            <p className="text-sm text-slate-500 text-center italic py-2">Agregue al menos un curso.</p>
                                        ) : (
                                            cursosAsignados.map((c, i) => (
                                                <div key={i} className="flex justify-between items-center bg-white border border-slate-200 p-2 rounded-lg text-sm">
                                                    <span className="font-medium text-slate-700">{c.curso} "{c.division}"</span>
                                                    <button type="button" onClick={() => handleRemoveCurso(i)} className="text-red-400 hover:text-red-600 px-2 font-bold" title="Remover curso">✕</button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Botones de acción del modal */}
                            <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3 justify-end mt-4">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors w-full sm:w-auto">Cancelar</button>
                                <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 active:translate-y-0 w-full sm:w-auto">
                                    {editingId ? 'Guardar Cambios' : 'Registrar Preceptor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PreceptoresPage;
