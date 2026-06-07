// hooks/usePiSDK.ts

import { useState, useEffect, useCallback } from 'react'

interface PiSDKState {
  isReady: boolean
  isLoading: boolean
  error: string | null
  user: {
    uid: string
    username: string
    accessToken?: string
  } | null
}

interface PiPaymentResult {
  identifier: string
  txid?: string
}

export const usePiSDK = () => {
  const [state, setState] = useState<PiSDKState>({
    isReady: false,
    isLoading: true,
    error: null,
    user: null,
  })

  // Vérifier si le SDK Pi est disponible
  const isPiAvailable = useCallback((): boolean => {
    return typeof window !== 'undefined' && !!window.Pi
  }, [])

  // Initialiser le SDK Pi
  const initSDK = useCallback(async (sandbox: boolean = true): Promise<boolean> => {
    if (!isPiAvailable()) {
      setState(prev => ({ ...prev, error: "SDK Pi non disponible", isLoading: false }))
      return false
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      await window.Pi!.init({ version: '2.0', sandbox })
      setState(prev => ({ ...prev, isReady: true, isLoading: false }))
      console.log("✅ SDK Pi initialisé avec succès")
      return true
    } catch (err: any) {
      console.error("Erreur init SDK Pi:", err)
      setState(prev => ({ ...prev, error: err.message, isLoading: false }))
      return false
    }
  }, [isPiAvailable])

  // Authentifier l'utilisateur
  const authenticate = useCallback(async (scopes: string[] = ["username", "wallet_address"]): Promise<boolean> => {
    if (!isPiAvailable()) {
      setState(prev => ({ ...prev, error: "SDK Pi non disponible" }))
      return false
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const auth = await window.Pi!.authenticate(scopes, {
        onIncomplete: (error) => {
          console.error("Authentification incomplète:", error)
        }
      })

      if (auth?.accessToken && auth?.user) {
        setState(prev => ({
          ...prev,
          isReady: true,
          isLoading: false,
          user: {
            uid: auth.user.uid,
            username: auth.user.username,
            accessToken: auth.accessToken,
          }
        }))
        return true
      }
      throw new Error("Authentification échouée")
    } catch (err: any) {
      console.error("Erreur authentification:", err)
      setState(prev => ({ ...prev, error: err.message, isLoading: false }))
      return false
    }
  }, [isPiAvailable])

  // Créer un paiement
  const createPayment = useCallback(async (amount: number, memo: string, metadata?: Record<string, any>): Promise<PiPaymentResult | null> => {
    if (!isPiAvailable()) {
      throw new Error("SDK Pi non disponible")
    }

    if (!state.isReady) {
      throw new Error("SDK Pi non initialisé")
    }

    try {
      const payment = await window.Pi!.createPayment({
        amount,
        memo,
        metadata: { source: 'agro-multicenter', timestamp: Date.now(), ...metadata }
      })
      return payment
    } catch (err: any) {
      console.error("Erreur création paiement:", err)
      throw new Error(err.message || "Erreur lors du paiement")
    }
  }, [isPiAvailable, state.isReady])

  // Déconnexion
  const logout = useCallback(() => {
    setState({
      isReady: false,
      isLoading: false,
      error: null,
      user: null,
    })
  }, [])

  // Vérifier la disponibilité du SDK au montage
  useEffect(() => {
    const checkSDK = () => {
      if (isPiAvailable()) {
        setState(prev => ({ ...prev, isReady: true, isLoading: false }))
      } else {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }

    // Attendre que le SDK se charge (max 5 secondes)
    let retries = 0
    const interval = setInterval(() => {
      if (isPiAvailable()) {
        setState(prev => ({ ...prev, isReady: true, isLoading: false }))
        clearInterval(interval)
      } else if (retries >= 25) { // 5 secondes
        clearInterval(interval)
        setState(prev => ({ ...prev, isLoading: false, error: "SDK Pi non trouvé" }))
      }
      retries++
    }, 200)

    return () => clearInterval(interval)
  }, [isPiAvailable])

  return {
    ...state,
    isPiAvailable,
    initSDK,
    authenticate,
    createPayment,
    logout,
  }
}

// Export par défaut
export default usePiSDK