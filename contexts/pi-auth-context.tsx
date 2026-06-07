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
  walletAddress: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isPiAvailable: boolean;
  refreshWallet: () => Promise<void>;
}

declare global {
  interface Window {
    Pi?: {
      init: (config: { version: string; sandbox?: boolean }) => Promise<void>;
      authenticate: (scopes: string[], options?: { onIncomplete?: (error: any) => void }) => Promise<{
        accessToken: string;
        user: { uid: string; username: string };
      }>;
      createPayment: (payment: { amount: number; memo: string; metadata?: Record<string, any> }) => Promise<{
        identifier: string;
        txid?: string;
      }>;
    };
  }
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);

const isPiBrowser = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!window.Pi || navigator.userAgent.includes("PiBrowser");
};

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState("Initialisation...");
  const [userData, setUserData] = useState<LoginDTO | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isPiAvailable, setIsPiAvailable] = useState(false);

  const refreshWallet = async () => {
    if (userData?.walletAddress) {
      setWalletAddress(userData.walletAddress);
    } else if (userData?.id) {
      const derivedAddress = `PI_${userData.id.substring(0, 8)}...${userData.id.substring(userData.id.length - 4)}`;
      setWalletAddress(derivedAddress);
    }
  };

  const authenticateWithPi = async (): Promise<void> => {
    if (!window.Pi) throw new Error("Pi SDK not available");

    setAuthMessage("Authentification avec Pi Network...");
    const piAuthResult = await window.Pi.authenticate(["username", "wallet_address"], {
      onIncomplete: (error) => {
        console.error("Authentication incomplete:", error);
        throw new Error("Authentication cancelled");
      },
    });

    if (!piAuthResult?.accessToken || !piAuthResult?.user) {
      throw new Error("Invalid authentication response");
    }

    const userWalletAddress = `PI_${piAuthResult.user.uid.substring(0, 8)}...`;
    const newUser: LoginDTO = {
      id: piAuthResult.user.uid,
      username: piAuthResult.user.username,
      credits_balance: 0,
      terms_accepted: true,
      walletAddress: userWalletAddress,
      verified: true,
      region: "Burkina Faso",
    };

    setUserData(newUser);
    setWalletAddress(userWalletAddress);
    setIsAuthenticated(true);
    setAuthMessage("Connexion réussie !");

    localStorage.setItem("pi_user_data", JSON.stringify(newUser));
    localStorage.setItem("pi_access_token", piAuthResult.accessToken);
  };

  const login = async () => {
    setIsLoading(true);
    setAuthMessage("Préparation...");

    try {
      const piAvailable = isPiBrowser();
      setIsPiAvailable(piAvailable);

      if (!piAvailable) {
        setAuthMessage("Veuillez ouvrir cette application dans Pi Browser");
        setIsLoading(false);
        return;
      }

      // Attendre le chargement du SDK (max 5 secondes)
      let retries = 0;
      while (!window.Pi && retries < 25) {
        await new Promise((r) => setTimeout(r, 200));
        retries++;
      }
      if (!window.Pi) throw new Error("Pi SDK not loaded");

      setAuthMessage("Initialisation de Pi Network...");
      await window.Pi.init({ version: "2.0", sandbox: true });

      await authenticateWithPi();
    } catch (err: any) {
      console.error("Login error:", err);
      setAuthMessage(err.message || "Erreur d'authentification");
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUserData(null);
    setWalletAddress(null);
    setIsAuthenticated(false);
    setAuthMessage("Déconnecté");
    setIsLoading(false);
    localStorage.removeItem("pi_user_data");
    localStorage.removeItem("pi_access_token");
  };

  // Restauration de session
  useEffect(() => {
    const storedUser = localStorage.getItem("pi_user_data");
    const storedToken = localStorage.getItem("pi_access_token");
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        setUserData(user);
        setWalletAddress(user.walletAddress || null);
        setIsAuthenticated(true);
        setAuthMessage("Bienvenue !");
        setIsLoading(false);
      } catch (e) {
        console.error(e);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userData?.walletAddress) setWalletAddress(userData.walletAddress);
  }, [userData]);

  const value: PiAuthContextType = {
    isAuthenticated,
    isLoading,
    authMessage,
    userData,
    walletAddress,
    login,
    logout,
    isPiAvailable,
    refreshWallet,
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