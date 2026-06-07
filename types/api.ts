// lib/api.ts

import { API_CONFIG, LIMITS_CONFIG } from './constants/config'
import { showToast } from './utils'

// ============ Types ============
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  status: number
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}

// ============ Configuration ============
const API_BASE_URL = API_CONFIG.apiUrl || '/api'
const DEFAULT_TIMEOUT = 30000 // 30 secondes

// ============ Utilitaires ============
const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  // Ajouter le token d'authentification si disponible
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('pi_access_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  return headers
}

const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const status = response.status
  let data: any = {}

  try {
    data = await response.json()
  } catch {
    data = {}
  }

  if (response.ok && (status === 200 || status === 201)) {
    return {
      success: true,
      data: data.data || data,
      message: data.message,
      status,
    }
  }

  // Gestion des erreurs
  let errorMessage = 'Une erreur est survenue'

  switch (status) {
    case 400:
      errorMessage = data.message || 'Requête invalide'
      break
    case 401:
      errorMessage = 'Non autorisé. Veuillez vous reconnecter.'
      // Rediriger vers la connexion
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pi_access_token')
        localStorage.removeItem('pi_user')
        window.location.href = '/'
      }
      break
    case 403:
      errorMessage = 'Accès interdit'
      break
    case 404:
      errorMessage = 'Ressource non trouvée'
      break
    case 422:
      errorMessage = data.message || 'Données invalides'
      break
    case 429:
      errorMessage = 'Trop de requêtes. Veuillez réessayer plus tard.'
      break
    case 500:
      errorMessage = 'Erreur interne du serveur'
      break
    default:
      errorMessage = data.message || data.error || 'Erreur inconnue'
  }

  return {
    success: false,
    error: errorMessage,
    message: data.message,
    status,
  }
}

const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number = DEFAULT_TIMEOUT): Promise<Response> => {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

// ============ Méthodes API ============

/**
 * Requête GET
 */
export async function apiGet<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: getHeaders(),
      ...options,
    })
    return handleResponse<T>(response)
  } catch (error: any) {
    console.error(`API GET Error [${endpoint}]:`, error)
    const errorMessage = error.name === 'AbortError' ? 'Timeout de la requête' : error.message || 'Erreur réseau'
    return {
      success: false,
      error: errorMessage,
      status: 0,
    }
  }
}

/**
 * Requête POST
 */
export async function apiPost<T = any>(
  endpoint: string,
  data?: any,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
    return handleResponse<T>(response)
  } catch (error: any) {
    console.error(`API POST Error [${endpoint}]:`, error)
    const errorMessage = error.name === 'AbortError' ? 'Timeout de la requête' : error.message || 'Erreur réseau'
    return {
      success: false,
      error: errorMessage,
      status: 0,
    }
  }
}

/**
 * Requête PUT
 */
export async function apiPut<T = any>(
  endpoint: string,
  data?: any,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetchWithTimeout(url, {
      method: 'PUT',
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
    return handleResponse<T>(response)
  } catch (error: any) {
    console.error(`API PUT Error [${endpoint}]:`, error)
    const errorMessage = error.name === 'AbortError' ? 'Timeout de la requête' : error.message || 'Erreur réseau'
    return {
      success: false,
      error: errorMessage,
      status: 0,
    }
  }
}

/**
 * Requête PATCH
 */
export async function apiPatch<T = any>(
  endpoint: string,
  data?: any,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetchWithTimeout(url, {
      method: 'PATCH',
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
    return handleResponse<T>(response)
  } catch (error: any) {
    console.error(`API PATCH Error [${endpoint}]:`, error)
    const errorMessage = error.name === 'AbortError' ? 'Timeout de la requête' : error.message || 'Erreur réseau'
    return {
      success: false,
      error: errorMessage,
      status: 0,
    }
  }
}

/**
 * Requête DELETE
 */
export async function apiDelete<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetchWithTimeout(url, {
      method: 'DELETE',
      headers: getHeaders(),
      ...options,
    })
    return handleResponse<T>(response)
  } catch (error: any) {
    console.error(`API DELETE Error [${endpoint}]:`, error)
    const errorMessage = error.name === 'AbortError' ? 'Timeout de la requête' : error.message || 'Erreur réseau'
    return {
      success: false,
      error: errorMessage,
      status: 0,
    }
  }
}

// ============ API Spécifiques ============

/**
 * Géolocalisation
 */
export const geolocationApi = {
  reverseGeocode: async (lat: number, lng: number) => {
    const url = `${API_CONFIG.nominatimUrl}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`
    try {
      const response = await fetch(url)
      const data = await response.json()
      return {
        success: true,
        data: {
          country: data.address?.country,
          region: data.address?.state || data.address?.region,
          city: data.address?.city || data.address?.town || data.address?.village,
          displayName: data.display_name,
        },
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      return { success: false, error: 'Erreur de géocodage' }
    }
  },
}

/**
 * Météo
 */
export const weatherApi = {
  getCurrentWeather: async (lat: number, lng: number) => {
    if (!API_CONFIG.weatherApiKey) {
      return { success: false, error: 'Clé API météo non configurée' }
    }
    const url = `${API_CONFIG.weatherApiUrl}/weather?lat=${lat}&lon=${lng}&appid=${API_CONFIG.weatherApiKey}&units=metric&lang=fr`
    try {
      const response = await fetch(url)
      const data = await response.json()
      return {
        success: true,
        data: {
          temperature: data.main?.temp,
          humidity: data.main?.humidity,
          condition: data.weather?.[0]?.description,
          icon: data.weather?.[0]?.icon,
          windSpeed: data.wind?.speed,
        },
      }
    } catch (error) {
      console.error('Weather API error:', error)
      return { success: false, error: 'Erreur météo' }
    }
  },
}

/**
 * Paiements Pi
 */
export const paymentApi = {
  createPayment: async (amount: number, memo: string, metadata?: Record<string, any>) => {
    return apiPost('/pi/create-payment', { amount, memo, metadata })
  },
  
  getPaymentStatus: async (paymentId: string) => {
    return apiGet(`/pi/get-payment?paymentId=${paymentId}`)
  },
  
  verifyPayment: async (paymentId: string) => {
    return apiGet(`/pi/verify-payment?paymentId=${paymentId}`)
  },
  
  completePayment: async (paymentId: string, transactionId: string) => {
    return apiPost('/pi/complete-payment', { paymentId, transactionId })
  },
}

// ============ Export par défaut ============
export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
  geolocation: geolocationApi,
  weather: weatherApi,
  payment: paymentApi,
}