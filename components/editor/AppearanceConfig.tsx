import React from 'react';
import { QRConfig } from '../../types';
import { ColorInput } from '../ui/ColorInput';
import { LogoConfig } from './LogoConfig';
import { FrameConfig } from './FrameConfig';
import { clsx } from 'clsx';
import { Square, Circle, Hexagon, Component, Palette, LayoutTemplate, Image } from 'lucide-react';

interface AppearanceConfigProps {
  config: QRConfig;
  updateConfig: (key: keyof QRConfig, value: any) => void;
}

export const AppearanceConfig: React.FC<AppearanceConfigProps> = ({ config, updateConfig }) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* 1. Frames Section */}
      <section>
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
           <LayoutTemplate className="w-4 h-4 text-blue-600" /> MARCOS
        </h3>
        <FrameConfig config={config} updateConfig={updateConfig} />
      </section>

      <hr className="border-gray-100" />

      {/* 2. Logos Section */}
      <section>
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
           <Image className="w-4 h-4 text-blue-600" /> LOGOS
        </h3>
        <LogoConfig config={config} updateConfig={updateConfig} />
      </section>

      <hr className="border-gray-100" />

      {/* 3. Shapes & Eyes */}
      <section>
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Component className="w-4 h-4 text-blue-600" /> FORMAS
        </h3>
        
        <div className="space-y-4">
            <div>
                <label className="text-xs text-gray-500 font-semibold mb-2 block uppercase">Estilo de Puntos</label>
                <div className="grid grid-cols-3 gap-3">
                {[
                    { id: 'square', label: 'Cuadrado', icon: Square },
                    { id: 'dots', label: 'Puntos', icon: Circle },
                    { id: 'rounded', label: 'Fluido', icon: Hexagon },
                ].map((shape) => (
                    <button
                    key={shape.id}
                    onClick={() => updateConfig('dotStyle', shape.id)}
                    className={clsx(
                        "flex flex-col items-center justify-center p-2 border rounded-lg transition-all",
                        config.dotStyle === shape.id 
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm" 
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    )}
                    >
                    <shape.icon className="w-5 h-5 mb-1.5" fill={config.dotStyle === shape.id ? "currentColor" : "none"} />
                    <span className="text-[10px] font-medium uppercase">{shape.label}</span>
                    </button>
                ))}
                </div>
            </div>

            <div>
                <label className="text-xs text-gray-500 font-semibold mb-2 block uppercase">Estilo de Ojos</label>
                <div className="grid grid-cols-3 gap-3">
                {[
                    { id: 'square', label: 'Sharp' },
                    { id: 'rounded', label: 'Soft' },
                    { id: 'leaf', label: 'Leaf' },
                ].map((style) => (
                    <button
                    key={style.id}
                    onClick={() => updateConfig('eyeStyle', style.id)}
                    className={clsx(
                        "py-2 px-2 border rounded-lg text-xs font-medium uppercase transition-all",
                        config.eyeStyle === style.id 
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm" 
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    )}
                    >
                    {style.label}
                    </button>
                ))}
                </div>
            </div>
        </div>
      </section>

      <hr className="border-gray-100" />

      {/* 4. Colors */}
      <section>
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4 text-blue-600" /> COLORES
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ColorInput 
            label="Código QR" 
            value={config.fgColor} 
            onChange={(c) => updateConfig('fgColor', c)} 
          />
          <ColorInput 
            label="Fondo" 
            value={config.bgColor} 
            onChange={(c) => updateConfig('bgColor', c)} 
          />
          <ColorInput 
            label="Ojos (Esquinas)" 
            value={config.eyeColor} 
            onChange={(c) => updateConfig('eyeColor', c)} 
          />
        </div>
      </section>
      
    </div>
  );
};