// Types pour les paiements Pi
export interface PiPayment {
  identifier: string;
  amount: number;
  memo: string;
  status: 'pending' | 'completed' | 'failed';
  txid?: string;
}

// Interface pour le SDK Pi
declare global {
  interface Window {
    Pi?: {
      init: (config: { version: string; sandbox?: boolean }) => Promise<void>;
      authenticate: (scopes: string[]) => Promise<{ accessToken: string; user: { uid: string; username: string } }>;
      createPayment: (payment: { amount: number; memo: string; metadata?: Record<string, any> }) => Promise<{
        identifier: string;
        txid?: string;
      }>;
    };
  }
}

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
    const payment = await window.Pi.createPayment({
      amount,
      memo,
      metadata: {
        source: 'agro-multicenter',
        timestamp: Date.now(),
      },
    });
    return payment;
  } catch (error) {
    console.error('Erreur paiement Pi:', error);
    throw new Error('Le paiement a échoué. Veuillez réessayer.');
  }
};

/**
 * Vérifie si le SDK Pi est disponible
 */
export const isPiSDKAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!window.Pi;
};

/**
 * Initialise le SDK Pi (optionnel, le SDK se charge automatiquement)
 */
export const initPiSDK = async (sandbox: boolean = true): Promise<void> => {
  if (typeof window === 'undefined') return;
  if (!window.Pi) return;

  try {
    await window.Pi.init({
      version: '2.0',
      sandbox,
    });
  } catch (error) {
    console.error('Erreur init Pi SDK:', error);
  }
};
