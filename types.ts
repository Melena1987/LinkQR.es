export interface QRConfig {
  destinationUrl: string;
  shortUrlId: string;
  title: string;
  qrType: 'static' | 'dynamic';
  
  // Appearance
  fgColor: string;
  bgColor: string;
  eyeColor: string; // The corner squares
  
  // Style
  dotStyle: 'square' | 'rounded' | 'dots';
  eyeStyle: 'square' | 'rounded' | 'leaf';
  
  // Logo
  logoUrl?: string;
  logoPadding: number;
  
  // Frame
  showFrame: boolean;
  frameStyle: 'none' | 'simple' | 'balloon' | 'badge' | 'black-tie';
  frameText: string;
  frameColor: string;
}

export type TabType = 'content' | 'design' | 'templates';

export interface PresetTemplate {
  id: string;
  name: string;
  thumbnail: string;
  config: Partial<QRConfig>;
}