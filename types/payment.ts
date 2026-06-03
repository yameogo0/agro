export interface PiPayment {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number; // en π
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  type: 'service' | 'transfer' | 'subscription' | 'product';
  description?: string;
  transactionHash?: string;
  memo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PiWallet {
  address: string;
  balance: number; // en π
  lockedBalance: number;
  pendingTransactions: number;
  totalReceived: number;
  totalSent: number;
}

export interface PiTransaction {
  id: string;
  amount: number;
  from: string;
  to: string;
  memo: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  type: 'sent' | 'received';
}

export interface PaymentRequest {
  amount: number;
  to: string;
  memo: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
}