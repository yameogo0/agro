"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type LoginDTO = {
  id: string;
  username: string;
  credits_balance: number;
  terms_accepted: boolean;
  email?: string;
  phone?: string;
  region?: string;
  avatar?: string;
  walletAddress?: string;
  verified?: boolean;
};

interface PiAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  authMessage: string;
  userData: LoginDTO | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState("Initialisation...");
  const [userData, setUserData] = useState<LoginDTO | null>(null);

  useEffect(() => {
    // Mode démo : connexion automatique après 800ms
    const timer = setTimeout(() => {
      console.log("🎮 Mode démo activé");
      const demoUser: LoginDTO = {
        id: "demo-123",
        username: "Agriculteur_Demo",
        credits_balance: 125.5,
        terms_accepted: true,
        email: "demo@agromc.com",
        region: "Burkina Faso",
        verified: true,
        walletAddress: "GCKFBEIYTKQTIQ7VIN54JHKOQ2QZSMH6APPQPLZX2BG4O6JJZWRBTPI7",
      };
      setUserData(demoUser);
      setIsAuthenticated(true);
      setAuthMessage("Mode démo - Connecté");
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const login = async () => {
    setIsLoading(true);
    setAuthMessage("Authentification...");
    // Simuler une authentification Pi
    setTimeout(() => {
      const demoUser: LoginDTO = {
        id: "demo-" + Date.now(),
        username: "Agriculteur_Pi",
        credits_balance: 100,
        terms_accepted: true,
        region: "Burkina Faso",
        verified: true,
      };
      setUserData(demoUser);
      setIsAuthenticated(true);
      setAuthMessage("Connecté avec succès !");
      setIsLoading(false);
    }, 1000);
  };

  const logout = async () => {
    setUserData(null);
    setIsAuthenticated(false);
    setAuthMessage("Déconnecté");
    setIsLoading(false);
  };

  const value: PiAuthContextType = {
    isAuthenticated,
    isLoading,
    authMessage,
    userData,
    login,
    logout,
  };

  return <PiAuthContext.Provider value={value}>{children}</PiAuthContext.Provider>;
}

export function usePiAuth() {
  const context = useContext(PiAuthContext);
  if (context === undefined) {
    throw new Error("usePiAuth must be used within a PiAuthProvider");
  }
  return context;
}