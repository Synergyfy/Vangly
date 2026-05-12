"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface BrandSettings {
  primaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  organizationName: string;
}

interface BrandContextType {
  settings: BrandSettings;
  updateSettings: (newSettings: Partial<BrandSettings>) => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<BrandSettings>({
    primaryColor: '#007AFF', // Default Apple Blue
    accentColor: '#AF52DE',  // Default Purple
    logoUrl: null,
    organizationName: 'Vangly Organization',
  });

  const updateSettings = (newSettings: Partial<BrandSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Apply CSS variables globally whenever settings change
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--blue', settings.primaryColor);
    root.style.setProperty('--purple', settings.accentColor);
    
    // Generate hover and light versions (simplified for demo)
    // In a real app, you'd use a color library to generate these
    root.style.setProperty('--blue-light', `${settings.primaryColor}15`);
    root.style.setProperty('--blue-subtle', `${settings.primaryColor}08`);
  }, [settings]);

  return (
    <BrandContext.Provider value={{ settings, updateSettings }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};
