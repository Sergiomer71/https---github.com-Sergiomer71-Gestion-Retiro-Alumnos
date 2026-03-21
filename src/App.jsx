// ─────────────────────────────────────────
// ARCHIVO: App.jsx
// DESCRIPCIÓN: Componente principal que define las rutas y la seguridad
// MÓDULO: Global / Rutas
// DEPENDENCIAS: React Router, AuthContext, Pages
// ─────────────────────────────────────────

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './core/AuthContext';
import Layout from './ui/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AlumnosPage from './pages/Alumnos';
import RegistroRetiroPage from './pages/RegistroRetiro';
import ConfiguracionPage from './pages/Configuracion';
import ReportesPage from './pages/Reportes';
import HistorialRetirosPage from './pages/HistorialRetiros';
import PreceptoresPage from './pages/Preceptores';
import AltaCeladorPage from './pages/AltaCelador';
import AltaCursoPage from './pages/AltaCurso';
import ConfiguracionInicial from './pages/ConfiguracionInicial';
import { ROLES, STORAGE_KEYS } from './config/constants';
import StorageService from './storage/localStorage';
import { useLocation } from 'react-router-dom';

/**
 * Componente envoltorio para proteger rutas exclusivas de Administrador.
 * Redirige al login si no hay sesión, o al registro de retiro si no es admin.
 */
const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  // Si no hay usuario, mandamos a loguear
  if (!user) return <Navigate to="/login" />;
  
  // Si no es admin, lo mandamos a la única pantalla que tiene permitida (Celador)
  if (!isAdmin) return <Navigate to="/registro-retiro" />;

  // Obligar a configurar la institución la primera vez
  const institucion = StorageService.get(STORAGE_KEYS.INSTITUCION);
  const isConfigured = institucion && institucion.nombre;

  if (!isConfigured && location.pathname !== '/configuracion-inicial') {
      // Si no existe o le falta el nombre, redirigir a config obligatoria
      return <Navigate to="/configuracion-inicial" replace />;
  }
  
  // Si intenta abrir la bienvenida inicial pero ya rellenó la info, lo disuadimos al dashboard
  if (isConfigured && location.pathname === '/configuracion-inicial') {
      return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * Componente envoltorio para rutas accesibles por cualquier usuario autenticado.
 * Solo verifica que el usuario haya iniciado sesión.
 */
const CeladorRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
};

/**
 * Definición de todas las rutas de navegación del sistema.
 * Utiliza React Router para cambiar entre pantallas.
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Pantallas completas externas al Layout principal */}
      <Route path="/login" element={<Login />} />
      <Route path="/configuracion-inicial" element={
        <AdminRoute>
          <ConfiguracionInicial />
        </AdminRoute>
      } />
      
      {/* Rutas que utilizan el diseño común (Sidebar y Main) */}
      <Route path="/" element={<Layout />}>
        
        {/* Rutas de Administrador: Protegidas con AdminRoute */}
        <Route index element={
          <AdminRoute>
            <Dashboard />
          </AdminRoute>
        } />
        <Route path="alumnos" element={
          <AdminRoute>
            <AlumnosPage />
          </AdminRoute>
        } />
        <Route path="historial-retiros" element={
          <AdminRoute>
            <HistorialRetirosPage />
          </AdminRoute>
        } />
        <Route path="reportes" element={
          <AdminRoute>
            <ReportesPage />
          </AdminRoute>
        } />
        <Route path="configuracion" element={
          <AdminRoute>
            <ConfiguracionPage />
          </AdminRoute>
        } />
        <Route path="preceptores" element={
          <AdminRoute>
            <PreceptoresPage />
          </AdminRoute>
        } />
        <Route path="alta-celador" element={
          <AdminRoute>
            <AltaCeladorPage />
          </AdminRoute>
        } />
        <Route path="alta-curso" element={
          <AdminRoute>
            <AltaCursoPage />
          </AdminRoute>
        } />

        {/* Rutas Compartidas o de Celador: Protegidas con CeladorRoute */}
        <Route path="registro-retiro" element={
          <CeladorRoute>
            <RegistroRetiroPage />
          </CeladorRoute>
        } />
      </Route>

      {/* Redirección por defecto si la ruta no existe */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/**
 * Raíz de la aplicación que inicializa el Proveedor de Autenticación
 * y el gestor de navegación (BrowserRouter).
 */
const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

