'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/common/Button';
import { Pi, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { piPaymentService } from '@/lib/services/pi-payment.service';

interface PiBalanceProps {
  onRefresh?: (balance: number) => void;
}

export function PiBalance({ onRefresh }: PiBalanceProps) {
  const { userData } = usePiAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      // Simuler la récupération du solde
      // En production, appeler l'API backend
      const mockBalance = 12.5847;
      setBalance(mockBalance);
      onRefresh?.(mockBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

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
                  {showBalance ? (balance !== null ? `${balance.toFixed(4)} π` : '--- π') : '•••• π'}
                </p>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-purple-200 hover:text-white"
                >
                  {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchBalance}
            disabled={loading}
            className="text-white hover:bg-white/20"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {!piPaymentService.isPiBrowser() && (
          <div className="mt-3 rounded-lg bg-yellow-500/20 p-2 text-center text-xs text-yellow-200">
            📱 Ouvrez dans Pi Browser pour les paiements
          </div>
        )}
      </CardContent>
    </Card>
  );
}