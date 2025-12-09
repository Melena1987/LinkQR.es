import React from 'react';
import { User } from 'firebase/auth';
import { User as UserIcon, Mail, Shield, Sparkles, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface ProfileProps {
  user: User;
  isPro: boolean;
}

export const Profile: React.FC<ProfileProps> = ({ user, isPro }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Mi Perfil</h2>
        </div>
        <div className="p-8">
            <div className="flex items-center gap-6">
                <div className={clsx(
                    "w-20 h-20 rounded-full flex items-center justify-center overflow-hidden border-4",
                    isPro ? "border-indigo-100" : "border-gray-100"
                )}>
                    {user.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <UserIcon className="w-8 h-8 text-gray-400" />
                        </div>
                    )}
                </div>
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-gray-900">{user.displayName || 'Usuario'}</h3>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Mail className="w-4 h-4" />
                        {user.email}
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-500" />
                Plan Actual
            </h3>
            {isPro ? (
                 <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                   <Sparkles className="w-3 h-3" /> PRO
                 </span>
            ) : (
                <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-full uppercase tracking-wider">
                   Gratis
                 </span>
            )}
         </div>
         
         <div className="p-8">
            {isPro ? (
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">¡Eres un miembro PRO!</h4>
                    <p className="text-gray-500 mb-6">Disfrutas de acceso ilimitado a todas las características premium.</p>
                </div>
            ) : (
                <div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6">
                        <h4 className="text-blue-900 font-bold text-lg mb-2">Actualiza a PRO</h4>
                        <p className="text-blue-700 text-sm mb-4">Desbloquea QRs ilimitados, analíticas avanzadas y soporte prioritario.</p>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm w-full sm:w-auto">
                            Ver Planes
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Tu plan gratis incluye:</p>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-sm text-gray-600">
                                <Check className="w-4 h-4 text-green-500" /> 10 QRs Dinámicos
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-600">
                                <Check className="w-4 h-4 text-green-500" /> Personalización básica
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-600">
                                <Check className="w-4 h-4 text-green-500" /> Estadísticas limitadas
                            </li>
                        </ul>
                    </div>
                </div>
            )}
         </div>
      </div>

    </div>
  );
};