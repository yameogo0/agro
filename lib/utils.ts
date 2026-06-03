import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============ TOAST NOTIFICATIONS ============

type ToastType = "success" | "error" | "warning" | "info"

let toastContainer: HTMLDivElement | null = null

const getToastContainer = () => {
  if (typeof document === "undefined") return null
  
  if (!toastContainer) {
    toastContainer = document.createElement("div")
    toastContainer.className = "fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    document.body.appendChild(toastContainer)
  }
  return toastContainer
}

const removeToast = (toast: HTMLDivElement) => {
  toast.classList.add("opacity-0", "translate-x-full")
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove()
    }
  }, 300)
}

export function showToast(message: string, type: ToastType = "info", duration: number = 4000) {
  if (typeof document === "undefined") return
  
  const container = getToastContainer()
  if (!container) return

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  }

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  }

  const toast = document.createElement("div")
  toast.className = `
    flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white
    ${colors[type]} transform transition-all duration-300
    translate-x-0 opacity-100 min-w-[200px] max-w-[350px]
  `
  toast.innerHTML = `
    <span class="text-lg">${icons[type]}</span>
    <span class="text-sm font-medium flex-1">${message}</span>
    <button class="ml-4 text-white/80 hover:text-white">✕</button>
  `

  const closeBtn = toast.querySelector("button")
  closeBtn?.addEventListener("click", () => removeToast(toast))

  container.appendChild(toast)

  setTimeout(() => {
    if (toast.parentNode) {
      removeToast(toast)
    }
  }, duration)
}

// ============ FORMATAGE DES DATES ============

export function formatDate(date: Date | string, locale = "fr-FR"): string {
  const d = new Date(date)
  return d.toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export function formatDateTime(date: Date | string, locale = "fr-FR"): string {
  const d = new Date(date)
  return d.toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const d = new Date(date)
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} minute${minutes > 1 ? "s" : ""}`
  if (hours < 24) return `il y a ${hours} heure${hours > 1 ? "s" : ""}`
  if (days < 7) return `il y a ${days} jour${days > 1 ? "s" : ""}`
  if (weeks < 4) return `il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`
  if (months < 12) return `il y a ${months} mois`
  return `il y a ${years} an${years > 1 ? "s" : ""}`
}

export function formatTime(date: Date | string, locale = "fr-FR"): string {
  const d = new Date(date)
  return d.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ============ FORMATAGE DES NOMBRES ============

export function formatNumber(num: number, locale = "fr-FR"): string {
  return num.toLocaleString(locale)
}

export function formatPiAmount(amount: number): string {
  return `${amount.toFixed(4)} π`
}

export function formatCurrency(amount: number, currency = "XOF", locale = "fr-FR"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount)
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return "0%"
  return `${((value / total) * 100).toFixed(1)}%`
}

// ============ MANIPULATION DE TEXTE ============

export function truncate(str: string, length: number): string {
  if (!str) return ""
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

export function capitalize(str: string): string {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

// ============ VALIDATIONS ============

export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/
  return regex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const regex = /^[+]?[0-9]{8,15}$/
  return regex.test(phone)
}

export function isValidPiAddress(address: string): boolean {
  return address.length >= 56 && /^[A-Z0-9]+$/.test(address)
}

// ============ UTILITAIRES ============

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), delay)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function getInitials(name: string): string {
  if (!name) return ""
  return name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    showToast("Copié dans le presse-papiers", "success")
    return true
  } catch {
    showToast("Erreur lors de la copie", "error")
    return false
  }
}

// ============ GESTION DES ERREURS ============

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  return "Une erreur inattendue est survenue"
}

// ============ STOCKAGE LOCAL ============

export function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof localStorage === "undefined") return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setLocalStorageItem<T>(key: string, value: T): void {
  if (typeof localStorage === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error("Error saving to localStorage:", error)
  }
}