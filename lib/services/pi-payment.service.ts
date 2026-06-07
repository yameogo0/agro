// lib/services/pi-payment.service.ts

import { PI_CONFIG } from '@/lib/constants/config'

// Types
export interface PiPaymentRequest {
  amount: number
  memo: string
  metadata?: Record<string, any>
}

export interface PiPaymentResponse {
  identifier: string
  status: 'pending' | 'completed' | 'failed'
  amount: number
  memo: string
  txid?: string
  createdAt: string
  completedAt?: string
}

export interface PiPaymentStatus {
  identifier: string
  status: 'pending' | 'completed' | 'failed'
  amount: number
  memo: string
  txid?: string
}

/**
 * Service de paiement Pi Network
 */
class PiPaymentService {
  private static instance: PiPaymentService
  private initialized: boolean = false
  private sandboxMode: boolean = true

  private constructor() {}

  /**
   * Récupère l'instance unique du service (Singleton)
   */
  public static getInstance(): PiPaymentService {
    if (!PiPaymentService.instance) {
      PiPaymentService.instance = new PiPaymentService()
    }
    return PiPaymentService.instance
  }

  /**
   * Vérifie si le SDK Pi est disponible
   */
  public isPiSDKAvailable(): boolean {
    if (typeof window === 'undefined') return false
    return !!window.Pi
  }

  /**
   * Vérifie si l'utilisateur est dans Pi Browser
   */
  public isPiBrowser(): boolean {
    if (typeof window === 'undefined') return false
    return this.isPiSDKAvailable() || navigator.userAgent.includes('PiBrowser')
  }

  /**
   * Initialise le SDK Pi
   */
  public async init(sandbox: boolean = true): Promise<boolean> {
    if (!this.isPiSDKAvailable()) {
      console.error('SDK Pi non disponible')
      return false
    }

    this.sandboxMode = sandbox

    try {
      await window.Pi!.init({
        version: PI_CONFIG.version,
        sandbox: this.sandboxMode,
      })
      this.initialized = true
      console.log('✅ Pi SDK initialisé avec succès')
      return true
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du SDK Pi:', error)
      return false
    }
  }

  /**
   * Authentifie l'utilisateur avec Pi Network
   */
  public async authenticate(scopes: string[] = PI_CONFIG.authScopes): Promise<{ accessToken: string; user: { uid: string; username: string } } | null> {
    if (!this.isPiSDKAvailable()) {
      throw new Error('SDK Pi non disponible')
    }

    if (!this.initialized) {
      await this.init(this.sandboxMode)
    }

    try {
      const result = await window.Pi!.authenticate(scopes, {
        onIncomplete: (error) => {
          console.error('Authentification incomplète:', error)
        },
      })

      if (result?.accessToken && result?.user) {
        // Sauvegarder les informations
        localStorage.setItem('pi_access_token', result.accessToken)
        localStorage.setItem('pi_user', JSON.stringify(result.user))
        return result
      }
      return null
    } catch (error) {
      console.error('Erreur lors de l\'authentification:', error)
      throw error
    }
  }

  /**
   * Crée un paiement Pi
   */
  public async createPayment(request: PiPaymentRequest): Promise<PiPaymentResponse | null> {
    if (!this.isPiSDKAvailable()) {
      throw new Error('SDK Pi non disponible. Veuillez ouvrir dans Pi Browser.')
    }

    if (!this.initialized) {
      await this.init(this.sandboxMode)
    }

    try {
      const payment = await window.Pi!.createPayment({
        amount: request.amount,
        memo: request.memo,
        metadata: {
          ...PI_CONFIG.paymentMetadata,
          ...request.metadata,
          timestamp: Date.now(),
        },
      })

      if (payment?.identifier) {
        // Sauvegarder la transaction
        this.saveTransaction({
          identifier: payment.identifier,
          status: 'pending',
          amount: request.amount,
          memo: request.memo,
          createdAt: new Date().toISOString(),
          txid: payment.txid,
        })

        return {
          identifier: payment.identifier,
          status: 'pending',
          amount: request.amount,
          memo: request.memo,
          txid: payment.txid,
          createdAt: new Date().toISOString(),
        }
      }
      return null
    } catch (error) {
      console.error('Erreur lors de la création du paiement:', error)
      throw error
    }
  }

  /**
   * Vérifie le statut d'un paiement
   */
  public async getPaymentStatus(paymentId: string): Promise<PiPaymentStatus | null> {
    const transactions = this.getTransactions()
    const transaction = transactions.find(t => t.identifier === paymentId)

    if (transaction) {
      return {
        identifier: transaction.identifier,
        status: transaction.status,
        amount: transaction.amount,
        memo: transaction.memo,
        txid: transaction.txid,
      }
    }

    // Si non trouvé en local, on simule (à remplacer par appel API)
    return {
      identifier: paymentId,
      status: 'completed',
      amount: 0,
      memo: '',
    }
  }

  /**
   * Sauvegarde une transaction en localStorage
   */
  private saveTransaction(transaction: PiPaymentResponse): void {
    const transactions = this.getTransactions()
    transactions.unshift(transaction)
    localStorage.setItem('pi_transactions', JSON.stringify(transactions))
  }

  /**
   * Récupère toutes les transactions
   */
  public getTransactions(): PiPaymentResponse[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem('pi_transactions')
    return data ? JSON.parse(data) : []
  }

  /**
   * Récupère l'utilisateur connecté
   */
  public getUser(): { uid: string; username: string } | null {
    if (typeof window === 'undefined') return null
    const user = localStorage.getItem('pi_user')
    return user ? JSON.parse(user) : null
  }

  /**
   * Récupère le token d'accès
   */
  public getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('pi_access_token')
  }

  /**
   * Déconnecte l'utilisateur
   */
  public logout(): void {
    localStorage.removeItem('pi_access_token')
    localStorage.removeItem('pi_user')
    this.initialized = false
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  public isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getUser()
  }

  /**
   * Récupère l'adresse du portefeuille
   */
  public getWalletAddress(): string | null {
    const user = this.getUser()
    if (user?.uid) {
      // Pour le testnet, l'adresse est dérivée de l'UID
      return `PI_${user.uid.substring(0, 8)}...${user.uid.substring(user.uid.length - 4)}`
    }
    return null
  }
}

// Export de l'instance unique
export const piPaymentService = PiPaymentService.getInstance()

// Export par défaut
export default piPaymentService