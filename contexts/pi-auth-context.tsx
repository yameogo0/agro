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
  isPiAvailable: boolean;
}

declare global {
  interface Window {
    Pi?: {
      init: (config: { version: string; sandbox?: boolean }) => Promise<void>;
      authenticate: (scopes: string[], options?: { onIncomplete?: (error: any) => void }) => Promise<{
        accessToken: string;
        user: { uid: string; username: string };
      }>;
    };
  }
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);

// Détecter si on est dans le navigateur Pi
const isPiBrowser = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!window.Pi || navigator.userAgent.includes("PiBrowser");
};

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState("Initialisation...");
  const [userData, setUserData] = useState<LoginDTO | null>(null);
  const [isPiAvailable, setIsPiAvailable] = useState(false);

  const isDevelopment = process.env.NODE_ENV === "development";

  // Activer le mode démo
  const activateDemoMode = () => {
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
  };

  // Authentification réelle avec Pi SDK
  const authenticateWithPi = async (): Promise<void> => {
    if (!window.Pi) {
      throw new Error("Pi SDK not available");
    }

    setAuthMessage("Authentification avec Pi Network...");
    
    const piAuthResult = await window.Pi.authenticate(["username", "wallet_address"], {
      onIncomplete: (error) => {
        console.error("Authentication incomplete:", error);
        throw new Error("Authentication cancelled");
      }
    });

    if (!piAuthResult?.accessToken || !piAuthResult?.user) {
      throw new Error("Invalid authentication response");
    }

    setAuthMessage("Connexion réussie !");
    
    // Créer l'utilisateur avec les données Pi
    const newUser: LoginDTO = {
      id: piAuthResult.user.uid,
      username: piAuthResult.user.username,
      credits_balance: 0,
      terms_accepted: true,
      walletAddress: piAuthResult.user.uid,
      verified: true,
      region: "Burkina Faso", // À détecter via géolocalisation plus tard
    };
    
    setUserData(newUser);
    setIsAuthenticated(true);
    
    // Sauvegarder en local
    localStorage.setItem("pi_user_data", JSON.stringify(newUser));
    localStorage.setItem("pi_access_token", piAuthResult.accessToken);
  };

  const login = async () => {
    setIsLoading(true);
    setAuthMessage("Préparation de l'authentification...");
    
    try {
      const piAvailable = isPiBrowser();
      setIsPiAvailable(piAvailable);

      // En développement ou hors Pi Browser, utiliser le mode démo
      if (!piAvailable && !isDevelopment) {
        setAuthMessage("Veuillez ouvrir dans Pi Browser");
        setIsLoading(false);
        return;
      }

      // Charger le SDK Pi si nécessaire
      if (typeof window.Pi === "undefined") {
        setAuthMessage("Chargement du SDK Pi Network...");
        // Attendre un peu pour que le SDK se charge (déjà chargé via script)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (typeof window.Pi === "undefined") {
        throw new Error("Pi SDK not loaded");
      }

      setAuthMessage("Initialisation de Pi Network...");
      await window.Pi.init({
        version: "2.0",
        sandbox: true, // Toujours en sandbox pour Testnet
      });

      await authenticateWithPi();
    } catch (err: any) {
      console.error("Login error:", err);
      // Fallback en mode démo en cas d'erreur
      if (isDevelopment) {
        console.log("Fallback vers mode démo");
        activateDemoMode();
      } else {
        setAuthMessage(err.message || "Erreur d'authentification");
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    }
  };

  const logout = async () => {
    setUserData(null);
    setIsAuthenticated(false);
    setAuthMessage("Déconnecté");
    setIsLoading(false);
    localStorage.removeItem("pi_user_data");
    localStorage.removeItem("pi_access_token");
  };

  // Vérifier la session existante au chargement
  useEffect(() => {
    const checkExistingSession = () => {
      const storedUser = localStorage.getItem("pi_user_data");
      const storedToken = localStorage.getItem("pi_access_token");
      
      if (storedUser && storedToken && !isDevelopment) {
        try {
          const user = JSON.parse(storedUser);
          setUserData(user);
          setIsAuthenticated(true);
          setAuthMessage("Bienvenue !");
          setIsLoading(false);
          return true;
        } catch (err) {
          console.error("Error restoring session:", err);
        }
      }
      return false;
    };

    const hasSession = checkExistingSession();
    
    if (!hasSession) {
      // Mode démo automatique en développement
      if (isDevelopment) {
        activateDemoMode();
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  const value: PiAuthContextType = {
    isAuthenticated,
    isLoading,
    authMessage,
    userData,
    login,
    logout,
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