"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Mock User Roles: 'super_admin', 'branch_admin', 'worker', null
export type UserRole = "platform_super_admin" | "super_admin" | "organization_admin" | "location_admin" | "branch_admin" | "worker" | null;

interface User {
  id: string;
  name: string;
  role: UserRole;
  organization_id: string;
  branch_id?: string;
  credits: number; // Added SMS credits
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage on mount
    const storedUser = localStorage.getItem("vemtap_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    const userWithCredits = { ...userData, credits: userData.credits ?? 500 }; // Default to 500 credits if new
    setUser(userWithCredits);
    localStorage.setItem("vemtap_user", JSON.stringify(userWithCredits));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("vemtap_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
