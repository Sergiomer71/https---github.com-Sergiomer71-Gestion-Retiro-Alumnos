import React, { useState } from 'react';
import StorageService from '../storage/localStorage';
import { STORAGE_KEYS } from '../config/constants';
import { Database, Download, Upload, AlertTriangle, CheckCircle2 } from 'lucide-react';

const ConfiguracionPage = () => {
    const [importStatus, setImportStatus] = useState(null);

    const handleExport = () => {
        try {
            const jsonStr = StorageService.exportData();
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `backup_escuela_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            alert('Error en la exportación: ' + err.message);
        }
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!confirm('¡ATENCIÓN! La importación sobrescribirá los datos actuales. ¿Está seguro?')) {
            e.target.value = ''; // reiniciar
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = event.target.result;
                StorageService.importData(json);
                setImportStatus({ type: 'success', msg: 'Base de datos restaurada correctamente. Recargue la página para ver los cambios.' });
            } catch (err) {
                setImportStatus({ type: 'error', msg: err.message });
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // reiniciar
    };

    return (
        <div className="space-y-6 max-w-3xl animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <Database className="text-blue-600" /> Base de Datos y Configuración
                </h1>
                <p className="text-slate-500 mt-2">Gestione la exportación e importación de la base de datos (JSON).</p>
            </header>

            {importStatus && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${importStatus.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {importStatus.type === 'success' ? <CheckCircle2 className="shrink-0" /> : <AlertTriangle className="shrink-0" />}
                    <div>
                        <p className="font-bold">{importStatus.type === 'success' ? 'Éxito' : 'Error en la Importación'}</p>
                        <p className="text-sm mt-1">{importStatus.msg}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

                {/* Exportar */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <Download size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Exportar Datos</h2>
                    <p className="text-slate-500 text-sm mb-6 flex-1">
                        Descargue una copia de seguridad en formato JSON estructurado con todos los estudiantes, usuarios y retiros.
                    </p>
                    <button
                        onClick={handleExport}
                        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                    >
                        Generar Archivo .json
                    </button>
                </div>

                {/* Importar */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-4">
                        <Upload size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Importar Datos</h2>
                    <p className="text-slate-500 text-sm mb-6 flex-1">
                        Restaure el sistema cargando un archivo `.json` de respaldo previo. <br /> <strong className="text-orange-600">Esto reemplazará los datos.</strong>
                    </p>
                    <div className="w-full relative">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            title="Seleccionar archivo JSON"
                        />
                        <button className="w-full flex items-center justify-center gap-2 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-800 font-medium py-3 px-4 rounded-xl transition-colors pointer-events-none">
                            Seleccionar Archivo
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ConfiguracionPage;
