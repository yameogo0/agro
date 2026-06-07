"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, CheckCircle, XCircle, Loader2 } from "lucide-react";

const SUBSCRIPTION_PRICE = 1;
const SUBSCRIPTION_DURATION_DAYS = 30;

export default function SubscriptionPage() {
  const [isVif, setIsVif] = useState(false);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Vérifier le statut Vif
  useEffect(() => {
    const data = localStorage.getItem("subscription_vif");
    if (data) {
      const sub = JSON.parse(data);
      const valid = sub.isVif && new Date(sub.expiryDate) > new Date();
      setIsVif(valid);
      setExpiryDate(sub.expiryDate);
    }
  }, []);

  const remainingDays = expiryDate
    ? Math.max(0, Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const handleSubscribe = async () => {
    alert("1. Bouton cliqué - Vérification SDK Pi...");
    
    // Attendre un peu que le SDK soit chargé
    if (!window.Pi) {
      alert("❌ SDK Pi non trouvé. Attendez 2 secondes et réessayez...");
      // Attendre 2 secondes et réessayer
      setTimeout(() => {
        if (window.Pi) {
          alert("✅ SDK Pi maintenant disponible ! Réessayez.");
        } else {
          alert("❌ SDK Pi toujours absent. Êtes-vous bien dans Pi Browser ?");
        }
      }, 2000);
      return;
    }
    
    alert("✅ SDK Pi trouvé ! Tentative de paiement...");
    setIsProcessing(true);
    
    try {
      const payment = await window.Pi.createPayment({
        amount: SUBSCRIPTION_PRICE,
        memo: `Abonnement Membre Vif (${SUBSCRIPTION_DURATION_DAYS} jours)`,
        metadata: { source: "agro-multicenter", type: "subscription" }
      });
      
      alert(`Paiement réussi ! ID: ${payment.identifier}`);
      
      // Sauvegarder l'abonnement
      const now = new Date();
      const expiry = new Date();
      expiry.setDate(now.getDate() + SUBSCRIPTION_DURATION_DAYS);
      localStorage.setItem("subscription_vif", JSON.stringify({
        isVif: true,
        startDate: now.toISOString(),
        expiryDate: expiry.toISOString(),
        transactionId: payment.identifier,
      }));
      
      setIsVif(true);
      setExpiryDate(expiry.toISOString());
      alert("👑 Félicitations ! Vous êtes maintenant Membre Vif !");
      
    } catch (err: any) {
      alert(`❌ Erreur: ${err.message || err}`);
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <Card>
        <CardHeader className="text-center">
          <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
          <CardTitle className="text-2xl font-bold">Statut Membre Vif</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
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

          {isVif && expiryDate && (
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p>Expire le {new Date(expiryDate).toLocaleDateString()}</p>
              <p className="text-2xl font-bold">{remainingDays} jours restants</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="border p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">✨ Membre Vif</h3>
              <ul className="space-y-1">
                <li>✅ Proposer des services</li>
                <li>✅ Vendre des produits</li>
                <li>✅ Recevoir des Pi dans les conversations</li>
                <li>✅ Taxe de vente 0.99%</li>
              </ul>
            </div>
            <div className="border p-4 rounded-lg bg-gray-50">
              <h3 className="font-bold text-lg mb-2">📋 Compte Gratuit</h3>
              <ul className="space-y-1">
                <li>🔍 Consultation des services</li>
                <li>🛒 Achat de services/produits</li>
                <li>💬 Conversations simples</li>
              </ul>
            </div>
          </div>

          <Button
            onClick={handleSubscribe}
            disabled={isProcessing}
            className="w-full bg-purple-600 hover:bg-purple-700 py-6 text-lg"
          >
            {isProcessing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Crown className="h-5 w-5 mr-2" />}
            {isVif ? "Prolonger l'abonnement (1 π)" : "Devenir Membre Vif (1 π)"}
          </Button>

          <p className="text-center text-xs text-gray-400">
            Paiement sécurisé via Pi Network
          </p>
        </CardContent>
      </Card>
    </div>
  );
}