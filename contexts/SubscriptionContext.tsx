// contexts/SubscriptionContext.tsx

"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { getSubscription, isSubscriptionValid, activateVif, renewSubscription } from '@/lib/subscription/subscription-storage'
import { SUBSCRIPTION_PRICE, SUBSCRIPTION_DURATION_DAYS } from '@/lib/subscription/subscription-constants'
import { createPiPayment, isPiSDKAvailable } from '@/lib/pi-payments'
import { usePiAuth } from '@/contexts/pi-auth-context'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { showToast } from '@/lib/utils'

interface SubscriptionContextType {
  isVif: boolean
  isExpired: boolean
  expiryDate: string | null
  remainingDays: number
  isLoading: boolean
  subscribe: () => Promise<boolean>
  checkStatus: () => void
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [isVif, setIsVif] = useState(false)
  const [expiryDate, setExpiryDate] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const { isAuthenticated } = usePiAuth()
  const isOnline = useOnlineStatus()

  const checkStatus = useCallback(() => {
    const valid = isSubscriptionValid()
    const sub = getSubscription()
    setIsVif(valid)
    setExpiryDate(sub.expiryDate)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  const remainingDays = expiryDate
    ? Math.max(0, Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  const subscribe = async (): Promise<boolean> => {
    // Vérifications préalables
    if (!isOnline) {
      showToast("Connexion internet requise", "error")
      return false
    }
    if (!isAuthenticated) {
      showToast("Veuillez vous connecter avec Pi Network", "error")
      return false
    }
    if (!isPiSDKAvailable()) {
      showToast("Veuillez ouvrir cette application dans Pi Browser", "error")
      return false
    }

    setIsProcessing(true)
    try {
      const payment = await createPiPayment(SUBSCRIPTION_PRICE, `Abonnement Membre Vif (${SUBSCRIPTION_DURATION_DAYS} jours)`)
      if (payment.identifier) {
        const currentValid = isSubscriptionValid()
        if (currentValid) {
          renewSubscription(payment.identifier)
          showToast("✅ Abonnement prolongé de 30 jours !", "success")
        } else {
          activateVif(SUBSCRIPTION_DURATION_DAYS, payment.identifier)
          showToast("👑 Bienvenue Membre Vif !", "success")
        }
        checkStatus()
        return true
      } else {
        throw new Error("Paiement non confirmé")
      }
    } catch (err: any) {
      console.error("Erreur paiement:", err)
      showToast(err.message || "Le paiement a échoué", "error")
      return false
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <SubscriptionContext.Provider
      value={{
        isVif,
        isExpired: !isVif && !!expiryDate,
        expiryDate,
        remainingDays,
        isLoading: isLoading || isProcessing,
        subscribe,
        checkStatus,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (!context) throw new Error("useSubscription must be used within SubscriptionProvider")
  return context
}