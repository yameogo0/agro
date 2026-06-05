// hooks/usePiPayment.ts

import { useState, useCallback } from 'react'
import { createPiPayment, isPiSDKAvailable } from '@/lib/pi-payments'
import { showToast } from '@/lib/utils'
import { usePiAuth } from '@/contexts/pi-auth-context'
import { useOnlineStatus } from '@/hooks/use-online-status'

interface PaymentOptions {
  amount: number
  memo: string
  onSuccess?: (paymentId: string) => void
  onError?: (error: any) => void
  onFinally?: () => void
}

export const usePiPayment = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastPaymentId, setLastPaymentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const { isAuthenticated } = usePiAuth()
  const isOnline = useOnlineStatus()

  const processPayment = useCallback(async (options: PaymentOptions): Promise<boolean> => {
    const { amount, memo, onSuccess, onError, onFinally } = options

    // Validation
    if (!isOnline) {
      const msg = 'Connexion internet requise'
      showToast(msg, 'error')
      setError(msg)
      onError?.(msg)
      return false
    }

    if (!isAuthenticated) {
      const msg = 'Veuillez vous connecter avec Pi Network'
      showToast(msg, 'error')
      setError(msg)
      onError?.(msg)
      return false
    }

    if (!isPiSDKAvailable()) {
      const msg = 'Veuillez ouvrir cette application dans Pi Browser'
      showToast(msg, 'error')
      setError(msg)
      onError?.(msg)
      return false
    }

    if (amount <= 0) {
      const msg = 'Montant invalide'
      showToast(msg, 'error')
      setError(msg)
      onError?.(msg)
      return false
    }

    setIsProcessing(true)
    setError(null)

    try {
      const payment = await createPiPayment(amount, memo)
      
      if (payment?.identifier) {
        setLastPaymentId(payment.identifier)
        showToast(`✅ Paiement de ${amount} π réussi`, 'success')
        onSuccess?.(payment.identifier)
        return true
      } else {
        throw new Error('Transaction non confirmée')
      }
    } catch (err: any) {
      console.error('Erreur paiement Pi:', err)
      const errorMsg = err.message || 'Erreur lors du paiement'
      showToast(errorMsg, 'error')
      setError(errorMsg)
      onError?.(err)
      return false
    } finally {
      setIsProcessing(false)
      onFinally?.()
    }
  }, [isOnline, isAuthenticated])

  const resetPaymentState = useCallback(() => {
    setLastPaymentId(null)
    setError(null)
  }, [])

  return {
    processPayment,
    isProcessing,
    lastPaymentId,
    error,
    resetPaymentState,
  }
}