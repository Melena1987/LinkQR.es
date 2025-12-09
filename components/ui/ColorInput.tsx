import React from 'react';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export const ColorInput: React.FC<ColorInputProps> = ({ label, value, onChange }) => {
  // Función para manejar cambios en el texto hexadecimal
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    // Permitir solo caracteres hexadecimales
    if (/^[0-9A-Fa-f]*$/.test(text)) {
      onChange(`#${text}`);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="flex items-center gap-3 bg-white border border-gray-200 p-2 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all shadow-sm">
        
        {/* Selector Visual Personalizado (Oculta el nativo para evitar estilos feos) */}
        <div className="relative w-10 h-10 rounded-md overflow-hidden shadow-inner border border-gray-200 flex-shrink-0 group cursor-pointer">
           <div 
             className="absolute inset-0 z-0 transition-transform group-hover:scale-110" 
             style={{ backgroundColor: value }} 
           />
           {/* El input real es invisible pero clicable */}
           <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          />
        </div>

        {/* Entrada de Texto Hex */}
        <div className="flex-1 flex items-center">
            <span className="text-gray-400 font-mono select-none mr-1 text-sm">#</span>
            <input
            type="text"
            value={value.replace('#', '')}
            onChange={handleHexChange}
            className="w-full text-sm text-gray-900 font-mono outline-none uppercase bg-transparent placeholder-gray-300"
            maxLength={6}
            placeholder="000000"
            spellCheck={false}
            />
        </div>
      </div>
    </div>
  );
};