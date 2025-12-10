import React, { useMemo } from 'react';
import { QRConfig } from '../../types';
import { generateQRMatrix, getEyePaths, getModulePath, isBehindLogo, isEyeZone } from '../../utils/qr';

interface QRCodeSVGProps {
  config: QRConfig;
  className?: string;
  id?: string;
}

export const QRCodeSVG: React.FC<QRCodeSVGProps> = ({ config, className, id }) => {
  const { modules, count } = useMemo(() => generateQRMatrix(config), [config]);

  // Render Helpers
  const renderEye = (x: number, y: number) => {
    const { outerPath, innerPath } = getEyePaths(x, y, config.eyeStyle);
    return (
      <g key={`eye-${x}-${y}`}>
        <path d={outerPath} fill={config.eyeColor} fillRule="evenodd" />
        <path d={innerPath} fill={config.eyeColor} />
      </g>
    );
  };

  const renderModules = () => {
    return modules.map((row, r) => 
      row.map((isDark, c) => {
        if (!isDark) return null;
        if (isEyeZone(r, c, count)) return null;
        if (isBehindLogo(r, c, count, config.logoPadding, !!config.logoUrl)) return null;
        
        return (
          <path 
            key={`mod-${r}-${c}`}
            d={getModulePath(c, r, config.dotStyle)} 
            fill={config.fgColor} 
          />
        );
      })
    );
  };

  // Must match LOGO_SIZE_DIVIDER in utils/qr.ts
  const LOGO_DIVIDER = 150; 
  const logoSize = (config.logoPadding / LOGO_DIVIDER) * count;
  const logoPos = (count - logoSize) / 2;

  return (
    <svg 
      id={id}
      viewBox={`0 0 ${count} ${count}`} 
      className={className}
      style={{ backgroundColor: config.bgColor, width: '100%', height: 'auto', display: 'block' }}
    >
      <rect width="100%" height="100%" fill={config.bgColor} />
      
      {/* Eyes */}
      {renderEye(0, 0)}
      {renderEye(count - 7, 0)}
      {renderEye(0, count - 7)}

      {/* Modules */}
      {renderModules()}

      {/* Logo */}
      {config.logoUrl && (
         <image 
            href={config.logoUrl} 
            x={logoPos}
            y={logoPos}
            width={logoSize}
            height={logoSize}
         />
      )}
    </svg>
  );
};