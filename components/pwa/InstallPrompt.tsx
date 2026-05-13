'use client';

import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
      return;
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Handle Android/Chrome install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a delay to be non-intrusive
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show guide after delay
    if (isIOSDevice) {
      setTimeout(() => setShowPrompt(true), 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[2000] animate-in fade-in slide-in-from-bottom-10 duration-500">
      <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden">
        {/* Progress bar subtle effect */}
        <div className="absolute top-0 left-0 h-1 bg-[#007AFF] animate-[width_3s_ease-in-out]" style={{ width: '100%' }}></div>
        
        <div className="w-12 h-12 bg-[#007AFF] rounded-xl flex-shrink-0 flex items-center justify-center shadow-inner">
          <Download className="text-white" size={24} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#1D1D1F] text-sm truncate">Install Vangly App</h3>
          <p className="text-[#6E6E73] text-xs leading-tight">Add Vangly to your home screen for a better experience.</p>
        </div>

        <div className="flex items-center gap-2">
          {isIOS ? (
            <div className="flex items-center gap-1 bg-[#007AFF] text-white px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-sm">
              <Share size={14} /> <span>Tap Share</span>
            </div>
          ) : (
            <button 
              onClick={handleInstallClick}
              className="bg-[#007AFF] text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-sm active:scale-95 transition-transform"
            >
              Install
            </button>
          )}
          
          <button 
            onClick={() => setShowPrompt(false)}
            className="p-1 text-[#AEAEB2] hover:text-[#1D1D1F] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      
      {isIOS && (
        <div className="mt-2 bg-white/80 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-3 flex items-center justify-center gap-3 animate-pulse">
          <Share size={16} className="text-[#007AFF]" />
          <span className="text-[10px] font-bold text-[#6E6E73] uppercase tracking-wider">Tap Share then "Add to Home Screen"</span>
          <PlusSquare size={16} className="text-[#007AFF]" />
        </div>
      )}
    </div>
  );
}
