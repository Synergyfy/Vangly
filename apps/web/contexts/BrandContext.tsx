"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/services/auth';
import { getMyOrganization } from '@/lib/api/endpoints/organizations';

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
  const { isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<BrandSettings>({
    primaryColor: '#007AFF', // Default Apple Blue
    accentColor: '#AF52DE',  // Default Purple
    logoUrl: null,
    organizationName: 'Harvite Organization',
  });

  const orgQuery = useQuery({
    queryKey: ['organizations', 'me'],
    queryFn: () => getMyOrganization(),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (orgQuery.data) {
      setSettings(prev => ({
        ...prev,
        primaryColor: orgQuery.data.primary_color || prev.primaryColor,
        logoUrl: orgQuery.data.logo_url || prev.logoUrl,
        organizationName: orgQuery.data.name || prev.organizationName,
      }));
    }
  }, [orgQuery.data]);

  const updateSettings = (newSettings: Partial<BrandSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Apply CSS variables globally whenever settings change
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--blue', settings.primaryColor);
    root.style.setProperty('--purple', settings.accentColor);
    
    // Generate hover and light versions (simplified for demo)
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
