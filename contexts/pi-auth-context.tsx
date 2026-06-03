"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { PI_NETWORK_CONFIG, BACKEND_URLS } from "@/lib/system-config";
import { api, setApiAuthToken } from "@/lib/api";

export type LoginDTO = {
  id: string;
  username: string;
  credits_balance: number;
  terms_accepted: boolean;
};

interface PiAuthResult {
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
}

declare global {
  interface Window {
    Pi?: {
      init: (config: { version: string; sandbox?: boolean }) => Promise<void>;
      authenticate: (scopes: string[]) => Promise<PiAuthResult>;
    };
  }
}

interface PiAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  authMessage: string;
  piAccessToken: string | null;
  userData: LoginDTO | null;
  reinitialize: () => Promise<void>;
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);

// Détection du navigateur Pi
const isPiBrowser = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!(window.Pi || navigator.userAgent.includes("PiBrowser"));
};

const loadPiSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    if (!PI_NETWORK_CONFIG.SDK_URL) {
      reject(new Error("SDK URL is not set"));
      return;
    }
    script.src = PI_NETWORK_CONFIG.SDK_URL;
    script.async = true;

    script.onload = () => {
      console.log("✅ Pi SDK script loaded successfully");
      resolve();
    };

    script.onerror = () => {
      console.error("❌ Failed to load Pi SDK script");
      reject(new Error("Failed to load Pi SDK script"));
    };

    document.head.appendChild(script);
  });
};

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState("Initialisation...");
  const [piAccessToken, setPiAccessToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<LoginDTO | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  // Activer le mode démo
  const activateDemoMode = () => {
    console.log("🎮 Mode démo activé - authentification simulée");
    const demoUser: LoginDTO = {
      id: "demo-user-1",
      username: "Agriculteur_Demo",
      credits_balance: 100,
      terms_accepted: true,
    };
    setUserData(demoUser);
    setPiAccessToken("demo-token-" + Date.now());
    setIsAuthenticated(true);
    setAuthMessage("Mode démo (Pi Network non détecté)");
    setDemoMode(true);
    setIsLoading(false);
  };

  const authenticateAndLogin = async (): Promise<void> => {
    setAuthMessage("Authentification avec Pi Network...");
    
    if (!window.Pi) {
      throw new Error("Pi SDK not available");
    }
    
    const piAuthResult = await window.Pi.authenticate(["username"]);

    setAuthMessage("Connexion au serveur...");
    const loginRes = await api.post<LoginDTO>(BACKEND_URLS.LOGIN, {
      pi_auth_token: piAuthResult.accessToken,
    });

    if (piAuthResult?.accessToken) {
      setPiAccessToken(piAuthResult.accessToken);
      setApiAuthToken(piAuthResult.accessToken);
    }

    setUserData(loginRes.data);
  };

  const initializePiAndAuthenticate = async () => {
    try {
      setAuthMessage("Vérification de l'environnement...");
      setIsLoading(true);

      if (typeof window === "undefined") {
        activateDemoMode();
        return;
      }

      // Si on n'est pas dans le navigateur Pi, activer le mode démo
      if (!isPiBrowser()) {
        console.log("⚠️ Non exécuté dans Pi Browser - activation du mode démo");
        activateDemoMode();
        return;
      }

      setAuthMessage("Chargement du SDK Pi Network...");

      if (typeof window.Pi === "undefined") {
        await loadPiSDK();
      }

      if (typeof window.Pi === "undefined") {
        throw new Error("Pi object not available after script load");
      }

      setAuthMessage("Initialisation de Pi Network...");
      await window.Pi.init({
        version: "2.0",
        sandbox: PI_NETWORK_CONFIG.SANDBOX,
      });

      await authenticateAndLogin();

      setIsAuthenticated(true);
      setAuthMessage("Authentifié avec succès !");
    } catch (err) {
      console.error("❌ Pi Network initialization failed:", err);
      setAuthMessage("Échec de l'authentification. Mode démo activé.");
      // En cas d'erreur, activer le mode démo
      activateDemoMode();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializePiAndAuthenticate();
  }, []);

  const reinitialize = async () => {
    if (demoMode) {
      activateDemoMode();
    } else {
      await initializePiAndAuthenticate();
    }
  };

  const value: PiAuthContextType = {
    isAuthenticated,
    isLoading,
    authMessage,
    piAccessToken,
    userData,
    reinitialize,
  };

  return (
    <PiAuthContext.Provider value={value}>{children}</PiAuthContext.Provider>
  );
}

export function usePiAuth() {
  const context = useContext(PiAuthContext);
  if (context === undefined) {
    throw new Error("usePiAuth must be used within a PiAuthProvider");
  }
  return context;
}