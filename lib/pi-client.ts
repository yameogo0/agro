// lib/pi-client.ts

// Types
export interface PiPaymentRequest {
  amount: number;
  memo: string;
  metadata?: Record<string, any>;
}

export interface PiPaymentResponse {
  success: boolean;
  identifier?: string;
  status?: string;
  amount?: number;
  error?: string;
}

// 1. Créer un paiement
export const createPayment = async (amount: number, memo: string, metadata?: Record<string, any>): Promise<PiPaymentResponse> => {
  try {
    const response = await fetch('/api/pi/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, memo, metadata }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error };
    }
    
    return { 
      success: true, 
      identifier: data.identifier,
      status: data.status,
      amount: data.amount,
    };
  } catch (error: any) {
    console.error('Erreur création paiement:', error);
    return { success: false, error: error.message };
  }
};

// 2. Vérifier le statut d'un paiement
export const verifyPayment = async (paymentId: string): Promise<PiPaymentResponse> => {
  try {
    const response = await fetch(`/api/pi/verify-payment?paymentId=${paymentId}`);
    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error };
    }
    
    return {
      success: true,
      identifier: data.identifier,
      status: data.status,
      amount: data.amount,
    };
  } catch (error: any) {
    console.error('Erreur vérification paiement:', error);
    return { success: false, error: error.message };
  }
};

// 3. Récupérer les détails d'un paiement
export const getPayment = async (paymentId: string): Promise<any> => {
  try {
    const response = await fetch(`/api/pi/get-payment?paymentId=${paymentId}`);
    const data = await response.json();
    
    if (!response.ok) {
      return null;
    }
    
    return data.payment || data;
  } catch (error) {
    console.error('Erreur récupération paiement:', error);
    return null;
  }
};

// 4. Compléter un paiement
export const completePayment = async (paymentId: string, transactionId: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/pi/complete-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, transactionId }),
    });
    
    const data = await response.json();
    return response.ok;
  } catch (error) {
    console.error('Erreur completion paiement:', error);
    return false;
  }
};