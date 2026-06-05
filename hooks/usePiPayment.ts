import { useState } from 'react'
import { createPiPayment, isPiSDKAvailable } from '@/lib/pi-payments'
import { showToast } from '@/lib/utils'
import { usePiAuth } from '@/contexts/pi-auth-context'
import { useOnlineStatus } from '@/hooks/use-online-status'

export const usePiPayment = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const { isAuthenticated } = usePiAuth()
  const isOnline = useOnlineStatus()

  const processPayment = async (
    amount: number,
    memo: string,
    onSuccess?: (paymentId: string) => void,
    onError?: (error: any) => void
  ) => {
    if (!isOnline) {
      showToast('Connexion internet requise', 'error')
      return false
    }
    if (!isAuthenticated) {
      showToast('Veuillez vous connecter avec Pi Network', 'error')
      return false
    }
    if (!isPiSDKAvailable()) {
      showToast('Ouvrez cette application dans Pi Browser', 'error')
      return false
    }

    setIsProcessing(true)
    try {
      const payment = await createPiPayment(amount, memo)
      if (payment.identifier) {
        showToast(`Paiement de ${amount} π réussi`, 'success')
        onSuccess?.(payment.identifier)
        return true
      } else {
        throw new Error('Paiement échoué')
      }
    } catch (error: any) {
      showToast(error.message || 'Erreur lors du paiement', 'error')
      onError?.(error)
      return false
    } finally {
      setIsProcessing(false)
    }
  }

  return { processPayment, isProcessing }
}