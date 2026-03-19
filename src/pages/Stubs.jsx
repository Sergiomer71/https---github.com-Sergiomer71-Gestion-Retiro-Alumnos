// ─────────────────────────────────────────
// ARCHIVO: Stubs.jsx
// DESCRIPCIÓN: Componentes temporales (esqueletos) mientras se construyen las pantallas finales.
// MÓDULO: Desarrollo / Utilitarios
// DEPENDENCIAS: React
// ─────────────────────────────────────────

import React from 'react';

/**
 * Componente base reutilizable para mostrar un aviso de "Página en Construcción".
 * @param {string} title - El título que se mostrará en la cabecera de la página.
 */
const BasePage = ({ title }) => (
    <div className="space-y-6 animate-in fade-in duration-500">
        <header>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
            <p className="text-slate-500 mt-1">Este módulo está en proceso de desarrollo y estará disponible pronto.</p>
        </header>
    </div>
);

// --- EXPORTACIÓN DE PANTALLAS TEMPORALES ---
// Estos componentes se usan como 'placeholders' en el sistema de navegación 
// antes de que las pantallas reales estén terminadas.

/** Stub para la sección de Alumnos */
export const AlumnosPage = () => <BasePage title="Gestión de Alumnos y Familiares" />;

/** Stub para la sección de Reportes */
export const ReportesPage = () => <BasePage title="Generación de Reportes" />;

/** Stub para la configuración técnica */
export const ConfiguracionPage = () => <BasePage title="Configuración del Sistema" />;

/** Stub para el registro operativo de retiros */
export const RegistroRetiroPage = () => <BasePage title="Registro Operativo de Retiros" />;
