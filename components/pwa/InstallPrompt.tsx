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

    // Check if we've already shown the prompt or if user dismissed it
    const hasBeenShown = typeof window !== 'undefined' && (localStorage.getItem('pwa-prompt-shown') || localStorage.getItem('pwa-prompt-dismissed'));
    if (hasBeenShown) return;

    // Set shown flag immediately so it doesn't appear on every navigation
    localStorage.setItem('pwa-prompt-shown', 'true');

    // Check if iOS
    const isIOSDevice = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Handle Android/Chrome install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after a delay to be non-intrusive
      androidTimer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    let androidTimer: NodeJS.Timeout | null = null;
    let iosTimer: NodeJS.Timeout | null = null;

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    if (isIOSDevice) {
      iosTimer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (androidTimer) clearTimeout(androidTimer);
      if (iosTimer) clearTimeout(iosTimer);
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

  const handleDismiss = () => {
    setShowPrompt(false);
    // Persist dismissal so it doesn't show up again
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="pwa-prompt-container">
      <div className="pwa-modal">
        <div className="pwa-icon-container">
          <img 
            src="/Harvite%20Logo.png" 
            alt="Harvite Icon" 
            className="w-full h-full object-cover rounded-[14px]"
            onError={(e) => {
              // Fallback to a styled H if image fails
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = '<span style="color: white; font-weight: 900; font-size: 24px;">H</span>';
              }
            }}
          />
        </div>

        <div className="pwa-content">
          <h3 className="pwa-title">Install Harvite App</h3>
          <p className="pwa-description">Add Harvite to your home screen for a faster, better experience.</p>
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



