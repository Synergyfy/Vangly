'use client';

import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import './pwa.css';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (typeof window !== 'undefined') {
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
    }
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
    <div className="pwa-install-container">
      <div className="pwa-install-card">
        <div className="pwa-progress-bar"></div>
        
        <div className="pwa-icon-box">
          <Download size={22} strokeWidth={3} />
        </div>

        <div className="pwa-text-content">
          <h3>Install Vangly App</h3>
          <p>Get a faster, more reliable experience on your home screen.</p>
        </div>

        <div className="pwa-actions">
          {isIOS ? (
            <div className="btn-pwa-install" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#007AFF' }}>
              <Share size={14} /> <span>Install</span>
            </div>
          ) : (
            <button onClick={handleInstallClick} className="btn-pwa-install">
              Install
            </button>
          )}
          
          <button onClick={() => setShowPrompt(false)} className="btn-pwa-close">
            <X size={20} />
          </button>
        </div>
      </div>
      
      {isIOS && (
        <div className="pwa-ios-guide">
          <Share size={16} style={{ color: '#007AFF' }} />
          <span>Tap Share then "Add to Home Screen"</span>
          <PlusSquare size={16} style={{ color: '#007AFF' }} />
        </div>
      )}
    </div>
  );
}
