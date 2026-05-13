'use client';

import React from 'react';
import { WifiOff, RefreshCcw } from 'lucide-react';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F7] p-6 text-center">
      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg mb-8 animate-bounce">
        <WifiOff size={40} className="text-[#007AFF]" />
      </div>
      
      <h1 className="text-3xl font-extrabold text-[#1D1D1F] mb-4 tracking-tight">
        You're Offline
      </h1>
      
      <p className="text-[#6E6E73] text-lg max-w-xs mb-10 leading-relaxed">
        Please check your internet connection to continue using Vangly.
      </p>
      
      <button 
        onClick={handleRetry}
        className="flex items-center gap-2 bg-[#007AFF] text-white px-8 py-4 rounded-2xl font-bold shadow-md hover:bg-[#0066D6] transition-all active:scale-95"
      >
        <RefreshCcw size={20} />
        Retry Connection
      </button>
      
      <div className="mt-12 text-[#AEAEB2] text-sm font-medium">
        Vangly Progressive Web App
      </div>
    </div>
  );
}
