import React, { useState } from 'react';
import { Header } from './components/Header';
import { Preview } from './components/Preview';
import { UrlConfig } from './components/editor/UrlConfig';
import { AppearanceConfig } from './components/editor/AppearanceConfig';
import { Tabs } from './components/ui/Tabs';
import { QRConfig, TabType } from './types';
import { INITIAL_CONFIG, PRESETS } from './constants';
import { Wand2 } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('content');
  const [config, setConfig] = useState<QRConfig>(INITIAL_CONFIG);

  const updateConfig = (key: keyof QRConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const applyTemplate = (presetConfig: Partial<QRConfig>) => {
    setConfig((prev) => ({ ...prev, ...presetConfig }));
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
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
                      className="text-sm text-gray-500 hover:text-gray-800 font-medium px-4 py-2"
                   >
                     Restablecer
                   </button>
                   <div className="flex gap-3">
                      <button className="px-6 py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors">
                        Cancelar
                      </button>
                      <button className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-colors flex items-center gap-2">
                        <Wand2 className="w-4 h-4" />
                        Guardar
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