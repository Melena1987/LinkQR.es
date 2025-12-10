
import React, { useMemo } from 'react';
import { QRConfig } from '../../types';
import { generateQRData, getLogoMetrics, generateEyePath, generateModulePath, isEyeZone } from '../../utils/qr';

interface QRCodeSVGProps {
  config: QRConfig;
  className?: string;
  style?: React.CSSProperties;
}

export const QRCodeSVG: React.FC<QRCodeSVGProps> = ({ config, className, style }) => {
  const { modules, count } = useMemo(() => generateQRData(config), [config]);
  const logoMetrics = useMemo(() => getLogoMetrics(config, count), [config, count]);

  // Generate Path Strings
  const eyePaths = useMemo(() => {
    return [
      generateEyePath(0, 0, config.eyeStyle),
      generateEyePath(count - 7, 0, config.eyeStyle),
      generateEyePath(0, count - 7, config.eyeStyle)
    ];
  }, [count, config.eyeStyle]);

  const modulePath = useMemo(() => {
    let d = "";
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (modules[r][c]) {
          if (isEyeZone(r, c, count)) continue;
          
          // Cutout for Logo
          if (logoMetrics && 
              r >= logoMetrics.startModule && r < logoMetrics.endModule && 
              c >= logoMetrics.startModule && c < logoMetrics.endModule) {
            continue;
          }
          
          d += generateModulePath(c, r, config.dotStyle) + " ";
        }
      }
    }
    return d;
  }, [modules, count, config.dotStyle, logoMetrics]);

  return (
    <svg 
      viewBox={`0 0 ${count} ${count}`} 
      className={className}
      style={{ 
        backgroundColor: config.bgColor,
        ...style 
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100%" height="100%" fill={config.bgColor} />
      
      {/* Eyes */}
      {eyePaths.map((eye, i) => (
        <g key={i}>
          <path d={eye.outerPath} fill={config.eyeColor} fillRule="evenodd" />
          <path d={eye.innerPath} fill={config.eyeColor} />
        </g>
      ))}

      {/* Modules */}
      <path d={modulePath} fill={config.fgColor} />

      {/* Logo Image Embedded in SVG */}
      {config.logoUrl && logoMetrics && (
         <image 
            href={config.logoUrl}
            x={logoMetrics.startModule}
            y={logoMetrics.startModule}
            width={logoMetrics.sizeModules}
            height={logoMetrics.sizeModules}
            preserveAspectRatio="xMidYMid meet"
         />
      )}
    </svg>
  );
};
