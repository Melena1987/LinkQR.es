import React from 'react';
import { QRConfig } from '../../types';
import { Link, Globe, Zap, Lock } from 'lucide-react';
import { DOMAIN } from '../../constants';
import { clsx } from 'clsx';

interface UrlConfigProps {
  config: QRConfig;
  updateConfig: (key: keyof QRConfig, value: any) => void;
}

export const UrlConfig: React.FC<UrlConfigProps> = ({ config, updateConfig }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Type Selector */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Tipo de Código QR</h3>
        <div className="flex p-1 bg-gray-100 rounded-xl">
            <button
                onClick={() => updateConfig('qrType', 'dynamic')}
                className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                    config.qrType === 'dynamic' 
                        ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5" 
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                )}
            >
                <Zap className="w-4 h-4" />
                Dinámico
            </button>
            <button
                onClick={() => updateConfig('qrType', 'static')}
                className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                    config.qrType === 'static' 
                        ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5" 
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                )}
            >
                <Lock className="w-4 h-4" />
                Estático
            </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 ml-1">
            {config.qrType === 'dynamic' 
                ? "Permite editar el destino después de crear el QR y ver estadísticas de escaneo."
                : "El destino se incrusta directamente en el QR. No se puede cambiar después."
            }
        </p>
      </div>

      <hr className="border-gray-100" />

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Destino del Enlace</h3>
        <p className="text-sm text-gray-500 mb-4">Introduce la URL a la que quieres redirigir a los usuarios.</p>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Globe className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="url"
            value={config.destinationUrl}
            onChange={(e) => updateConfig('destinationUrl', e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder="https://ejemplo.com"
          />
        </div>
      </div>

      {config.qrType === 'dynamic' && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
            <Link className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="w-full">
                <h4 className="font-medium text-blue-900 text-sm">Enlace Corto Dinámico</h4>
                <p className="text-xs text-blue-700 mt-1">
                 El QR dirige a este enlace corto, que redirige automáticamente a tu destino.
                </p>
                <div className="mt-3 flex items-center bg-white border border-blue-200 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                <span className="text-gray-400 text-sm select-none border-r border-gray-200 pr-2 mr-2">https://{DOMAIN}/</span>
                <input
                    type="text"
                    value={config.shortUrlId}
                    onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z0-9-_]/g, '');
                        updateConfig('shortUrlId', val);
                    }}
                    className="flex-1 text-blue-600 font-mono font-bold text-sm bg-transparent outline-none placeholder-blue-300 min-w-0"
                    placeholder="tu-enlace-aqui"
                    maxLength={30}
                />
                </div>
            </div>
            </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Proyecto</label>
        <input 
            type="text" 
            value={config.title}
            onChange={(e) => updateConfig('title', e.target.value)}
            className="w-full border-gray-300 border rounded-lg p-2.5 text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            placeholder="Ej: Menú Restaurante"
        />
      </div>
    </div>
  );
};