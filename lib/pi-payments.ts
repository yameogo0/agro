// lib/pi-payments.ts

export interface PiPayment {
  identifier: string;
  amount: number;
  memo: string;
  status: 'pending' | 'completed' | 'failed';
  txid?: string;
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

/**
 * Vérifie si le SDK Pi est disponible
 */
export const isPiSDKAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!window.Pi;
};

/**
 * Initialise le SDK Pi
 */
export const initPiSDK = async (sandbox: boolean = true): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  console.log("🔵 initPiSDK - Vérification du SDK...");
  
  // Attendre que le SDK soit chargé (max 5 secondes)
  let retries = 0;
  while (!window.Pi && retries < 50) {
    await new Promise(resolve => setTimeout(resolve, 100));
    retries++;
  }
  
  if (!window.Pi) {
    console.error("❌ SDK Pi non trouvé après 5 secondes");
    throw new Error("SDK Pi non disponible. Veuillez ouvrir dans Pi Browser.");
  }
  
  console.log("✅ SDK Pi trouvé, initialisation...");
  
  try {
    await window.Pi.init({
      version: '2.0',
      sandbox,
    });
    console.log("✅ SDK Pi initialisé avec succès");
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation:", error);
    throw error;
  }
};

/**
 * Crée un paiement Pi Network
 * @param amount - Montant en Pi
 * @param memo - Description du paiement
 * @returns Promesse avec l'identifiant du paiement
 */
export const createPiPayment = async (amount: number, memo: string): Promise<{ identifier: string; txid?: string }> => {
  if (typeof window === 'undefined') {
    throw new Error('Pi SDK non disponible (serveur)');
  }

  // Vérifier que le SDK Pi est chargé
  if (!window.Pi) {
    throw new Error('SDK Pi non chargé. Veuillez ouvrir dans Pi Browser.');
  }

  try {
    console.log(`🔵 Création d'un paiement de ${amount} π: ${memo}`);
    const payment = await window.Pi.createPayment({
      amount,
      memo,
      metadata: {
        source: 'agro-multicenter',
        timestamp: Date.now(),
      },
    });
    console.log("✅ Paiement créé:", payment);
    return payment;
  } catch (error) {
    console.error('❌ Erreur paiement Pi:', error);
    throw new Error('Le paiement a échoué. Veuillez réessayer.');
  }
};

/**
 * Récupère l'utilisateur authentifié
 */
export const getPiUser = (): { uid: string; username: string } | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('pi_user');
  return user ? JSON.parse(user) : null;
};

/**
 * Récupère le token d'accès
 */
export const getPiAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pi_access_token');
};

/**
 * Déconnecte l'utilisateur
 */
export const logoutPi = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('pi_access_token');
  localStorage.removeItem('pi_user');
};

// Export par défaut
export default {
  isPiSDKAvailable,
  initPiSDK,
  createPiPayment,
  getPiUser,
  getPiAccessToken,
  logoutPi,
};