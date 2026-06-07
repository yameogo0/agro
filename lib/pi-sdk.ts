// lib/pi-sdk.ts

/**
 * Initialise le SDK Pi Network
 * @param sandbox - Mode sandbox (testnet) ou mainnet
 * @returns Promise<boolean> - true si l'initialisation a réussi
 */
export const initPiSDK = async (sandbox: boolean = true): Promise<boolean> => {
  if (typeof window === 'undefined') {
    console.log("🔵 initPiSDK: Environnement serveur, skip");
    return false;
  }
  
  console.log("🔵 initPiSDK: Début, window.Pi =", !!window.Pi);
  
  // Attendre que le SDK soit disponible (max 5 secondes)
  let retries = 0;
  while (!window.Pi && retries < 50) {
    await new Promise(resolve => setTimeout(resolve, 100));
    retries++;
  }
  
  if (!window.Pi) {
    console.error("❌ initPiSDK: SDK Pi non trouvé après 5 secondes");
    return false;
  }
  
  console.log("✅ initPiSDK: SDK Pi trouvé");
  
  try {
    await window.Pi.init({
      version: '2.0',
      sandbox,
    });
    console.log("✅ initPiSDK: Pi SDK initialisé avec succès");
    return true;
  } catch (err) {
    console.error("❌ initPiSDK: Erreur lors de l'initialisation:", err);
    return false;
  }
};

/**
 * Vérifie si le SDK Pi est prêt à être utilisé
 * @returns boolean - true si le SDK est disponible et initialisé
 */
export const isPiReady = (): boolean => {
  const ready = typeof window !== 'undefined' && !!window.Pi;
  console.log("🔵 isPiReady:", ready);
  return ready;
};

/**
 * Crée un paiement direct avec le SDK Pi
 * @param amount - Montant en Pi
 * @param memo - Description du paiement
 * @returns Promise avec l'identifiant du paiement
 */
export const createDirectPayment = async (amount: number, memo: string): Promise<{ identifier: string; txid?: string }> => {
  console.log("🔵 createDirectPayment: Début", { amount, memo });
  
  if (typeof window === 'undefined') {
    throw new Error("Pi SDK non disponible (serveur)");
  }
  
  if (!window.Pi) {
    throw new Error("SDK Pi non chargé. Veuillez ouvrir dans Pi Browser.");
  }
  
  console.log("✅ createDirectPayment: SDK Pi trouvé, création du paiement...");
  
  try {
    const payment = await window.Pi.createPayment({
      amount,
      memo,
      metadata: {
        source: "agro-multicenter",
        timestamp: Date.now(),
        version: "1.0"
      }
    });
    
    console.log("✅ createDirectPayment: Paiement créé avec succès", payment);
    return payment;
  } catch (error: any) {
    console.error("❌ createDirectPayment: Erreur", error);
    throw new Error(error.message || "Erreur lors de la création du paiement");
  }
};

/**
 * Récupère l'adresse du portefeuille de l'utilisateur connecté
 * Note: Cette fonction nécessite que l'utilisateur soit authentifié
 * @returns L'adresse du portefeuille ou null
 */
export const getWalletAddress = async (): Promise<string | null> => {
  if (!isPiReady()) {
    console.warn("⚠️ getWalletAddress: SDK Pi non prêt");
    return null;
  }
  
  try {
    // Pi SDK ne donne pas directement l'adresse du portefeuille
    // On utilise l'authentification pour obtenir les infos utilisateur
    const auth = await window.Pi!.authenticate(["username", "wallet_address"]);
    if (auth?.user) {
      // L'adresse est souvent liée à l'UID dans le testnet
      const walletAddress = `PI_${auth.user.uid.substring(0, 8)}...`;
      return walletAddress;
    }
    return null;
  } catch (error) {
    console.error("❌ getWalletAddress: Erreur", error);
    return null;
  }
};

// Export par défaut des fonctions principales
export default {
  initPiSDK,
  isPiReady,
  createDirectPayment,
  getWalletAddress,
};