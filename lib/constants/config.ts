// lib/constants/config.ts

// ============ Configuration de l'Application ============
export const APP_CONFIG = {
  // Informations générales
  name: "AGRO MULTICENTER HINOS",
  shortName: "Agro MC",
  version: "2.1.0",
  description: "Plateforme agricole connectée - Pi Network",
  
  // URLs
  url: process.env.NEXT_PUBLIC_APP_URL || "https://agro-multicenter.vercel.app",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  
  // Environnement
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
  
  // Contact
  supportEmail: "support@agromc.com",
  supportPhone: "+226 70 00 00 00",
}

// ============ Configuration Pi Network ============
export const PI_CONFIG = {
  // SDK Pi
  sdkUrl: "https://sdk.minepi.com/pi-sdk.js",
  version: "2.0",
  sandbox: true, // Mode testnet (à mettre à false pour mainnet)
  
  // Scopes d'authentification
  authScopes: ["username", "wallet_address"],
  
  // Paiements
  paymentMetadata: {
    source: APP_CONFIG.shortName,
    version: APP_CONFIG.version,
  },
}

// ============ Configuration des Abonnements ============
export const SUBSCRIPTION_CONFIG = {
  price: 1, // 1 π par mois
  durationDays: 30,
  taxRate: 0.0099, // 0.99%
  
  features: {
    canCreateServices: true,
    canSell: true,
    canReceivePiInMessages: true,
    reducedTaxRate: true,
  },
}

// ============ Configuration Géographique ============
export const REGION_CONFIG = {
  defaultCountry: "Burkina Faso",
  defaultCity: "Ouagadougou",
  defaultCurrency: "CFA",
  defaultLanguage: "fr",
  
  // Langues supportées
  supportedLanguages: [
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "pt", name: "Português", flag: "🇵🇹" },
    { code: "es", name: "Español", flag: "🇪🇸" },
  ],
  
  // Thèmes
  supportedThemes: ["light", "dark", "system"],
}

// ============ Configuration des Limites ============
export const LIMITS_CONFIG = {
  // Messages
  maxMessageLength: 2000,
  maxFileSize: 10 * 1024 * 1024, // 10 MB
  allowedFileTypes: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
  
  // Services
  maxServiceTitleLength: 100,
  maxServiceDescriptionLength: 2000,
  maxServiceTags: 5,
  minServicePrice: 0.001,
  maxServicePrice: 1000,
  
  // Produits
  maxProductsPerUser: 50,
  maxProductImages: 5,
  
  // Lots aviculture
  maxBatchesPerUser: 20,
  maxBirdsPerBatch: 10000,
  
  // Paiements
  minPaymentAmount: 0.001,
  maxPaymentAmount: 10000,
  
  // Recherche
  searchDebounceDelay: 300,
  searchMinChars: 2,
}

// ============ Configuration des API ============
export const API_CONFIG = {
  // OpenStreetMap (géolocalisation)
  nominatimUrl: "https://nominatim.openstreetmap.org",
  
  // Météo (à configurer avec votre clé)
  weatherApiKey: process.env.NEXT_PUBLIC_WEATHER_API_KEY || "",
  weatherApiUrl: "https://api.openweathermap.org/data/2.5",
  
  // Pi Network
  piApiUrl: "https://api.minepi.com/v2",
  piApiKey: process.env.PI_API_KEY || "",
}

// ============ Configuration des Cache ============
export const CACHE_CONFIG = {
  // Durées (en millisecondes)
  userDataTTL: 5 * 60 * 1000, // 5 minutes
  servicesTTL: 10 * 60 * 1000, // 10 minutes
  weatherTTL: 30 * 60 * 1000, // 30 minutes
  locationTTL: 5 * 60 * 1000, // 5 minutes
}

// ============ Constantes des Routes ============
export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  aviculture: "/aviculture",
  services: "/services",
  messages: "/messages",
  wallet: "/wallet",
  profile: "/profile",
  regional: "/regional",
  geolocation: "/geolocation",
  subscription: "/subscription",
  settings: "/settings",
}

// ============ Types d'Alerte ============
export const ALERT_TYPES = {
  STOCK: "stock",
  HEALTH: "health",
  VACCINATION: "vaccination",
  WEATHER: "weather",
  MARKET: "market",
  SEASON: "season",
}

// ============ Types de Services ============
export const SERVICE_CATEGORIES = [
  { id: "veterinary", name: "Vétérinaire", icon: "🏥", color: "bg-blue-100" },
  { id: "training", name: "Formation", icon: "🎓", color: "bg-purple-100" },
  { id: "consulting", name: "Conseil", icon: "💡", color: "bg-yellow-100" },
  { id: "equipment", name: "Équipement", icon: "🔧", color: "bg-gray-100" },
  { id: "feed", name: "Alimentation", icon: "🌾", color: "bg-green-100" },
  { id: "processing", name: "Transformation", icon: "🏭", color: "bg-orange-100" },
  { id: "marketing", name: "Marketing", icon: "📈", color: "bg-red-100" },
  { id: "finance", name: "Finance", icon: "💰", color: "bg-emerald-100" },
]

// ============ Types de Volailles ============
export const POULTRY_BREEDS = [
  { id: "isa_brown", name: "Isa Brown", type: "ponte", eggProduction: "haute", weight: "1.8-2.0kg" },
  { id: "cobb_500", name: "Cobb 500", type: "chair", growthRate: "rapide", weight: "2.5-3.0kg" },
  { id: "bovans_brown", name: "Bovans Brown", type: "ponte", eggProduction: "haute", weight: "1.7-1.9kg" },
  { id: "kabir", name: "Kabir", type: "mixte", eggProduction: "moyenne", weight: "2.0-2.5kg" },
  { id: "ross_308", name: "Ross 308", type: "chair", growthRate: "très rapide", weight: "2.8-3.2kg" },
]

// ============ Couleurs par défaut ============
export const COLORS = {
  primary: "#22c55e",
  primaryDark: "#16a34a",
  secondary: "#3b82f6",
  secondaryDark: "#2563eb",
  accent: "#8b5cf6",
  accentDark: "#7c3aed",
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
}

// ============ Messages par défaut ============
export const DEFAULT_MESSAGES = {
  loading: "Chargement en cours...",
  error: "Une erreur est survenue",
  noData: "Aucune donnée disponible",
  noResults: "Aucun résultat trouvé",
  saved: "Enregistré avec succès",
  deleted: "Supprimé avec succès",
  confirmDelete: "Êtes-vous sûr de vouloir supprimer ?",
  sessionExpired: "Session expirée, veuillez vous reconnecter",
}

// Export par défaut
export default {
  APP_CONFIG,
  PI_CONFIG,
  SUBSCRIPTION_CONFIG,
  REGION_CONFIG,
  LIMITS_CONFIG,
  API_CONFIG,
  CACHE_CONFIG,
  ROUTES,
  ALERT_TYPES,
  SERVICE_CATEGORIES,
  POULTRY_BREEDS,
  COLORS,
  DEFAULT_MESSAGES,
}