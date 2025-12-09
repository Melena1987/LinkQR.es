import React from 'react';
import { QRConfig } from '../../types';
import { clsx } from 'clsx';
import { Type } from 'lucide-react';
import { ColorInput } from '../ui/ColorInput';

interface FrameConfigProps {
  config: QRConfig;
  updateConfig: (key: keyof QRConfig, value: any) => void;
}

export const FrameConfig: React.FC<FrameConfigProps> = ({ config, updateConfig }) => {
  
  const frames: { id: QRConfig['frameStyle']; label: string; preview: React.ReactNode }[] = [
    { 
        id: 'none', 
        label: 'Sin Marco',
        preview: <div className="w-8 h-8 bg-gray-200 rounded-md border border-gray-300"></div>
    },
    { 
        id: 'simple', 
        label: 'Simple',
        preview: (
            <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 border-2 border-current rounded-sm"></div>
                <div className="h-1 w-6 bg-current rounded-full"></div>
            </div>
        )
    },
    { 
        id: 'balloon', 
        label: 'Globo',
        preview: (
            <div className="flex flex-col items-center">
                <div className="w-8 h-6 bg-current rounded-t-lg mb-0.5"></div>
                <div className="w-8 h-8 border-2 border-current rounded-sm"></div>
            </div>
        )
    },
    { 
        id: 'black-tie', 
        label: 'Etiqueta',
        preview: (
             <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-current rounded-sm flex items-center justify-center">
                    <div className="w-4 h-4 bg-white"></div>
                </div>
            </div>
        )
    },
  ];

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-4 gap-3">
        {frames.map((frame) => (
          <button
            key={frame.id}
            onClick={() => {
                updateConfig('frameStyle', frame.id);
                updateConfig('showFrame', frame.id !== 'none');
            }}
            className={clsx(
              "flex flex-col items-center justify-center p-3 border-2 rounded-xl transition-all h-24 gap-2",
              config.frameStyle === frame.id 
                ? "border-blue-600 bg-blue-50 text-blue-600" 
                : "border-gray-200 hover:border-gray-300 text-gray-400"
            )}
          >
            <div className="scale-75">{frame.preview}</div>
            <span className="text-[10px] font-bold uppercase tracking-wide">{frame.label}</span>
          </button>
        ))}
      </div>

      {config.showFrame && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
            
            <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Type className="w-3 h-3" /> Texto del Marco
                </label>
                <input 
                    type="text" 
                    value={config.frameText}
                    onChange={(e) => updateConfig('frameText', e.target.value)}
                    maxLength={20}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="SCAN ME"
                />
            </div>

            <ColorInput 
                label="Color del Marco" 
                value={config.frameColor} 
                onChange={(c) => updateConfig('frameColor', c)} 
            />
        </div>
      )}
    </div>
  );
};