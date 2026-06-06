// lib/pi-init.ts

export const initPiSDK = async (sandbox: boolean = true): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  // Attendre que le SDK soit disponible (max 5 secondes)
  let retries = 0;
  while (!window.Pi && retries < 50) {
    await new Promise(resolve => setTimeout(resolve, 100));
    retries++;
  }
  
  if (!window.Pi) {
    console.error("SDK Pi non trouvé après 5 secondes");
    return false;
  }
  
  try {
    await window.Pi.init({ version: '2.0', sandbox });
    console.log("Pi SDK initialisé");
    return true;
  } catch (err) {
    console.error("Erreur init Pi SDK:", err);
    return false;
  }
};