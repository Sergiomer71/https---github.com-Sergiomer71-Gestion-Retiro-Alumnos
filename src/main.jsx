// ─────────────────────────────────────────
// ARCHIVO: main.jsx
// DESCRIPCIÓN: Punto de entrada principal de la aplicación React
// MÓDULO: Global / Inicio
// DEPENDENCIAS: React, Shoelace (UI), App.jsx
// ─────────────────────────────────────────

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Importación de estilos del framework de componentes Shoelace
import '@shoelace-style/shoelace/dist/themes/light.css';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

import App from './App.jsx';

/**
 * Configuración de la ruta base para los activos de Shoelace (iconos, etc.)
 * Se utiliza un CDN para cargar estos recursos de forma eficiente.
 */
setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.19.1/cdn/');

/**
 * Inicialización de la aplicación React en el elemento con id 'root' del HTML.
 * StrictMode ayuda a identificar problemas potenciales durante el desarrollo.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

