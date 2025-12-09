import React, { useState, useRef, useEffect } from 'react';
import { QrCode, User, HelpCircle, LogOut, ChevronDown, LayoutDashboard, Sparkles } from 'lucide-react';
import { signOut, User as FirebaseUser } from "firebase/auth";
import { auth } from '../firebase';
import { clsx } from 'clsx';

interface HeaderProps {
  user?: FirebaseUser | null;
  isPro?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ user, isPro = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    signOut(auth);
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            LinkQR<span className="text-blue-600">.es</span>
          </span>
          {isPro ? (
            <span className="ml-2 px-2.5 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm border border-blue-400/20 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> PRO
            </span>
          ) : (
             <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded uppercase">
                Beta
             </span>
          )}
        </div>

        <nav className="flex items-center gap-6">
          <button className="hidden sm:flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Ayuda</span>
          </button>
          
          <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
          
          <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors group outline-none"
            >
                {/* Avatar with PRO ring */}
                <div className={clsx(
                    "w-9 h-9 rounded-full flex items-center justify-center overflow-hidden transition-all",
                    isPro 
                      ? "p-[2px] bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 shadow-md" 
                      : "bg-gray-100 border border-gray-200"
                )}>
                   <div className="w-full h-full bg-white rounded-full overflow-hidden flex items-center justify-center">
                       {user?.photoURL ? (
                           <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                       ) : (
                           <User className={clsx("w-5 h-5", isPro ? "text-indigo-600" : "text-gray-500 group-hover:text-blue-500")} />
                       )}
                   </div>
                </div>

                <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium leading-none flex items-center gap-1">
                        {user?.displayName || 'Usuario'}
                        {isPro && <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />}
                    </span>
                    <span className={clsx(
                        "text-[10px] leading-none mt-1 font-semibold",
                        isPro ? "text-indigo-600" : "text-gray-400"
                    )}>
                        {isPro ? 'Plan PRO' : 'Plan Gratis'}
                    </span>
                </div>
                <ChevronDown className={clsx("w-4 h-4 text-gray-400 transition-transform duration-200", isMenuOpen && "rotate-180")} />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                    <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.displayName || 'Usuario'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    {isPro && (
                        <div className="mx-2 mt-2 mb-1 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100/50">
                            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Membresía PRO
                            </p>
                            <p className="text-[10px] text-blue-600/80">Acceso total desbloqueado</p>
                        </div>
                    )}
                    
                    <a href="#" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                        <LayoutDashboard className="w-4 h-4" />
                        Mis QRs
                    </a>
                    <a href="#" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                        <User className="w-4 h-4" />
                        Perfil
                    </a>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                    </button>
                </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};