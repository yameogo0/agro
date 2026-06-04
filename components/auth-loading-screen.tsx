"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface AuthLoadingScreenProps {
  language?: string;
  message?: string;
}

export function AuthLoadingScreen({ language = "fr", message }: AuthLoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(message || "Initialisation...");

  const messages: Record<string, string[]> = {
    fr: [
      "Initialisation de l'application...",
      "Connexion au réseau Pi...",
      "Chargement de votre profil...",
      "Préparation du tableau de bord...",
    ],
    en: [
      "Initializing application...",
      "Connecting to Pi Network...",
      "Loading your profile...",
      "Preparing dashboard...",
    ],
    es: [
      "Inicializando aplicación...",
      "Conectando a Pi Network...",
      "Cargando tu perfil...",
      "Preparando tablero...",
    ],
    pt: [
      "Inicializando aplicação...",
      "Conectando à Pi Network...",
      "Carregando seu perfil...",
      "Preparando painel...",
    ],
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 15, 100));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const step = Math.floor(progress / 25);
    const langMessages = messages[language] || messages.fr;
    setCurrentMessage(langMessages[Math.min(step, langMessages.length - 1)] || langMessages[0]);
  }, [progress, language]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-3xl text-white animate-pulse">🌾</span>
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce">
            π
          </div>
        </div>

        <h2 className="text-xl font-bold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent mb-2">
          AGRO MULTICENTER HINOS
        </h2>
        <p className="text-gray-500 text-sm mb-6">{currentMessage}</p>

        <div className="flex justify-center gap-2 mb-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-300 relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/30 animate-[shimmer_1.5s_infinite]" />
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-green-600" />
        </div>

        <p className="text-xs text-gray-400 mt-4">Version 2.1.0 • Paiements Pi • Multilingue</p>
      </div>
    </div>
  );
}