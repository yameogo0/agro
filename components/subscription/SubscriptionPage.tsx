"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { usePiAuth } from "@/contexts/pi-auth-context";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { showToast } from "@/lib/utils";

const SUBSCRIPTION_PRICE = 1;
const SUBSCRIPTION_DURATION_DAYS = 30;

export default function SubscriptionPage() {
  const { isAuthenticated, userData, walletAddress } = usePiAuth();
  const isOnline = useOnlineStatus();
  const [isVif, setIsVif] = useState(false);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

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

  // Vérifier la disponibilité du SDK Pi
  useEffect(() => {
    const checkSdk = () => {
      if (typeof window !== "undefined" && window.Pi) {
        setSdkReady(true);
        console.log("✅ SDK Pi disponible");
      } else {
        console.log("⏳ SDK Pi non encore chargé");
        setTimeout(checkSdk, 1000);
      }
    };
    checkSdk();
  }, []);

  const remainingDays = expiryDate
    ? Math.max(0, Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const handleSubscribe = async () => {
    // Vérification 1 : Connexion internet
    if (!isOnline) {
      showToast("Connexion internet requise", "error");
      return;
    }

    // Vérification 2 : Authentification Pi
    if (!isAuthenticated) {
      showToast("Veuillez vous connecter avec Pi Network", "error");
      return;
    }

    // Vérification 3 : Adresse du portefeuille
    if (!walletAddress) {
      showToast("Adresse de portefeuille non trouvée. Reconnectez-vous.", "error");
      return;
    }

    // Vérification 4 : SDK Pi
    if (!sdkReady || typeof window === "undefined" || !window.Pi) {
      showToast("SDK Pi non disponible. Ouvrez dans Pi Browser.", "error");
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log("🔵 Création du paiement...");
      const payment = await window.Pi.createPayment({
        amount: SUBSCRIPTION_PRICE,
        memo: `Abonnement Membre Vif (${SUBSCRIPTION_DURATION_DAYS} jours)`,
        metadata: { 
          source: "agro-multicenter", 
          type: "subscription",
          userId: userData?.id,
          walletAddress: walletAddress
        }
      });
      
      console.log("🔵 Réponse paiement:", payment);
      
      if (payment?.identifier) {
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
        showToast("👑 Félicitations ! Vous êtes maintenant Membre Vif !", "success");
      } else {
        throw new Error("Paiement non confirmé");
      }
    } catch (err: any) {
      console.error("🔴 Erreur:", err);
      showToast(err.message || "Le paiement a échoué", "error");
    } finally {
      setIsProcessing(false);
    }
  };

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
          {/* Statut */}
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

          {/* Expiration */}
          {isVif && expiryDate && (
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-xl text-center">
              <p className="text-sm text-amber-700">Expire le {new Date(expiryDate).toLocaleDateString()}</p>
              <p className="text-3xl font-bold text-amber-800">{remainingDays} jours restants</p>
            </div>
          )}

          {/* Avantages */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-xl p-5 bg-white shadow-sm">
              <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" /> Membre Vif
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5" /> Proposer des services</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5" /> Vendre des produits/services</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5" /> Recevoir des Pi dans les conversations</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-green-500 mt-0.5" /> Taxe de vente 0.99% seulement</li>
              </ul>
            </div>
            <div className="border rounded-xl p-5 bg-gray-50 shadow-sm">
              <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-gray-500" /> Compte Gratuit
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2"><XCircle className="h-5 w-5 text-red-400 mt-0.5" /> Consultation des services</li>
                <li className="flex items-start gap-2"><XCircle className="h-5 w-5 text-red-400 mt-0.5" /> Achat de services/produits</li>
                <li className="flex items-start gap-2"><XCircle className="h-5 w-5 text-red-400 mt-0.5" /> Conversations simples</li>
              </ul>
            </div>
          </div>

          {/* Message si non authentifié */}
          {!isAuthenticated && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-sm text-amber-700">
              <AlertCircle className="h-4 w-4" />
              <span>Connectez-vous avec Pi Network pour devenir Membre Vif</span>
            </div>
          )}

          {/* Message si SDK non prêt */}
          {!sdkReady && isAuthenticated && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2 text-sm text-yellow-700">
              <AlertCircle className="h-4 w-4" />
              <span>Chargement du SDK Pi... Assurez-vous d'être dans Pi Browser.</span>
            </div>
          )}

          {/* Bouton d'abonnement */}
          <Button
            onClick={handleSubscribe}
            disabled={isProcessing || !isAuthenticated || !sdkReady}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-6 text-lg rounded-xl shadow-lg"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Crown className="h-5 w-5 mr-2" />
            )}
            {isVif ? "Prolonger l'abonnement (1 π)" : "Devenir Membre Vif (1 π)"}
          </Button>

          <p className="text-center text-xs text-gray-400">
            Paiement sécurisé via Pi Network. Renouvellement manuel. Sans engagement.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}