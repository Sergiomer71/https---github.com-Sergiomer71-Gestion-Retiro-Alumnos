import React from 'react';

const BasePage = ({ title }) => (
    <div className="space-y-6 animate-in fade-in duration-500">
        <header>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
            <p className="text-slate-500 mt-1">Página en construcción.</p>
        </header>
    </div>
);

export const AlumnosPage = () => <BasePage title="Gestión de Alumnos y Familiares" />;
export const ReportesPage = () => <BasePage title="Reportes" />;
export const ConfiguracionPage = () => <BasePage title="Configuración del Sistema" />;
export const RegistroRetiroPage = () => <BasePage title="Registro de Retiros" />;
