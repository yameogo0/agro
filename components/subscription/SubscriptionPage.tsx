// components/subscription/SubscriptionPage.tsx

"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, CheckCircle, XCircle, Calendar, Loader2 } from 'lucide-react'
import { useSubscription } from '@/contexts/SubscriptionContext'

export default function SubscriptionPage() {
  const { isVif, remainingDays, subscribe, isLoading, expiryDate } = useSubscription()

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center justify-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            Statut Membre Vif
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            {isVif ? (
              <Badge className="bg-green-100 text-green-700 text-lg py-2 px-6">
                <CheckCircle className="h-5 w-5 mr-2" /> Actif
              </Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-700 text-lg py-2 px-6">
                <XCircle className="h-5 w-5 mr-2" /> Non actif
              </Badge>
            )}
          </div>

          {isVif && (
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg">
              <p className="text-sm">Expire le : {new Date(expiryDate!).toLocaleDateString()}</p>
              <p className="text-2xl font-bold">{remainingDays} jours restants</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">✨ Avantages Membre Vif</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Proposer des services</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Vendre des produits/services</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Recevoir des Pi dans les conversations</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Taxe de vente réduite (0.99%)</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">📋 Membres Gratuits</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-400" /> Consultation des services</li>
                <li className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-400" /> Achat de services/produits</li>
                <li className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-400" /> Conversations simples</li>
              </ul>
            </div>
          </div>

          <Button
            onClick={subscribe}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-6 text-lg"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Crown className="h-5 w-5 mr-2" />}
            {isVif ? 'Prolonger l\'abonnement (1 π / mois)' : 'Devenir Membre Vif (1 π / mois)'}
          </Button>
          <p className="text-xs text-gray-400">Paiement sécurisé via Pi Network. Renouvellement manuel.</p>
        </CardContent>
      </Card>
    </div>
  )
}