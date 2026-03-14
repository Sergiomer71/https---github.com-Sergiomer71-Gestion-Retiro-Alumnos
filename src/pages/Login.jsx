import React, { useState } from 'react';
import { useAuth } from '../core/AuthContext';
import { UserCheck } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, user, isAdmin } = useAuth();
    const navigate = useNavigate();

    if (user) {
        return <Navigate to={isAdmin ? "/" : "/registro-retiro"} replace />;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        const result = login(username, password);
        if (!result.success) {
            setError(result.message);
        } else {
            navigate(result.role === 'ADMIN' ? "/" : "/registro-retiro");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 transform transition-all">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                        <UserCheck size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Sistema de Retiros</h2>
                    <p className="text-slate-500 mt-2">Ingreso de Personal</p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Usuario</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                            placeholder="Ej: admin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Iniciar Sesión
                    </button>
                </form>
                <div className="mt-6 text-center text-xs text-slate-400">
                    <p>Credenciales por defecto (Pass: 123):<br />Admin: <strong>admin</strong> | Celador: <strong>celador</strong></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
