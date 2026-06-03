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
  piAccessToken: string | null;
  userData: LoginDTO | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  reinitialize: () => Promise<void>;
  error: string | null;
  isPiAvailable: boolean;
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);

const isPiBrowser = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!(window.Pi || navigator.userAgent.includes("PiBrowser"));
};

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState("Initialisation...");
  const [piAccessToken, setPiAccessToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<LoginDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPiAvailable, setIsPiAvailable] = useState(false);

  const isDevelopment = process.env.NODE_ENV === "development";

  const activateDemoMode = () => {
    console.log("🎮 Mode démo activé");
    const demoUser: LoginDTO = {
      id: "demo-1",
      username: "Agriculteur_Demo",
      credits_balance: 100,
      terms_accepted: true,
      email: "demo@agromc.com",
      region: "Burkina Faso",
      verified: true,
      walletAddress: "demo-wallet",
    };
    setUserData(demoUser);
    setPiAccessToken("demo-token");
    setIsAuthenticated(true);
    setAuthMessage("Mode démo");
    setError(null);
    setIsLoading(false);
  };

  const login = async () => {
    setError(null);
    setAuthMessage("Authentification...");
    setIsLoading(true);
    try {
      const piAvailable = isPiBrowser();
      setIsPiAvailable(piAvailable);
      if (!piAvailable && !isDevelopment) {
        throw new Error("Veuillez ouvrir dans Pi Browser");
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      activateDemoMode();
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message);
      setAuthMessage("Échec de l'authentification");
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUserData(null);
    setPiAccessToken(null);
    setIsAuthenticated(false);
    setError(null);
    setAuthMessage("Déconnecté");
    setIsLoading(false);
  };

  const reinitialize = async () => {
    await logout();
    await login();
  };

  useEffect(() => {
    const timer = setTimeout(activateDemoMode, 500);
    return () => clearTimeout(timer);
  }, []);

  const value: PiAuthContextType = {
    isAuthenticated,
    isLoading,
    authMessage,
    piAccessToken,
    userData,
    login,
    logout,
    reinitialize,
    error,
    isPiAvailable,
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