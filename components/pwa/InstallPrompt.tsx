'use client';

import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Download } from 'lucide-react';
import './InstallPrompt.css';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone)) {
      setIsStandalone(true);
      return;
    }

    // Check if we've already shown the prompt in this session
    const hasBeenShown = typeof window !== 'undefined' && sessionStorage.getItem('pwa-prompt-shown');
    if (hasBeenShown) return;

    // Check if iOS
    const isIOSDevice = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Handle Android/Chrome install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after a delay to be non-intrusive
      const timer = setTimeout(() => {
        setShowPrompt(true);
        sessionStorage.setItem('pwa-prompt-shown', 'true');
      }, 3000);
      
      return () => clearTimeout(timer);
    };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show guide after delay
    if (isIOSDevice) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
        sessionStorage.setItem('pwa-prompt-shown', 'true');
      }, 5000);
      return () => clearTimeout(timer);
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

  const handleDismiss = () => {
    setShowPrompt(false);
    // Also set the flag here just in case, though it's already set when shown
    sessionStorage.setItem('pwa-prompt-shown', 'true');
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="pwa-prompt-container">
      <div className="pwa-modal">
        <div className="pwa-icon-container">
          <img 
            src="/icons/icon-192x192.png" 
            alt="Vangly Icon" 
            className="w-full h-full object-cover rounded-[14px]"
            onError={(e) => {
              // Fallback to a styled V if image fails
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = '<span style="color: white; font-weight: 900; font-size: 24px;">V</span>';
              }
            }}
          />
        </div>

        <div className="pwa-content">
          <h3 className="pwa-title">Install Vangly App</h3>
          <p className="pwa-description">Add Vangly to your home screen for a faster, better experience.</p>
        </div>

        <div className="pwa-actions">
          {isIOS ? (
            <div className="pwa-install-btn flex items-center gap-2">
              <Share size={14} /> <span>Tap Share</span>
            </div>
          ) : (
            <button 
              onClick={handleInstallClick}
              className="pwa-install-btn flex items-center gap-2"
            >
              <Download size={14} />
              <span>Install</span>
            </button>
          )}
          
          <button 
            onClick={handleDismiss}
            className="pwa-close-btn"
            aria-label="Close prompt"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      
      {isIOS && (
        <div className="pwa-ios-hint">
          <Share size={16} className="pwa-ios-icon" />
          <span>Tap Share then "Add to Home Screen"</span>
          <PlusSquare size={16} className="pwa-ios-icon" />
        </div>
      )}
    </div>
  );
}



