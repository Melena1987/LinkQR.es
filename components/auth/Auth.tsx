import React, { useState } from 'react';
import { QrCode, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { auth, googleProvider } from '../../firebase';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await auth.signInWithPopup(googleProvider);
    } catch (err: any) {
      console.error(err);
      setError("Error al iniciar sesión con Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      if (isLogin) {
        await auth.signInWithEmailAndPassword(email, password);
      } else {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        // Set default display name from email part
        if (userCredential.user) {
            await userCredential.user.updateProfile({
                displayName: email.split('@')[0]
            });
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Credenciales incorrectas.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Este correo ya está registrado.");
      } else if (err.code === 'auth/weak-password') {
        setError("La contraseña debe tener al menos 6 caracteres.");
      } else {
        setError("Ocurrió un error. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-2 mb-6">
            <div className="bg-blue-600 p-2 rounded-xl">
                <QrCode className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
                LinkQR<span className="text-blue-600">.es</span>
            </span>
        </div>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
          {isLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta gratis'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
            
            {/* Google Login */}
            <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex justify-center items-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                <span>Continuar con Google</span>
            </button>

            <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">O continúa con email</span>
                </div>
            </div>

            <form className="space-y-5 mt-6" onSubmit={handleSubmit}>
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}
                
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="tu@email.com"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};