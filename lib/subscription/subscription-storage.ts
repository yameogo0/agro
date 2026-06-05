// lib/subscription/subscription-storage.ts

export interface SubscriptionData {
  isVif: boolean
  startDate: string | null
  expiryDate: string | null
  transactionId?: string // ID du paiement Pi
}

const STORAGE_KEY = 'subscription_vif'

export const getSubscription = (): SubscriptionData => {
  if (typeof window === 'undefined') return { isVif: false, startDate: null, expiryDate: null }
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : { isVif: false, startDate: null, expiryDate: null }
}

export const saveSubscription = (data: SubscriptionData) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const activateVif = (durationDays: number = 30, paymentId?: string) => {
  const startDate = new Date().toISOString()
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + durationDays)
  const data: SubscriptionData = {
    isVif: true,
    startDate,
    expiryDate: expiry.toISOString(),
    transactionId: paymentId,
  }
  saveSubscription(data)
  return data
}

export const isSubscriptionValid = (): boolean => {
  const sub = getSubscription()
  if (!sub.isVif || !sub.expiryDate) return false
  const now = new Date()
  const expiry = new Date(sub.expiryDate)
  return now < expiry
}

export const renewSubscription = (paymentId?: string) => {
  if (!isSubscriptionValid()) {
    // si expiré, on réactive
    return activateVif(SUBSCRIPTION_DURATION_DAYS, paymentId)
  } else {
    // si déjà actif, on prolonge
    const sub = getSubscription()
    const currentExpiry = new Date(sub.expiryDate!)
    currentExpiry.setDate(currentExpiry.getDate() + SUBSCRIPTION_DURATION_DAYS)
    const newData: SubscriptionData = {
      isVif: true,
      startDate: sub.startDate,
      expiryDate: currentExpiry.toISOString(),
      transactionId: paymentId,
    }
    saveSubscription(newData)
    return newData
  }
}