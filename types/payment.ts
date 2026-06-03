export interface Payment {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  type: 'service' | 'transfer' | 'subscription';
  description?: string;
  transactionHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Wallet {
  address: string;
  balance: number;
  lockedBalance: number;
  pendingTransactions: number;
}