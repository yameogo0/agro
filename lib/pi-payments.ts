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
      authenticate: (scopes: string[]) => Promise<{ accessToken: string; user: { uid: string; username: string } }>;
      createPayment: (payment: { amount: number; memo: string; metadata?: Record<string, any> }) => Promise<{
        identifier: string;
        txid?: string;
      }>;
    };
  }
}

export const createPiPayment = async (amount: number, memo: string): Promise<{ identifier: string; txid?: string }> => {
  if (typeof window === 'undefined') throw new Error('Pi SDK non disponible (serveur)');

  // Attendre que le SDK soit chargé (max 3 secondes)
  let retries = 0;
  while (!window.Pi && retries < 30) {
    await new Promise(resolve => setTimeout(resolve, 100));
    retries++;
  }

  if (!window.Pi) {
    throw new Error('SDK Pi non chargé. Veuillez ouvrir dans Pi Browser.');
  }

  try {
    // Le montant doit être un nombre, pas une chaîne
    const amountNumber = typeof amount === 'string' ? parseFloat(amount) : amount;
    const payment = await window.Pi.createPayment({
      amount: amountNumber,
      memo,
      metadata: {
        source: 'agro-multicenter',
        timestamp: Date.now(),
      },
    });
    return payment;
  } catch (error: any) {
    console.error('Erreur paiement Pi:', error);
    throw new Error(error.message || 'Le paiement a échoué. Veuillez réessayer.');
  }
};

export const isPiSDKAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!window.Pi;
};

export const initPiSDK = async (sandbox: boolean = true): Promise<void> => {
  if (typeof window === 'undefined') return;
  if (!window.Pi) return;

  try {
    await window.Pi.init({
      version: '2.0',
      sandbox,
    });
    console.log('✅ SDK Pi initialisé avec succès');
  } catch (error) {
    console.error('Erreur init Pi SDK:', error);
  }
};