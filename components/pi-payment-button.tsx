'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { usePiPayment } from '@/hooks/usePiPayment';
import { Pi } from 'lucide-react';

interface PiPaymentButtonProps {
  amount: number;
  recipientId: string;
  recipientName: string;
  serviceId?: string;
  description: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export function PiPaymentButton({
  amount,
  recipientId,
  recipientName,
  description,
  onSuccess,
  onError,
  className,
  children,
}: PiPaymentButtonProps) {
  const { sendPayment, isProcessing, isPiAvailable } = usePiPayment();
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePayment = async () => {
    const success = await sendPayment(
      recipientId,
      amount,
      `Paiement à ${recipientName} : ${description}`
    );

    if (success) {
      setShowConfirm(false);
      onSuccess?.();
    } else {
      onError?.('Le paiement a échoué');
    }
  };

  if (!isPiAvailable) {
    return (
      <Button
        variant="outline"
        className={className}
        disabled
      >
        <Pi className="mr-2 h-4 w-4" />
        Pi Browser requis
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={() => setShowConfirm(true)}
        disabled={isProcessing}
        className={className}
        variant="primary"
      >
        {isProcessing ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <Pi className="mr-2 h-4 w-4" />
        )}
        {children || `Payer ${amount} π`}
      </Button>

      {/* Modal de confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-semibold">Confirmation du paiement</h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Montant :</span>
                <span className="font-bold text-purple-600">{amount} π</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Destinataire :</span>
                <span>{recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Description :</span>
                <span className="text-sm">{description}</span>
              </div>
              <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                ⚠️ Les paiements Pi sont irréversibles. Vérifiez les informations.
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowConfirm(false)}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? 'Traitement...' : `Confirmer ${amount} π`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}