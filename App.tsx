import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Preview } from './components/Preview';
import { UrlConfig } from './components/editor/UrlConfig';
import { AppearanceConfig } from './components/editor/AppearanceConfig';
import { Tabs } from './components/ui/Tabs';
import { Dashboard } from './components/dashboard/Dashboard';
import { Profile } from './components/profile/Profile';
import { QRConfig, TabType } from './types';
import { INITIAL_CONFIG, PRESETS } from './constants';
import { Wand2, Loader2, QrCode, AlertCircle } from 'lucide-react';
import { Auth } from './components/auth/Auth';
import { auth, db, storage } from './firebase';
import firebase from 'firebase/app';

type ViewType = 'editor' | 'dashboard' | 'profile';

function App() {
  // Estado de Enrutamiento / Redirección
  const [resolvingLink, setResolvingLink] = useState(() => {
    let path = window.location.pathname;
    
    // Normalizar path: eliminar slash final si existe y no es la raíz
    if (path.length > 1 && path.endsWith('/')) {
        path = path.slice(0, -1);
    }

    // Ignorar rutas propias de la app para evitar buscar "dashboard" como un QR
    const isAppRoute = ['/dashboard', '/profile', '/login'].includes(path);
    
    // Activar resolución si hay un path, no es root, no es index.html y no es una ruta interna
    return path.length > 1 && path !== '/index.html' && path !== '/' && !isAppRoute;
  });
  const [linkError, setLinkError] = useState<string | null>(null);

  // Estado de la App
  const [user, setUser] = useState<firebase.User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPro, setIsPro] = useState(false);

  // Estado de Navegación
  const [currentView, setCurrentView] = useState<ViewType>('editor');

  // Estado del Editor
  const [activeTab, setActiveTab] = useState<TabType>('content');
  const [config, setConfig] = useState<QRConfig>(INITIAL_CONFIG);
  const [editingQrId, setEditingQrId] = useState<string | null>(null);

  // Lógica: Manejar Redirección de Enlaces Dinámicos
  useEffect(() => {
    if (resolvingLink) {
        // Quitar el '/' inicial y eliminar cualquier barra final (trailing slash) para evitar errores de búsqueda
        const rawPath = window.location.pathname;
        const slug = rawPath.substring(1).replace(/\/$/, ''); 
        
        const resolveUrl = async () => {
            try {
                const snapshot = await db.collection('qrs').where('shortUrlId', '==', slug).get();
                
                if (!snapshot.empty) {
                    const data = snapshot.docs[0].data();
                    let url = data.destinationUrl;
                    // Asegurar protocolo
                    if (!/^https?:\/\//i.test(url)) {
                        url = 'https://' + url;
                    }
                    // Realizar la redirección
                    window.location.replace(url);
                } else {
                    setLinkError('Enlace no encontrado');
                    setResolvingLink(false);
                }
            } catch (error) {
                console.error("Error resolviendo enlace:", error);
                setLinkError('Error al procesar el enlace');
                setResolvingLink(false);
            }
        };
        resolveUrl();
    }
  }, [resolvingLink]);

  // Monitor de Autenticación
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
            const userDoc = await db.collection('user').doc(currentUser.uid).get();
            
            if (userDoc.exists) {
                const data = userDoc.data();
                const role = data?.role?.toString().trim().toUpperCase();
                setIsPro(role === 'PRO');
            } else {
                setIsPro(false);
            }
        } catch (error) {
            console.error("Error verificando estatus PRO:", error);
            setIsPro(false);
        }
      } else {
        setIsPro(false);
      }

      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const updateConfig = (key: keyof QRConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const applyTemplate = (presetConfig: Partial<QRConfig>) => {
    setConfig((prev) => ({ ...prev, ...presetConfig }));
  };

  const handleEditQR = (id: string, qrConfig: QRConfig) => {
    setEditingQrId(id);
    setConfig(qrConfig);
    setCurrentView('editor');
    setActiveTab('content'); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateNew = () => {
    setEditingQrId(null);
    setConfig(INITIAL_CONFIG);
    setCurrentView('editor');
    setActiveTab('content');
  };

  const handleSave = async () => {
    if (!user) return;
    
    if (config.qrType === 'dynamic' && !config.shortUrlId.trim()) {
      alert("Por favor, ingresa un ID válido para el enlace corto.");
      return;
    }

    setIsSaving(true);

    try {
      let finalLogoUrl = config.logoUrl;

      if (config.logoUrl && config.logoUrl.startsWith('data:')) {
        const storageRef = storage.ref(`${user.uid}/${Date.now()}_logo`);
        await storageRef.putString(config.logoUrl, 'data_url');
        finalLogoUrl = await storageRef.getDownloadURL();
      }

      const qrData = {
        ...config,
        logoUrl: finalLogoUrl || null,
        userId: user.uid,
        updatedAt: firebase.firestore.Timestamp.now(),
      };

      if (editingQrId) {
        await db.collection('qrs').doc(editingQrId).update(qrData);
        alert('¡QR actualizado exitosamente!');
      } else {
        const newQrData = {
            ...qrData,
            createdAt: firebase.firestore.Timestamp.now(),
        };
        await db.collection('qrs').add(newQrData);
        alert('¡QR creado exitosamente!');
        
        if (confirm("¿Quieres ver tus QRs?")) {
            setCurrentView('dashboard');
        }
      }
      
    } catch (error) {
      console.error("Error saving QR:", error);
      alert("Error al guardar el QR. Por favor intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderEditorContent = () => {
    switch (activeTab) {
      case 'content':
        return <UrlConfig config={config} updateConfig={updateConfig} />;
      case 'design':
        return <AppearanceConfig config={config} updateConfig={updateConfig} />;
      case 'templates':
        return (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {PRESETS.map(preset => (
                <button 
                  key={preset.id}
                  onClick={() => applyTemplate(preset.config)}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all bg-white text-left group"
                >
                  <div className="w-16 h-16 mb-3 rounded-lg overflow-hidden border border-gray-100 group-hover:scale-105 transition-transform">
                     <img src={preset.thumbnail} alt={preset.name} className="w-full h-full object-contain p-2" />
                  </div>
                  <span className="font-medium text-sm text-gray-800">{preset.name}</span>
                </button>
             ))}
          </div>
        );
      default:
        return null;
    }
  };

  // 1. Vista de Redirección (Pantalla de carga)
  if (resolvingLink) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <div className="flex items-center gap-2 mb-4 animate-pulse">
            <div className="bg-blue-600 p-2 rounded-xl">
                <QrCode className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
                LinkQR<span className="text-blue-600">.es</span>
            </span>
            </div>
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="mt-4 text-gray-500 font-medium">Redirigiendo a tu destino...</p>
        </div>
    );
  }

  // 2. Vista de Enlace No Encontrado (404 Personalizado)
  if (linkError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                  <AlertCircle className="w-8 h-8" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Enlace no encontrado</h1>
              <p className="text-gray-500 mb-6 text-sm">
                  El código QR que has escaneado no existe o ha sido eliminado por su creador.
              </p>
              <button 
                  onClick={() => {
                      setLinkError(null);
                      // Limpiar la URL sin recargar
                      window.history.pushState({}, '', '/');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
              >
                  Crear mi propio QR Gratis
              </button>
          </div>
           <div className="mt-8 flex items-center gap-2 opacity-40 grayscale">
              <div className="bg-gray-400 p-1 rounded-md">
                  <QrCode className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-400 tracking-tight">
                  LinkQR<span className="text-gray-500">.es</span>
              </span>
            </div>
      </div>
    );
  }

  // 3. Carga de Autenticación (Solo si no estamos redirigiendo)
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  // 4. Vista para No Autenticados
  if (!user) {
    return <Auth />;
  }

  // 5. App Principal (Autenticados)
  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        user={user} 
        isPro={isPro} 
        onNavigate={setCurrentView} 
        currentView={currentView}
      />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {currentView === 'dashboard' && (
             <Dashboard 
                user={user} 
                onEdit={handleEditQR} 
                onCreateNew={handleCreateNew}
             />
        )}

        {currentView === 'profile' && (
             <Profile user={user} isPro={isPro} />
        )}

        {currentView === 'editor' && (
            <>
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {editingQrId ? 'Editar QR' : 'Crear nuevo QR'}
                        </h1>
                        <p className="text-gray-500 mt-1">Diseña y personaliza tu código QR.</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                
                {/* Columna Izquierda: Editor */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <Tabs current={activeTab} onChange={setActiveTab} />
                        </div>
                        <div className="p-6 lg:p-8 flex-1">
                        {renderEditorContent()}
                        </div>
                        
                        {/* Footer de Acciones */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center sticky bottom-0 z-20">
                        <button 
                            onClick={handleCreateNew}
                            disabled={isSaving}
                            className="text-sm text-gray-500 hover:text-gray-800 font-medium px-4 py-2 disabled:opacity-50"
                        >
                            Limpiar / Nuevo
                        </button>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setCurrentView('dashboard')}
                                disabled={isSaving}
                                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                {isSaving ? 'Guardando...' : (editingQrId ? 'Actualizar' : 'Guardar')}
                            </button>
                        </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Vista Previa */}
                <div className="w-full lg:w-[420px] flex-shrink-0">
                    <Preview config={config} />
                </div>

                </div>
            </>
        )}
      </main>
    </div>
  );
}

export default App;