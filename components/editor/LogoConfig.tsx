import React, { useRef } from 'react';
import { QRConfig } from '../../types';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface LogoConfigProps {
  config: QRConfig;
  updateConfig: (key: keyof QRConfig, value: any) => void;
}

export const LogoConfig: React.FC<LogoConfigProps> = ({ config, updateConfig }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("El archivo es demasiado grande (Máx 2MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateConfig('logoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    updateConfig('logoUrl', undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {!config.logoUrl ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors group"
        >
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-700">Subir Logotipo</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG (Max 2MB)</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-16 h-16 border rounded-lg p-1 bg-gray-50 flex-shrink-0 relative overflow-hidden">
             <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1">
             <h4 className="text-sm font-medium text-gray-900">Logo subido</h4>
             <button 
                onClick={removeLogo}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mt-1 font-medium"
             >
                <X className="w-3 h-3" /> Eliminar logo
             </button>
          </div>
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/png, image/jpeg, image/svg+xml" 
        className="hidden" 
      />

      {config.logoUrl && (
        <div className="space-y-3">
           <h3 className="text-sm font-bold text-gray-900">CONFIGURACIÓN</h3>
           <div className="bg-white p-4 rounded-lg border border-gray-200">
               <div className="flex justify-between items-center mb-2">
                 <label className="text-xs font-semibold text-gray-500">Tamaño del Logo</label>
                 <span className="text-xs font-mono text-gray-400">{config.logoPadding}px</span>
               </div>
               <input 
                  type="range" 
                  min="20" 
                  max="80" 
                  step="1"
                  value={config.logoPadding} 
                  onChange={(e) => updateConfig('logoPadding', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
               />
           </div>
        </div>
      )}
      
      <div className="pt-4 border-t border-gray-200">
         <h3 className="text-sm font-bold text-gray-900 mb-3">LOGOS PREDEFINIDOS</h3>
         <div className="flex gap-2">
            <button onClick={() => updateConfig('logoUrl', 'https://cdn-icons-png.flaticon.com/512/174/174857.png')} className="w-10 h-10 p-1 border hover:border-blue-500 rounded bg-white"><img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" className="w-full h-full object-contain" /></button>
            <button onClick={() => updateConfig('logoUrl', 'https://cdn-icons-png.flaticon.com/512/124/124010.png')} className="w-10 h-10 p-1 border hover:border-blue-500 rounded bg-white"><img src="https://cdn-icons-png.flaticon.com/512/124/124010.png" className="w-full h-full object-contain" /></button>
            <button onClick={() => updateConfig('logoUrl', 'https://cdn-icons-png.flaticon.com/512/2111/2111463.png')} className="w-10 h-10 p-1 border hover:border-blue-500 rounded bg-white"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" className="w-full h-full object-contain" /></button>
            <button onClick={() => updateConfig('logoUrl', 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png')} className="w-10 h-10 p-1 border hover:border-blue-500 rounded bg-white"><img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" className="w-full h-full object-contain" /></button>
         </div>
      </div>

    </div>
  );
};