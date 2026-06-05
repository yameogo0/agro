// lib/subscription/tax-utils.ts

import { TRANSACTION_TAX_RATE } from './subscription-constants'

export interface TaxResult {
  tax: number
  netAmount: number
  rate: number
}

/**
 * Calcule la taxe sur une transaction pour un vendeur membre vif
 * @param amount - Montant de la transaction
 * @param isVifSeller - true si le vendeur est membre vif
 * @returns { tax, netAmount, rate }
 */
export const calculateTransactionTax = (amount: number, isVifSeller: boolean): TaxResult => {
  if (!isVifSeller) {
    // Un non-vif ne peut pas vendre, donc la transaction ne devrait pas avoir lieu
    // On retourne 0 pour sécurité
    return { tax: 0, netAmount: amount, rate: 0 }
  }
  const tax = amount * TRANSACTION_TAX_RATE
  const netAmount = amount - tax
  return { tax, netAmount, rate: TRANSACTION_TAX_RATE }
}

/**
 * Applique la taxe et retourne le montant net à créditer au vendeur
 */
export const applySellerTax = (amount: number, isVifSeller: boolean): number => {
  return calculateTransactionTax(amount, isVifSeller).netAmount
}

/**
 * Calcule le montant de taxe à prélever
 */
export const calculateTaxAmount = (amount: number, isVifSeller: boolean): number => {
  if (!isVifSeller) return 0
  return amount * TRANSACTION_TAX_RATE
}