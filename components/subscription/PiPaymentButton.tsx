"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createPiPayment, isPiSDKAvailable } from '@/lib/pi-payments'
import { usePiAuth } from '@/contexts/pi-auth-context'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { Loader2, Crown } from 'lucide-react'
import { showToast } from '@/lib/utils'

export function PiPaymentButton({ amount, memo, onSuccess, children }: any) {
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = usePiAuth()
  const isOnline = useOnlineStatus()

  const handleClick = async () => {
    if (!isOnline) return showToast("Pas de connexion", "error")
    if (!isAuthenticated) return showToast("Connectez-vous avec Pi", "error")
    if (!isPiSDKAvailable()) return showToast("Ouvrez dans Pi Browser", "error")
    
    setLoading(true)
    try {
      const payment = await createPiPayment(amount, memo)
      if (payment.identifier) {
        showToast("Paiement réussi !", "success")
        onSuccess?.(payment.identifier)
      }
    } catch (err: any) {
      showToast(err.message, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading} className="w-full">
      {loading ? <Loader2 className="animate-spin mr-2" /> : <Crown className="mr-2" />}
      {children}
    </Button>
  )
}