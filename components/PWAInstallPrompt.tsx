
import React, { useState, useEffect } from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { Download, Share, PlusSquare, X } from 'lucide-react';

const motion = framerMotion as any;

const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const LOGO_URL = "https://i.postimg.cc/brDgBVTJ/Logo-Panucci.png";

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

    if (isStandalone) {
      return; 
    }

    if (isIosDevice) {
      setIsIOS(true);
      const hasDismissed = localStorage.getItem('pwa_dismissed');
      if (!hasDismissed) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    } else {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        const hasDismissed = localStorage.getItem('pwa_dismissed');
        if (!hasDismissed) {
          setShowPrompt(true);
        }
      });
    }
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
      });
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6 flex justify-center pointer-events-none"
        >
          <div className="bg-[#111] border border-[#00B8D4]/30 backdrop-blur-xl shadow-2xl rounded-2xl p-5 w-full max-w-md pointer-events-auto relative">
            <button 
              onClick={handleDismiss}
              className="absolute top-2 right-2 text-gray-500 hover:text-white p-2"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shrink-0 shadow-lg p-1 border border-[#333]">
                <img src={LOGO_URL} alt="Aquarismo Panucci" className="w-full h-full object-contain" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-1 font-heading">Instalar App</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  Tenha acesso rápido ao catálogo de espécies direto da sua tela inicial.
                </p>

                {isIOS ? (
                  <div className="bg-[#0a0a0a] rounded-lg p-3 text-xs text-gray-400 space-y-2 border border-[#00B8D4]/10">
                    <div className="flex items-center gap-2">
                      <Share className="w-4 h-4 text-[#00B8D4]" />
                      <span>1. Toque no botão <strong>Compartilhar</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PlusSquare className="w-4 h-4 text-[#00B8D4]" />
                      <span>2. Selecione <strong>Adicionar à Tela de Início</strong></span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleInstallClick}
                    className="w-full bg-[#00B8D4] hover:bg-white text-black py-3 rounded-lg font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#00B8D4]/20"
                  >
                    <Download className="w-4 h-4" />
                    Instalar Agora
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
