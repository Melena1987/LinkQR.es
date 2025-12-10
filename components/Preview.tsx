import React from 'react';
import { QRConfig } from '../types';
import { DOMAIN } from '../constants';
import { Download, Share2, FileCode, FileImage } from 'lucide-react';
import { clsx } from 'clsx';
import { QRCodeSVG } from './ui/QRCodeSVG';
import { generateSVGString } from '../utils/qr';

interface PreviewProps {
  config: QRConfig;
}

export const Preview: React.FC<PreviewProps> = ({ config }) => {
  const qrValue = config.qrType === 'dynamic' 
    ? `https://${DOMAIN}/${config.shortUrlId}` 
    : config.destinationUrl || 'https://linkqr.es';

  // --- Download Logic ---

  const downloadPng = () => {
    // Generate the SVG String using the utility (ensures fidelity)
    const svgString = generateSVGString(config);
    const baseSize = 1000;
    
    const canvas = document.createElement("canvas");
    canvas.width = baseSize;
    canvas.height = baseSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, baseSize, baseSize);
      URL.revokeObjectURL(url);
      
      const link = document.createElement("a");
      link.download = `${config.title || 'qrcode'}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = url;
  };
  
  const downloadSvg = () => {
    const svgString = generateSVGString(config);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${config.title || 'qrcode'}.svg`;
    link.href = url;
    link.click();
  };

  const handleShare = async () => {
     try {
        await navigator.clipboard.writeText(qrValue);
        alert('Enlace copiado al portapapeles');
      } catch (err) {
        alert('No se pudo copiar');
      }
  };

  const renderFrameContainer = (children: React.ReactNode) => {
    if (!config.showFrame || config.frameStyle === 'none') {
        return <div className="p-4">{children}</div>;
    }

    const frameCommon = "flex flex-col items-center justify-center";
    
    if (config.frameStyle === 'simple') {
        return (
            <div className={`${frameCommon} bg-white p-4 rounded-xl shadow-lg border-4`} style={{ borderColor: config.frameColor }}>
                {children}
                <div className="mt-2 font-bold uppercase tracking-wider text-sm" style={{ color: config.frameColor }}>
                    {config.frameText}
                </div>
            </div>
        );
    }
    if (config.frameStyle === 'balloon') {
        return (
             <div className={`${frameCommon}`}>
                 <div className="relative px-6 py-2 rounded-full mb-2 font-bold text-white text-sm shadow-md" style={{ backgroundColor: config.frameColor }}>
                    {config.frameText}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45" style={{ backgroundColor: config.frameColor }}></div>
                 </div>
                 <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    {children}
                 </div>
             </div>
        );
    }
    if (config.frameStyle === 'black-tie') {
        return (
            <div className={`${frameCommon} p-5 rounded-xl shadow-2xl`} style={{ backgroundColor: config.frameColor }}>
                 <div className="bg-white p-2 rounded">
                    {children}
                 </div>
                 <div className="mt-3 font-bold uppercase tracking-widest text-white text-xs">
                    {config.frameText}
                </div>
            </div>
        );
    }
    return <div className="p-4">{children}</div>;
  };

  return (
    <div className="sticky top-6 flex flex-col gap-6">
      
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Vista Previa</h2>
          <span className={clsx(
            "text-xs px-2 py-1 rounded-full font-medium transition-colors",
            config.qrType === 'dynamic' ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-700"
          )}>
            {config.qrType === 'dynamic' ? 'Dinámico' : 'Estático'}
          </span>
        </div>
        
        <div className="p-8 flex flex-col items-center justify-center bg-white min-h-[400px] relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>
            
            <div className="relative z-10 transition-all duration-300 transform hover:scale-[1.02]">
                {renderFrameContainer(
                   <div className="w-[220px]">
                       <QRCodeSVG config={config} id="custom-qr-svg" />
                   </div>
                )}
            </div>
          
        </div>
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
             <p className="text-xs text-gray-400 font-mono text-center truncate select-all cursor-pointer hover:text-blue-600 transition-colors">
                {qrValue}
            </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={downloadPng}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all transform active:scale-95"
            >
            <FileImage className="w-4 h-4" />
            <span className="text-sm">PNG (HD)</span>
            </button>
            
            <button 
                onClick={downloadSvg}
                className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-3 px-4 rounded-xl font-semibold shadow-sm transition-all active:scale-95"
            >
            <FileCode className="w-4 h-4" />
            <span className="text-sm">SVG (Vector)</span>
            </button>
        </div>
        
        <button 
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-blue-600 py-2 text-sm font-medium transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Compartir enlace
        </button>
      </div>

    </div>
  );
};