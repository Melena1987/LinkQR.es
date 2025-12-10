import qrcode from 'qrcode-generator';
import { QRConfig } from '../types';
import { DOMAIN } from '../constants';

interface QRMatrix {
  modules: boolean[][];
  count: number;
}

// Factor to scale the logo size relative to the QR size. 
// Matches the slider values (20-80) to a reasonable percentage of the QR code.
// Using 150 divider: 45 / 150 = 0.3 (30% coverage)
const LOGO_SIZE_DIVIDER = 150;

export const generateQRMatrix = (config: QRConfig): QRMatrix => {
  const qrValue = config.qrType === 'dynamic' 
    ? `https://${DOMAIN}/${config.shortUrlId}` 
    : config.destinationUrl || 'https://linkqr.es';

  try {
    const qr = qrcode(0, 'H'); // High error correction
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
};

export const isEyeZone = (r: number, c: number, count: number): boolean => {
  if (r < 7 && c < 7) return true; // Top Left
  if (r < 7 && c >= count - 7) return true; // Top Right
  if (r >= count - 7 && c < 7) return true; // Bottom Left
  return false;
};

// Helper to determine if a module is behind the logo
export const isBehindLogo = (r: number, c: number, count: number, logoPadding: number, hasLogo: boolean): boolean => {
  if (!hasLogo) return false;
  
  // Normalized heuristic matching the rendering logic
  // We use the same divider as the visual rendering to ensure the mask matches the image size
  const logoModuleSize = Math.floor(count * (logoPadding / LOGO_SIZE_DIVIDER)); 
  
  // Add a small buffer (1 module) to ensure clean clearance
  const buffer = 1;
  const sizeWithBuffer = logoModuleSize + (buffer * 2);

  const center = count / 2;
  const start = Math.floor(center - sizeWithBuffer / 2);
  const end = Math.floor(center + sizeWithBuffer / 2);
  
  return r >= start && r < end && c >= start && c < end;
};

export const getEyePaths = (x: number, y: number, style: QRConfig['eyeStyle']) => {
  let outerPath = "";
  let innerPath = "";

  if (style === 'rounded') {
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

  } else if (style === 'leaf') {
     // Leaf: Top-Left rounded, Bottom-Right rounded
     outerPath = `
       M ${x} ${y+3.5} A 3.5 3.5 0 0 1 ${x+3.5} ${y} H ${x+7} V ${y+7} H ${x+3.5} A 3.5 3.5 0 0 1 ${x} ${y+3.5}
       M ${x+1} ${y+1} H ${x+6} V ${y+6} H ${x+1} V ${y+1}
     `; // Uses evenodd fill rule
     innerPath = `M ${x+2} ${y+3.5} A 1.5 1.5 0 0 1 ${x+3.5} ${y+2} H ${x+5} V ${y+5} H ${x+3.5} A 1.5 1.5 0 0 1 ${x+2} ${y+3.5}`;

  } else { // Square
     outerPath = `M ${x} ${y} H ${x + 7} V ${y + 7} H ${x} Z M ${x + 1} ${y + 1} V ${y + 6} H ${x + 6} V ${y + 1} Z`;
     innerPath = `M ${x + 2} ${y + 2} H ${x + 5} V ${y + 5} H ${x + 2} Z`;
  }

  return { outerPath, innerPath };
};

export const getModulePath = (x: number, y: number, style: QRConfig['dotStyle']): string => {
  if (style === 'dots') {
    const r = 0.35;
    return `M ${x + 0.5}, ${y + 0.5} m -${r}, 0 a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`;
  } else if (style === 'rounded') {
    const p = 0.1;
    const s = 1 - 2*p;
    const r = 0.3;
    return `M ${x+p+r} ${y+p} h ${s-2*r} a ${r} ${r} 0 0 1 ${r} ${r} v ${s-2*r} a ${r} ${r} 0 0 1 -${r} ${r} h -${s-2*r} a ${r} ${r} 0 0 1 -${r} -${r} v -${s-2*r} a ${r} ${r} 0 0 1 ${r} -${r} z`;
  } else {
    // Square with tiny overlap to prevent gaps
    return `M ${x} ${y} h 1.02 v 1.02 h -1.02 z`; 
  }
};

/**
 * Generates a full SVG string for download purposes
 */
export const generateSVGString = (config: QRConfig): string => {
  const { modules, count } = generateQRMatrix(config);
  
  // Build Paths
  let eyeOuterPaths = "";
  let eyeInnerPaths = "";
  let modulePaths = "";

  // 1. Eyes
  const addEye = (x: number, y: number) => {
      const { outerPath, innerPath } = getEyePaths(x, y, config.eyeStyle);
      eyeOuterPaths += ` ${outerPath}`;
      eyeInnerPaths += ` ${innerPath}`;
  };
  addEye(0, 0);
  addEye(count - 7, 0);
  addEye(0, count - 7);

  // 2. Modules
  modules.forEach((row, r) => {
    row.forEach((isDark, c) => {
      if (!isDark) return;
      if (isEyeZone(r, c, count)) return;
      if (isBehindLogo(r, c, count, config.logoPadding, !!config.logoUrl)) return;
      modulePaths += ` ${getModulePath(c, r, config.dotStyle)}`;
    });
  });

  const logoSize = (config.logoPadding / LOGO_SIZE_DIVIDER) * count;
  const logoPos = (count - logoSize) / 2;

  // Ensure the image has x/y attributes properly set
  const logoElement = config.logoUrl 
    ? `<image href="${config.logoUrl}" x="${logoPos}" y="${logoPos}" height="${logoSize}" width="${logoSize}" />`
    : '';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${count} ${count}" width="1000" height="1000">
      <rect width="100%" height="100%" fill="${config.bgColor}" />
      <path d="${eyeOuterPaths}" fill="${config.eyeColor}" fill-rule="evenodd" />
      <path d="${eyeInnerPaths}" fill="${config.eyeColor}" />
      <path d="${modulePaths}" fill="${config.fgColor}" />
      ${logoElement}
    </svg>
  `;
};

// Helper to fetch image and convert to base64
// This is critical for PNG downloads to work with external URLs (CORS)
const getBase64Image = async (url: string): Promise<string> => {
    if (url.startsWith('data:')) return url;
    
    try {
      const response = await fetch(url, { mode: 'cors' });
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Failed to convert image to base64', error);
      return url; // Fallback to original URL
    }
};

export const downloadQrCode = async (config: QRConfig, format: 'png' | 'svg', filename: string) => {
    // Clone config to avoid mutation of the original state object
    const configForDownload = { ...config };

    // If there is a logo URL and it's not data:, convert it to base64
    // This ensures that when we put it into the SVG and then draw that SVG to a canvas,
    // the browser doesn't block the external image resource.
    if (configForDownload.logoUrl && !configForDownload.logoUrl.startsWith('data:')) {
        try {
            configForDownload.logoUrl = await getBase64Image(configForDownload.logoUrl);
        } catch (e) {
            console.error("Could not process logo for download", e);
        }
    }

    const svgString = generateSVGString(configForDownload);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    if (format === 'svg') {
        const link = document.createElement("a");
        link.download = `${filename}.svg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    } else {
        // PNG Download
        const baseSize = 2000; // High resolution for print
        const canvas = document.createElement("canvas");
        canvas.width = baseSize;
        canvas.height = baseSize;
        const ctx = canvas.getContext("2d");
        
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, baseSize, baseSize);
            URL.revokeObjectURL(url);
            
            const link = document.createElement("a");
            link.download = `${filename}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        };
        img.onerror = (e) => {
            console.error("Error drawing SVG to canvas", e);
            // Fallback: try to download just the SVG blob URL if PNG fails (rare)
            URL.revokeObjectURL(url);
        }
        img.src = url;
    }
};