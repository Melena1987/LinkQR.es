import { QRConfig, PresetTemplate } from './types';

export const INITIAL_CONFIG: QRConfig = {
  destinationUrl: 'https://www.google.com',
  shortUrlId: 'demo-qr-123',
  title: 'Mi Primer QR',
  qrType: 'dynamic',
  fgColor: '#000000',
  bgColor: '#ffffff',
  eyeColor: '#000000',
  dotStyle: 'square',
  eyeStyle: 'square',
  logoPadding: 45, // Usado ahora como Tamaño del Logo (aprox 20% del total 220px)
  showFrame: false,
  frameStyle: 'none',
  frameText: 'ESCANÉAME',
  frameColor: '#000000',
};

export const DOMAIN = "linkqr.es";

export const PRESETS: PresetTemplate[] = [
  {
    id: 'classic',
    name: 'Clásico',
    thumbnail: 'https://cdn-icons-png.flaticon.com/512/3596/3596091.png',
    config: {
      fgColor: '#000000',
      bgColor: '#ffffff',
      dotStyle: 'square',
      eyeStyle: 'square',
      showFrame: false,
      logoUrl: undefined
    }
  },
  {
    id: 'social',
    name: 'Social Blue',
    thumbnail: 'https://cdn-icons-png.flaticon.com/512/3938/3938028.png',
    config: {
      fgColor: '#2563eb',
      bgColor: '#ffffff',
      eyeColor: '#1e40af',
      dotStyle: 'dots',
      eyeStyle: 'rounded',
      showFrame: true,
      frameStyle: 'balloon',
      frameText: 'Sígueme',
      frameColor: '#2563eb'
    }
  },
  {
    id: 'eco',
    name: 'Eco Friendly',
    thumbnail: 'https://cdn-icons-png.flaticon.com/512/1598/1598196.png',
    config: {
      fgColor: '#166534',
      bgColor: '#f0fdf4',
      eyeColor: '#14532d',
      dotStyle: 'rounded',
      eyeStyle: 'leaf',
      showFrame: true,
      frameStyle: 'simple',
      frameText: 'SCAN ME',
      frameColor: '#166534'
    }
  }
];