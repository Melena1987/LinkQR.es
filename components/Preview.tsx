import React, { useMemo } from 'react';
import qrcode from 'qrcode-generator';
import { QRConfig } from '../types';
import { DOMAIN } from '../constants';
import { Download, Share2, FileCode, FileImage } from 'lucide-react';
import { clsx } from 'clsx';

interface PreviewProps {
  config: QRConfig;
}

export const Preview: React.FC<PreviewProps> = ({ config }) => {
  // Logic: Dynamic uses the short link, Static uses the direct destination
  const qrValue = config.qrType === 'dynamic' 
    ? `https://${DOMAIN}/${config.shortUrlId}` 
    : config.destinationUrl || 'https://linkqr.es';

  // --- Custom QR Generation Logic ---
  
  const qrData = useMemo(() => {
    try {
      // Type 0 = Auto detect, 'H' = High Error Correction (best for logos)
      const qr = qrcode(0, 'H'); 
      qr.addData(qrValue);
      qr.make();
      const count = qr.getModuleCount();
      const modules: boolean[][] = [];
      
      for (let r = 0; r < count; r++) {
        const row: boolean[] = [];
        for (let c = 0; c < count; c++) {
          row.push(qr.isDark(r, c));
        }
        modules.push(row);
      }
      return { modules, count };
    } catch (e) {
      console.error("Error generating QR", e);
      return { modules: [], count: 0 };
    }
  }, [qrValue]);

  // Helpers to identify Eye Zones (Finder Patterns)
  // The 3 big squares are always 7x7 modules
  const isEyeZone = (r: number, c: number, count: number) => {
    // Top Left
    if (r < 7 && c < 7) return true;
    // Top Right
    if (r < 7 && c >= count - 7) return true;
    // Bottom Left
    if (r >= count - 7 && c < 7) return true;
    return false;
  };

  const renderEye = (x: number, y: number, size: number, style: QRConfig['eyeStyle'], color: string) => {
    // Standard Eye is 7 modules wide. 
    // Outer box: 7x7. Inner box: 3x3.
    // We draw paths scaled to the module size (which is 1 unit in SVG coordinate space)
    
    // Outer Frame
    let outerPath = "";
    // Inner Center
    let innerPath = "";

    if (style === 'rounded') { // "Soft"
      outerPath = `
        M ${x + 3.5} ${y} 
        A 3.5 3.5 0 1 1 ${x + 3.5} ${y + 7} 
        A 3.5 3.5 0 1 1 ${x + 3.5} ${y} 
        M ${x + 3.5} ${y + 1} 
        A 2.5 2.5 0 1 0 ${x + 3.5} ${y + 6} 
        A 2.5 2.5 0 1 0 ${x + 3.5} ${y + 1} Z`;
      
      innerPath = `
        M ${x + 3.5} ${y + 2} 
        A 1.5 1.5 0 1 1 ${x + 3.5} ${y + 5} 
        A 1.5 1.5 0 1 1 ${x + 3.5} ${y + 2} Z`;

    } else if (style === 'leaf') { // "Leaf"
       // Leaf: Top-Left and Bottom-Right rounded, others sharp (or variation)
       // Let's do a nice organic leaf shape: Top-Left rounded, Bottom-Right rounded
       const r = 2.5;
       outerPath = `
         M ${x + r} ${y} 
         H ${x + 7} V ${y + 7 - r} 
         A ${r} ${r} 0 0 1 ${x + 7 - r} ${y + 7}
         H ${x} V ${y + r}
         A ${r} ${r} 0 0 1 ${x + r} ${y}
         M ${x + 1} ${y + 1}
         H ${x + 6} V ${y + 6} H ${x + 1} Z
       `;
       // Correction for Leaf cutout (substracting the middle) is hard in one path string without fill-rule.
       // Simpler approach: Draw Outer Solid, Draw White mask, Draw Inner.
       // Actually, let's just stick to SVG path with 'evenodd' fill rule or manual donut.
       
       // Simplified "Leaf" - Sharp Top-Right & Bottom-Left, Rounded Top-Left & Bottom-Right
       outerPath = `
        M ${x+2.5} ${y} H ${x+7} V ${y+4.5} A 2.5 2.5 0 0 1 ${x+4.5} ${y+7} H ${x} V ${y+2.5} A 2.5 2.5 0 0 1 ${x+2.5} ${y}
        M ${x+1} ${y+1} V ${y+2.5} A 1.5 1.5 0 0 0 ${x+2.5} ${y+4} H ${x+4} A 2 2 0 0 0 ${x+6} ${y+2} V ${y+1} H ${x+1} Z
       `; 
       // Note: complex paths are tricky manually. Using a standard "Leaf" approximation:
       // Top-Left corner radius 3.5, Bottom-Right radius 3.5.
       
       outerPath = `
         M ${x} ${y+3.5} A 3.5 3.5 0 0 1 ${x+3.5} ${y} H ${x+7} V ${y+7} H ${x+3.5} A 3.5 3.5 0 0 1 ${x} ${y+3.5}
         M ${x+1} ${y+1} H ${x+6} V ${y+6} H ${x+1} V ${y+1}
       `; // This relies on fill-rule="evenodd" to punch the hole
       
       innerPath = `M ${x+2} ${y+3.5} A 1.5 1.5 0 0 1 ${x+3.5} ${y+2} H ${x+5} V ${y+5} H ${x+3.5} A 1.5 1.5 0 0 1 ${x+2} ${y+3.5}`;

    } else { // "Square" / Sharp (Default)
       outerPath = `M ${x} ${y} H ${x + 7} V ${y + 7} H ${x} Z M ${x + 1} ${y + 1} V ${y + 6} H ${x + 6} V ${y + 1} Z`;
       innerPath = `M ${x + 2} ${y + 2} H ${x + 5} V ${y + 5} H ${x + 2} Z`;
    }

    return (
      <g key={`${x}-${y}`}>
        <path d={outerPath} fill={color} fillRule="evenodd" />
        <path d={innerPath} fill={color} />
      </g>
    );
  };

  const renderModule = (x: number, y: number, style: QRConfig['dotStyle'], color: string) => {
    // x, y are coordinates (0, 1, 2...)
    // we draw shapes of size ~1.
    
    let d = '';
    if (style === 'dots') {
      const r = 0.35; // Radius
      d = `M ${x + 0.5}, ${y + 0.5} m -${r}, 0 a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`;
    } else if (style === 'rounded') {
      const p = 0.1; // padding
      const s = 1 - 2*p;
      const r = 0.3; // border radius
      // SVG rect path logic for rounded corners
      d = `M ${x+p+r} ${y+p} h ${s-2*r} a ${r} ${r} 0 0 1 ${r} ${r} v ${s-2*r} a ${r} ${r} 0 0 1 -${r} ${r} h -${s-2*r} a ${r} ${r} 0 0 1 -${r} -${r} v -${s-2*r} a ${r} ${r} 0 0 1 ${r} -${r} z`;
    } else {
      // Square (Default)
      // Slight rounding (0.02) avoids anti-aliasing artifacts between blocks
      d = `M ${x} ${y} h 1.02 v 1.02 h -1.02 z`; 
    }

    return <path d={d} fill={color} key={`${x}-${y}`} />;
  };

  // --- Download Logic ---

  const downloadPng = () => {
    const svg = document.getElementById("custom-qr-svg");
    if (!svg) return;

    const baseSize = 1000; // High res
    const canvas = document.createElement("canvas");
    canvas.width = baseSize;
    canvas.height = baseSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = config.bgColor || '#ffffff';
    ctx.fillRect(0, 0, baseSize, baseSize);

    // SVG to Image
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
    const svgUrl = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
        // Draw QR
        ctx.drawImage(img, 0, 0, baseSize, baseSize);
        URL.revokeObjectURL(svgUrl);

        // Draw Logo (Manually on top to ensure it works)
        if (config.logoUrl) {
            const logoImg = new Image();
            logoImg.crossOrigin = "Anonymous";
            logoImg.src = config.logoUrl;
            logoImg.onload = () => {
                // Calculate logo size relative to canvas
                // Logo padding in config is approx percentage/size of total viewbox (25-35 typical)
                // ViewBox matches count (e.g., 29). Canvas is 1000.
                const ratio = baseSize / qrData.count;
                // Logo is roughly logoPadding % of the QR? 
                // In the SVG below, logo size is `config.logoPadding / 5` roughly in modules
                // Let's match the visual size from SVG:
                // Visual Logo Size in Modules = (count * 0.22) roughly
                // Let's use the config.logoPadding as a scale factor. 
                // In SVG render below, we hide center modules.
                
                // Better approach: Replicate the math used in SVG rendering
                // The SVG viewbox is `0 0 count count`.
                // Logo is centered.
                const logoSizeRatio = (config.logoPadding / 150); // Normalized heuristic
                const logoPixelSize = baseSize * logoSizeRatio;
                const logoX = (baseSize - logoPixelSize) / 2;
                const logoY = (baseSize - logoPixelSize) / 2;

                ctx.drawImage(logoImg, logoX, logoY, logoPixelSize, logoPixelSize);
                triggerDownload();
            };
            logoImg.onerror = () => triggerDownload();
        } else {
            triggerDownload();
        }
    };
    img.src = svgUrl;

    function triggerDownload() {
        const link = document.createElement("a");
        link.download = `${config.title || 'qrcode'}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    }
  };
  
  const downloadSvg = () => {
    const svg = document.getElementById("custom-qr-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
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

  // Logic to hide modules behind logo
  const logoModuleSize = Math.floor(qrData.count * (config.logoPadding / 250)); // Approximate size in modules
  const center = qrData.count / 2;
  const logoStart = center - logoModuleSize / 2;
  const logoEnd = center + logoModuleSize / 2;

  const isBehindLogo = (r: number, c: number) => {
      if (!config.logoUrl) return false;
      return r >= logoStart && r < logoEnd && c >= logoStart && c < logoEnd;
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
                   <div className="relative">
                       <svg 
                            id="custom-qr-svg"
                            viewBox={`0 0 ${qrData.count} ${qrData.count}`} 
                            style={{ width: '220px', height: 'auto', backgroundColor: config.bgColor, borderRadius: config.dotStyle === 'dots' ? '0' : '0' }}
                       >
                            <rect width="100%" height="100%" fill={config.bgColor} />
                            
                            {/* 1. Render Eyes (TopLeft, TopRight, BottomLeft) */}
                            {renderEye(0, 0, 7, config.eyeStyle, config.eyeColor)}
                            {renderEye(qrData.count - 7, 0, 7, config.eyeStyle, config.eyeColor)}
                            {renderEye(0, qrData.count - 7, 7, config.eyeStyle, config.eyeColor)}

                            {/* 2. Render Data Modules */}
                            {qrData.modules.map((row, r) => 
                                row.map((isDark, c) => {
                                    if (!isDark) return null;
                                    if (isEyeZone(r, c, qrData.count)) return null; // Handled by renderEye
                                    if (isBehindLogo(r, c)) return null; // Don't draw behind logo
                                    return renderModule(c, r, config.dotStyle, config.fgColor);
                                })
                            )}
                       </svg>

                       {/* 3. HTML Logo Overlay (for preview visual only, download handles it separately) */}
                       {config.logoUrl && (
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                               <img 
                                   src={config.logoUrl} 
                                   alt="Logo" 
                                   style={{ 
                                       width: `${(config.logoPadding / 150) * 220}px`, 
                                       height: `${(config.logoPadding / 150) * 220}px`,
                                       objectFit: 'contain'
                                    }} 
                               />
                           </div>
                       )}
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