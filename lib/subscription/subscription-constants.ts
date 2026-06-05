// lib/subscription/subscription-constants.ts

export const SUBSCRIPTION_PRICE = 1 // 1 π par mois
export const TRANSACTION_TAX_RATE = 0.0099 // 0.99%
export const SUBSCRIPTION_DURATION_DAYS = 30 // 30 jours

export const VIF_FEATURES = {
  canCreateServices: true,
  canSell: true,
  canReceivePiInMessages: true,
  reducedTaxRate: true, // mais la taxe s'applique aux ventes (0.99%)
}

export const NON_VIF_FEATURES = {
  canCreateServices: false,
  canSell: false, // ne peut pas vendre (mais peut acheter)
  canReceivePiInMessages: false,
}