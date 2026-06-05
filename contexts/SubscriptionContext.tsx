// contexts/SubscriptionContext.tsx

"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { getSubscription, isSubscriptionValid, activateVif, renewSubscription } from '@/lib/subscription/subscription-storage'
import { SUBSCRIPTION_PRICE, SUBSCRIPTION_DURATION_DAYS } from '@/lib/subscription/subscription-constants'
import { usePiPayment } from '@/hooks/usePiPayment'
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
  const { processPayment, isProcessing } = usePiPayment()

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
    console.log("🔵 Abonnement - Début")
    const success = await processPayment(
      SUBSCRIPTION_PRICE,
      `Abonnement Membre Vif (${SUBSCRIPTION_DURATION_DAYS} jours)`, // ✅ CORRIGÉ
      (paymentId) => {
        console.log("🔵 Abonnement - Paiement réussi", paymentId)
        const currentValid = isSubscriptionValid()
        if (currentValid) {
          renewSubscription(paymentId)
          showToast('✅ Abonnement prolongé de 30 jours !', 'success')
        } else {
          activateVif(SUBSCRIPTION_DURATION_DAYS, paymentId)
          showToast('👑 Bienvenue Membre Vif !', 'success')
        }
        checkStatus()
      }
    )
    console.log("🔵 Abonnement - Résultat:", success)
    return success
  }

  return (
    <SubscriptionContext.Provider value={{
      isVif,
      isExpired: !isVif && !!expiryDate,
      expiryDate,
      remainingDays,
      isLoading,
      subscribe,
      checkStatus,
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (!context) throw new Error('useSubscription must be used within SubscriptionProvider')
  return context
}