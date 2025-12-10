
import qrcode from 'qrcode-generator';
import { QRConfig } from '../types';
import { DOMAIN } from '../constants';

// --- Types ---
export interface QRData {
  modules: boolean[][];
  count: number;
}

export interface LogoMetrics {
  sizeModules: number;
  startModule: number;
  endModule: number;
  pixelSizeRatio: number; // Size relative to total QR size (0-1)
}

// --- Logic ---

export const generateQRData = (config: QRConfig): QRData => {
  const qrValue = config.qrType === 'dynamic' 
    ? `https://${DOMAIN}/${config.shortUrlId}` 
    : config.destinationUrl || 'https://linkqr.es';

  try {
    // Type 0 = Auto, Level H = High (30%) Error Correction (best for logos)
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
    console.error("QR Generation Error", e);
    return { modules: [], count: 0 };
  }
};

export const getLogoMetrics = (config: QRConfig, count: number): LogoMetrics | null => {
  if (!config.logoUrl) return null;

  // Map slider (20-80) to a percentage of the QR size.
  // Previous code used a factor roughly around 15-30% of size.
  // Let's assume slider 50 means 25% of QR width.
  const percentage = config.logoPadding / 200; 
  
  const sizeModulesRaw = count * percentage;
  // Make sure it's an odd number to center nicely if count is odd (usually is)
  let sizeModules = Math.floor(sizeModulesRaw);
  if (sizeModules % 2 !== count % 2) sizeModules++;

  // Center
  const center = Math.floor(count / 2);
  const halfSize = Math.floor(sizeModules / 2);
  const startModule = center - halfSize;
  const endModule = startModule + sizeModules;

  return {
    sizeModules,
    startModule,
    endModule,
    pixelSizeRatio: sizeModules / count
  };
};

export const isEyeZone = (r: number, c: number, count: number) => {
  // Eyes are always 7x7
  // Top Left
  if (r < 7 && c < 7) return true;
  // Top Right
  if (r < 7 && c >= count - 7) return true;
  // Bottom Left
  if (r >= count - 7 && c < 7) return true;
  return false;
};

// --- Path Generation ---

export const generateEyePath = (x: number, y: number, style: QRConfig['eyeStyle']) => {
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
     outerPath = `
       M ${x} ${y+3.5} A 3.5 3.5 0 0 1 ${x+3.5} ${y} H ${x+7} V ${y+7} H ${x+3.5} A 3.5 3.5 0 0 1 ${x} ${y+3.5}
       M ${x+1} ${y+1} H ${x+6} V ${y+6} H ${x+1} V ${y+1}
     `; 
     innerPath = `M ${x+2} ${y+3.5} A 1.5 1.5 0 0 1 ${x+3.5} ${y+2} H ${x+5} V ${y+5} H ${x+3.5} A 1.5 1.5 0 0 1 ${x+2} ${y+3.5}`;

  } else { // Square
     outerPath = `M ${x} ${y} H ${x + 7} V ${y + 7} H ${x} Z M ${x + 1} ${y + 1} V ${y + 6} H ${x + 6} V ${y + 1} Z`;
     innerPath = `M ${x + 2} ${y + 2} H ${x + 5} V ${y + 5} H ${x + 2} Z`;
  }

  return { outerPath, innerPath };
};

export const generateModulePath = (x: number, y: number, style: QRConfig['dotStyle']): string => {
  if (style === 'dots') {
    const r = 0.35;
    return `M ${x + 0.5}, ${y + 0.5} m -${r}, 0 a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`;
  } else if (style === 'rounded') {
    const p = 0.1;
    const s = 1 - 2*p;
    const r = 0.3;
    return `M ${x+p+r} ${y+p} h ${s-2*r} a ${r} ${r} 0 0 1 ${r} ${r} v ${s-2*r} a ${r} ${r} 0 0 1 -${r} ${r} h -${s-2*r} a ${r} ${r} 0 0 1 -${r} -${r} v -${s-2*r} a ${r} ${r} 0 0 1 ${r} -${r} z`;
  } else {
    // Square with slight overlap to prevent gaps
    return `M ${x} ${y} h 1.05 v 1.05 h -1.05 z`;
  }
};

// --- Download Logic ---

export const downloadQR = async (config: QRConfig) => {
  try {
    const { modules, count } = generateQRData(config);
    const logoMetrics = getLogoMetrics(config, count);
    
    const baseSize = 2000; // High resolution
    const scale = baseSize / count;
    
    const canvas = document.createElement("canvas");
    canvas.width = baseSize;
    canvas.height = baseSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Draw Background
    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, baseSize, baseSize);

    // 2. Prepare Paths
    ctx.scale(scale, scale); // Scale all drawing operations

    // Eyes
    const eyePaths = [
      generateEyePath(0, 0, config.eyeStyle),
      generateEyePath(count - 7, 0, config.eyeStyle),
      generateEyePath(0, count - 7, config.eyeStyle)
    ];

    ctx.fillStyle = config.eyeColor;
    eyePaths.forEach(({ outerPath, innerPath }) => {
      const p = new Path2D(outerPath + innerPath);
      ctx.fill(p, "evenodd"); // evenodd needed for cutouts in eyes
    });

    // Modules
    ctx.fillStyle = config.fgColor;
    // Iterate modules
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (modules[r][c]) {
          // Skip if Eye Zone
          if (isEyeZone(r, c, count)) continue;
          
          // Skip if Logo Zone
          if (logoMetrics && 
              r >= logoMetrics.startModule && r < logoMetrics.endModule && 
              c >= logoMetrics.startModule && c < logoMetrics.endModule) {
            continue;
          }
          
          const pathString = generateModulePath(c, r, config.dotStyle);
          const p = new Path2D(pathString);
          ctx.fill(p);
        }
      }
    }

    // Reset Scale for Logo (easier to work in pixels)
    ctx.resetTransform();

    // 3. Draw Logo
    if (config.logoUrl && logoMetrics) {
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = config.logoUrl!;
        img.onload = () => {
          const logoPixelSize = baseSize * logoMetrics.pixelSizeRatio;
          const logoX = (baseSize - logoPixelSize) / 2;
          const logoY = (baseSize - logoPixelSize) / 2;
          
          // Optional: Add white background behind logo for better contrast
          // ctx.fillStyle = config.bgColor;
          // ctx.fillRect(logoX, logoY, logoPixelSize, logoPixelSize);
          
          ctx.drawImage(img, logoX, logoY, logoPixelSize, logoPixelSize);
          resolve();
        };
        img.onerror = (e) => {
          console.error("Failed to load logo for download", e);
          resolve(); // Resolve anyway to download without logo
        };
      });
    }

    // 4. Trigger Download
    const link = document.createElement("a");
    link.download = `${config.title || 'linkqr'}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

  } catch (error) {
    console.error("Error downloading QR:", error);
    alert("Hubo un error al generar la descarga.");
  }
};
