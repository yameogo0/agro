'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pi, Eye, EyeOff, RefreshCw, Loader2 } from 'lucide-react';
import { usePiAuth } from '@/contexts/pi-auth-context';

interface PiBalanceProps {
  onRefresh?: (balance: number) => void;
}

export function PiBalance({ onRefresh }: PiBalanceProps) {
  const { userData, walletAddress, isAuthenticated } = usePiAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(false);

  // Vérifier si on est dans Pi Browser
  const isPiBrowser = (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!window.Pi || navigator.userAgent.includes('PiBrowser');
  };

  const fetchBalance = async () => {
    if (!isAuthenticated) {
      console.log('Non authentifié');
      return;
    }

    setLoading(true);
    try {
      // Récupérer le solde depuis localStorage ou simulation
      const savedBalance = localStorage.getItem('pi_balance');
      if (savedBalance) {
        setBalance(parseFloat(savedBalance));
      } else {
        // Solde par défaut (à remplacer par un vrai appel API quand disponible)
        const defaultBalance = 15.7834;
        setBalance(defaultBalance);
        localStorage.setItem('pi_balance', defaultBalance.toString());
      }
      
      onRefresh?.(balance || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le solde après un paiement
  const updateBalance = (newBalance: number) => {
    setBalance(newBalance);
    localStorage.setItem('pi_balance', newBalance.toString());
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBalance();
    }
  }, [isAuthenticated]);

  // Écouter les événements de paiement
  useEffect(() => {
    const handlePaymentUpdate = (event: CustomEvent) => {
      if (event.detail?.newBalance) {
        updateBalance(event.detail.newBalance);
      }
    };
    
    window.addEventListener('pi-payment-complete' as any, handlePaymentUpdate);
    return () => window.removeEventListener('pi-payment-complete' as any, handlePaymentUpdate);
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white/20 p-2">
              <Pi className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-purple-200">Solde disponible</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : showBalance ? (
                    balance !== null ? `${balance.toFixed(4)} π` : '0.0000 π'
                  ) : (
                    '•••• π'
                  )}
                </p>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-purple-200 hover:text-white transition-colors"
                >
                  {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  onClick={fetchBalance}
                  disabled={loading}
                  className="text-purple-200 hover:text-white transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Badge Pi Browser */}
        <div className="mt-3 flex items-center justify-between">
          {!isPiBrowser() && (
            <div className="rounded-lg bg-yellow-500/20 p-2 text-center text-xs text-yellow-200">
              📱 Ouvrez dans Pi Browser pour les paiements
            </div>
          )}
          {walletAddress && (
            <div className="text-[10px] text-purple-300 truncate">
              {walletAddress.substring(0, 12)}...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}