import React from 'react';
import { QrCode, User, HelpCircle } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            LinkQR<span className="text-blue-600">.es</span>
          </span>
          <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded uppercase">
            Pro
          </span>
        </div>

        <nav className="flex items-center gap-6">
          <button className="hidden sm:flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Ayuda</span>
          </button>
          <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
          <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
               <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium hidden sm:block">Mi Cuenta</span>
          </button>
        </nav>
      </div>
    </header>
  );
};