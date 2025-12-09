import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Preview } from './components/Preview';
import { UrlConfig } from './components/editor/UrlConfig';
import { AppearanceConfig } from './components/editor/AppearanceConfig';
import { Tabs } from './components/ui/Tabs';
import { QRConfig, TabType } from './types';
import { INITIAL_CONFIG, PRESETS } from './constants';
import { Wand2, Loader2 } from 'lucide-react';
import { Auth } from './components/auth/Auth';
import { auth, db, storage } from './firebase';
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPro, setIsPro] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>('content');
  const [config, setConfig] = useState<QRConfig>(INITIAL_CONFIG);

  // Monitor Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
            // Verificamos la colección 'user' basándonos en tu captura de pantalla
            const userDocRef = doc(db, 'user', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists() && userDoc.data().role === 'PRO') {
                setIsPro(true);
            } else {
                setIsPro(false);
            }
        } catch (error) {
            console.error("Error checking PRO status:", error);
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

  const handleSave = async () => {
    if (!user) return;
    
    // Basic validation for dynamic QR
    if (config.qrType === 'dynamic' && !config.shortUrlId.trim()) {
      alert("Por favor, ingresa un ID válido para el enlace corto.");
      return;
    }

    setIsSaving(true);

    try {
      let finalLogoUrl = config.logoUrl;

      // Upload logo to Storage if it's a base64 string (newly selected file)
      // Base64 strings from FileReader start with "data:"
      if (config.logoUrl && config.logoUrl.startsWith('data:')) {
        // Create a reference: userId/timestamp_logo.png
        // Using timestamp to ensure uniqueness
        const storageRef = ref(storage, `${user.uid}/${Date.now()}_logo`);
        
        // Upload the base64 string
        await uploadString(storageRef, config.logoUrl, 'data_url');
        
        // Get the public download URL
        finalLogoUrl = await getDownloadURL(storageRef);
      }

      // Prepare data object for Firestore
      const qrData = {
        ...config,
        logoUrl: finalLogoUrl || null, // Ensure undefined becomes null for Firestore
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Add to 'qrs' collection
      // Note: Rules require resource.data.userId == request.auth.uid
      await addDoc(collection(db, 'qrs'), qrData);

      alert('¡QR guardado exitosamente!');
      
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

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} isPro={isPro} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Personalizar código QR</h1>
          <p className="text-gray-500 mt-1">Plataforma profesional de códigos QR dinámicos.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left Column: Editor */}
          <div className="flex-1 min-w-0">
             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                   <Tabs current={activeTab} onChange={setActiveTab} />
                </div>
                <div className="p-6 lg:p-8 flex-1">
                   {renderEditorContent()}
                </div>
                
                {/* Editor Footer Actions */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center sticky bottom-0 z-20">
                   <button 
                      onClick={() => setConfig(INITIAL_CONFIG)}
                      disabled={isSaving}
                      className="text-sm text-gray-500 hover:text-gray-800 font-medium px-4 py-2 disabled:opacity-50"
                   >
                     Restablecer
                   </button>
                   <div className="flex gap-3">
                      <button 
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
                        {isSaving ? 'Guardando...' : 'Guardar'}
                      </button>
                   </div>
                </div>
             </div>
          </div>

          {/* Right Column: Preview */}
          <div className="w-full lg:w-[420px] flex-shrink-0">
            <Preview config={config} />
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;