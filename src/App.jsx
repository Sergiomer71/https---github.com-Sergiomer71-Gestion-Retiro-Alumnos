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
import { ROLES } from './config/constants';

// Proteger rutas de administrador
const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/registro-retiro" />;
  return children;
};

// Proteger rutas de celador
const CeladorRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        {/* Rutas de Administrador */}
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

        {/* Rutas Compartidas / Celador */}
        <Route path="registro-retiro" element={
          <CeladorRoute>
            <RegistroRetiroPage />
          </CeladorRoute>
        } />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

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
