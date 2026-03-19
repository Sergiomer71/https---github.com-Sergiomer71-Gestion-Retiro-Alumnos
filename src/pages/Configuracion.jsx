// ─────────────────────────────────────────
// ARCHIVO: Configuracion.jsx
// DESCRIPCIÓN: Herramientas de mantenimiento, respaldos e importación de datos.
// MÓDULO: Sistema / Configuración
// DEPENDENCIAS: React, StorageService, Constants, Lucide Icons
// ─────────────────────────────────────────

import React, { useState } from 'react';
import StorageService from '../storage/localStorage';
import { STORAGE_KEYS } from '../config/constants';
import { Database, Download, Upload, AlertTriangle, CheckCircle2, Trash2, ShieldAlert } from 'lucide-react';

/**
 * Pantalla que permite gestionar la persistencia de los datos del sistema.
 * Ideal para realizar copias de seguridad (.json) o restaurar la base de datos completa.
 */
const ConfiguracionPage = () => {
    // Estado para mostrar mensajes de éxito o error al usuario después de una operación
    const [importStatus, setImportStatus] = useState(null);

    /**
     * Exporta todos los datos del LocalStorage a un archivo JSON descargable.
     */
    const handleExport = () => {
        try {
            const jsonStr = StorageService.exportData();
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            // Creamos un link invisible para forzar la descarga en el navegador
            const a = document.createElement('a');
            a.href = url;
            a.download = `respaldo_sistema_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url); // Liberamos memoria
        } catch (err) {
            alert('Hubo un error al generar el respaldo: ' + err.message);
        }
    };

    /**
     * Elimina absolutamente toda la información del LocalStorage (Reinicio total).
     * Requiere una doble confirmación de seguridad.
     */
    const handleResetAll = () => {
        // Primera advertencia
        const confirm1 = confirm('¡ADVERTENCIA CRÍTICA! Esta acción eliminará permanentemente todos los alumnos, preceptores e historial de retiros.\n\n¿Está COMPLETAMENTE seguro?');
        if (!confirm1) return;

        // Segunda advertencia (Confirmación final)
        const confirm2 = confirm('¿CONFIRMA ELIMINAR TODO? Esta acción es irreversible y el sistema volverá a su estado inicial de instalación.');
        if (!confirm2) return;

        try {
            StorageService.clearAllData();
            setImportStatus({ type: 'success', msg: 'La base de datos se ha vaciado con éxito. El sistema se reiniciará en segundos.' });
            
            // Forzamos una recarga completa de la aplicación después de 2 segundos
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            setImportStatus({ type: 'error', msg: 'Error al intentar eliminar los datos: ' + err.message });
        }
    };

    /**
     * Lee un archivo JSON seleccionado por el usuario y reemplaza la base de datos actual.
     * @param {Event} e - Evento de selección de archivo.
     */
    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Advertencia: Los datos actuales se perderán
        if (!confirm('¡ATENCIÓN! La importación sobrescribirá por COMPLETO los datos actuales. ¿Desea continuar?')) {
            e.target.value = ''; // Reseteamos el input
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = event.target.result;
                // Intentamos parsear y guardar la nueva data
                StorageService.importData(json);
                setImportStatus({ type: 'success', msg: 'Información restaurada con éxito. Recargue para aplicar todos los cambios.' });
            } catch (err) {
                setImportStatus({ type: 'error', msg: 'El archivo no es válido o está corrupto: ' + err.message });
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Limpiamos el input file para permitir seleccionar el mismo archivo luego si es necesario
    };

    return (
        <div className="space-y-6 max-w-3xl animate-in fade-in duration-500">
            {/* Cabecera */}
            <header>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <Database className="text-blue-600" /> Sistema y Datos
                </h1>
                <p className="text-slate-500 mt-2">Herramientas para administración técnica y resguardo de la información.</p>
            </header>

            {/* Alerta de Estado (Carga exitosa o Fallida) */}
            {importStatus && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 ${importStatus.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {importStatus.type === 'success' ? <CheckCircle2 className="shrink-0" /> : <AlertTriangle className="shrink-0" />}
                    <div>
                        <p className="font-bold">{importStatus.type === 'success' ? 'Operación Exitosa' : 'Ocurrió un Problema'}</p>
                        <p className="text-sm mt-1">{importStatus.msg}</p>
                    </div>
                </div>
            )}

            {/* Opciones de Backup (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

                {/* Bloque: Exportar (Descargar) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 border border-blue-100">
                        <Download size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Respaldar (Exportar)</h2>
                    <p className="text-slate-500 text-sm mb-6 flex-1">
                        Crea un archivo con toda la información actual (alumnos, retiros, preceptores) para guardarlo en una memoria externa o PC.
                    </p>
                    <button
                        onClick={handleExport}
                        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-black text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-95"
                    >
                        Generar Archivo de Respaldo
                    </button>
                </div>

                {/* Bloque: Importar (Cargar archivo antiguo) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-4 border border-orange-100">
                        <Upload size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Restaurar (Importar)</h2>
                    <p className="text-slate-500 text-sm mb-6 flex-1">
                        Carga un archivo de respaldo previo para volver a un estado anterior. <br /> <strong className="text-red-500 font-black italic">AVISO: Borrará lo que hay actualmente.</strong>
                    </p>
                    <div className="w-full relative">
                        {/* El input real está oculto pero cubre todo el botón para que sea clickeable */}
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            title="Seleccionar archivo JSON"
                        />
                        <button className="w-full flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl transition-colors pointer-events-none group">
                            Seleccionar Archivo .json
                        </button>
                    </div>
                </div>

            </div>

            {/* SECCIÓN CRÍTICA (Zona Roja) */}
            <div className="mt-12 pt-8 border-t-2 border-dashed border-red-100">
                <div className="bg-red-50 rounded-3xl border border-red-200 p-8 shadow-sm">
                    <div className="flex items-center gap-3 text-red-700 mb-6">
                        <ShieldAlert size={32} className="animate-pulse" />
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Zona de Peligro</h2>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1">
                            <p className="text-red-900 font-black text-lg">Eliminación Absoluta de Datos</p>
                            <p className="text-red-700/80 text-sm mt-2 leading-relaxed font-medium">
                                Esta función limpia el almacenamiento local por completo. 
                                Se perderán todos los alumnos cargados, los historiales de retiros y la configuración de preceptores. 
                                <br /><strong>Solo use esto si desea empezar el año escolar desde cero.</strong>
                            </p>
                        </div>
                        
                        <button
                            onClick={handleResetAll}
                            className="shrink-0 flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-xl shadow-red-200 active:scale-95 group border-b-4 border-red-800"
                        >
                            <Trash2 size={24} className="group-hover:rotate-12 transition-transform" />
                            REINICIAR TODO
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfiguracionPage;
