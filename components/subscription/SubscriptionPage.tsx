// components/subscription/SubscriptionPage.tsx

"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { usePiAuth } from '@/contexts/pi-auth-context'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { createPiPayment, isPiSDKAvailable } from '@/lib/pi-payments'
import { showToast } from '@/lib/utils'
import { activateVif, isSubscriptionValid } from '@/lib/subscription/subscription-storage'
import { SUBSCRIPTION_PRICE, SUBSCRIPTION_DURATION_DAYS } from '@/lib/subscription/subscription-constants'

export default function SubscriptionPage() {
  const { isVif, remainingDays, isLoading, expiryDate, checkStatus } = useSubscription()
  const { isAuthenticated } = usePiAuth()
  const isOnline = useOnlineStatus()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubscribe = async () => {
    console.log("🔵 Bouton cliqué - Début du processus")
    
    // Vérification 1 : Connexion internet
    if (!isOnline) {
      showToast("Connexion internet requise", "error")
      return
    }
    console.log("✅ Internet OK")

    // Vérification 2 : Authentification Pi
    if (!isAuthenticated) {
      showToast("Veuillez vous connecter avec Pi Network", "error")
      return
    }
    console.log("✅ Authentification OK")

    // Vérification 3 : SDK Pi disponible
    const sdkAvailable = isPiSDKAvailable()
    console.log("SDK Pi disponible ?", sdkAvailable, "window.Pi:", typeof window !== 'undefined' && !!window.Pi)
    
    if (!sdkAvailable) {
      showToast("Veuillez ouvrir cette application dans Pi Browser", "error")
      return
    }
    console.log("✅ SDK Pi OK")

    setIsProcessing(true)
    try {
      console.log("🔵 Création du paiement Pi...")
      const payment = await createPiPayment(
        SUBSCRIPTION_PRICE, 
        `Abonnement Membre Vif (${SUBSCRIPTION_DURATION_DAYS} jours)`
      )
      console.log("🔵 Réponse paiement:", payment)
      
      if (payment?.identifier) {
        console.log("🔵 Paiement réussi, activation Vif...")
        const currentValid = isSubscriptionValid()
        if (currentValid) {
          // Prolonger l'abonnement
          const sub = JSON.parse(localStorage.getItem('subscription_vif') || '{}')
          const newExpiry = new Date(sub.expiryDate)
          newExpiry.setDate(newExpiry.getDate() + SUBSCRIPTION_DURATION_DAYS)
          localStorage.setItem('subscription_vif', JSON.stringify({
            isVif: true,
            startDate: sub.startDate,
            expiryDate: newExpiry.toISOString(),
            transactionId: payment.identifier
          }))
          showToast("✅ Abonnement prolongé de 30 jours !", "success")
        } else {
          // Activer l'abonnement
          activateVif(SUBSCRIPTION_DURATION_DAYS, payment.identifier)
          showToast("👑 Bienvenue Membre Vif !", "success")
        }
        checkStatus()
      } else {
        throw new Error("Transaction non confirmée")
      }
    } catch (err: any) {
      console.error("🔴 Erreur paiement:", err)
      showToast(err.message || "Le paiement a échoué", "error")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <Card className="shadow-xl border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-500 to-amber-600 h-2" />
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Crown className="h-10 w-10 text-yellow-600" />
          </div>
          <CardTitle className="text-3xl font-bold">Statut Membre Vif</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statut actuel */}
          <div className="flex justify-center">
            {isVif ? (
              <Badge className="bg-green-100 text-green-700 text-lg py-2 px-6 rounded-full">
                <CheckCircle className="h-5 w-5 mr-2" /> Actif
              </Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-700 text-lg py-2 px-6 rounded-full">
                <XCircle className="h-5 w-5 mr-2" /> Non actif
              </Badge>
            )}
          </div>

          {isVif && expiryDate && (
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-xl text-center">
              <p className="text-sm text-amber-700">Expire le {new Date(expiryDate).toLocaleDateString()}</p>
              <p className="text-3xl font-bold text-amber-800">{remainingDays} jours restants</p>
            </div>
          )}

          {/* Tableau comparatif */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-xl p-5 bg-white shadow-sm">
              <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" /> Membre Vif
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /> <span>Proposer des services</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /> <span>Vendre des produits/services</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /> <span>Recevoir des Pi dans les conversations</span></li>
                <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /> <span>Taxe de vente 0.99% seulement</span></li>
              </ul>
            </div>
            <div className="border rounded-xl p-5 bg-gray-50 shadow-sm">
              <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-gray-500" /> Compte Gratuit
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2"><XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" /> <span className="text-gray-500">Consultation des services</span></li>
                <li className="flex items-start gap-2"><XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" /> <span className="text-gray-500">Achat de services/produits</span></li>
                <li className="flex items-start gap-2"><XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" /> <span className="text-gray-500">Conversations simples</span></li>
              </ul>
            </div>
          </div>

          {/* Bouton d'abonnement */}
          <Button
            onClick={handleSubscribe}
            disabled={isProcessing || isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-6 text-lg rounded-xl shadow-lg"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Crown className="h-5 w-5 mr-2" />
            )}
            {isVif ? 'Prolonger l\'abonnement (1 π / mois)' : 'Devenir Membre Vif (1 π / mois)'}
          </Button>

          {/* Message d'information si SDK non disponible */}
          {typeof window !== 'undefined' && !window.Pi && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2 text-sm text-yellow-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>Pour effectuer le paiement, veuillez ouvrir cette application dans Pi Browser.</span>
            </div>
          )}

          <p className="text-center text-xs text-gray-400">
            Paiement sécurisé via Pi Network. Renouvellement manuel. Sans engagement.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}