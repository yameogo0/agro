// lib/subscription/index.ts

// Constantes
export {
  SUBSCRIPTION_PRICE,
  TRANSACTION_TAX_RATE,
  SUBSCRIPTION_DURATION_DAYS,
  VIF_FEATURES,
  NON_VIF_FEATURES,
} from './subscription-constants'

// Storage
export {
  getSubscription,
  saveSubscription,
  activateVif,
  isSubscriptionValid,
  renewSubscription,
  type SubscriptionData,
} from './subscription-storage'

// Tax Utils
export {
  calculateTransactionTax,
  applySellerTax,
  calculateTaxAmount,
  type TaxResult,
} from './tax-utils'