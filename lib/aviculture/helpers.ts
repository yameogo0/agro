// lib/aviculture/helpers.ts

import { PoultryBatch, FeedStock, AnalyticsData } from './types'

/**
 * Calcule le taux de mortalité d'un lot
 */
export const calculateMortalityRate = (batch: PoultryBatch): number => {
  if (batch.initialCount === 0) return 0
  return (batch.mortality / batch.initialCount) * 100
}

/**
 * Calcule l'efficacité alimentaire (conversion kg aliment / kg viande)
 */
export const calculateFeedEfficiency = (batch: PoultryBatch): number => {
  if (!batch.weight || batch.count === 0) return 0
  const totalWeight = batch.weight * batch.count
  if (totalWeight === 0) return 0
  return batch.feedConsumption / totalWeight
}

/**
 * Calcule le taux de ponte
 */
export const calculateEggProductionRate = (batch: PoultryBatch): number => {
  if (!batch.eggProduction || batch.count === 0) return 0
  return (batch.eggProduction / batch.count) * 100
}

/**
 * Calcule la valeur totale du stock d'aliments
 */
export const calculateTotalFeedValue = (feedStock: FeedStock[]): number => {
  return feedStock.reduce((sum, f) => sum + (f.currentStock * f.pricePerUnit), 0)
}

/**
 * Formate une date pour l'affichage
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

/**
 * Formate une date relative (ex: "il y a 2 jours")
 */
export const formatRelativeDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return "Hier"
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`
    if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`
    return `Il y a ${Math.floor(diffDays / 365)} ans`
  } catch {
    return dateString
  }
}

/**
 * Vérifie si une échéance est dépassée
 */
export const isOverdue = (dateString: string): boolean => {
  if (!dateString) return false
  return new Date(dateString) < new Date()
}

/**
 * Génère des données pour les graphiques (évolution)
 */
export const generateChartData = (batches: PoultryBatch[]): AnalyticsData[] => {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  return months.map(month => ({
    date: month,
    mortality: Math.floor(Math.random() * 50),
    feedEfficiency: 1.5 + Math.random(),
    eggProduction: 300 + Math.random() * 100,
    weight: 1.5 + Math.random(),
  }))
}

/**
 * Statut d'un lot avec couleur
 */
export const getBatchStatusInfo = (status: string) => {
  switch (status) {
    case 'active':
      return { label: 'Actif', color: 'bg-green-100 text-green-700', icon: '🐤' }
    case 'completed':
      return { label: 'Terminé', color: 'bg-blue-100 text-blue-700', icon: '✅' }
    case 'culled':
      return { label: 'Réformé', color: 'bg-red-100 text-red-700', icon: '⚠️' }
    default:
      return { label: status, color: 'bg-gray-100 text-gray-700', icon: '📋' }
  }
}

/**
 * Type d'enregistrement santé avec icône
 */
export const getHealthTypeInfo = (type: string) => {
  switch (type) {
    case 'vaccination':
      return { label: 'Vaccination', icon: '💉', color: 'bg-blue-100 text-blue-700' }
    case 'treatment':
      return { label: 'Traitement', icon: '💊', color: 'bg-green-100 text-green-700' }
    case 'checkup':
      return { label: 'Contrôle', icon: '🩺', color: 'bg-purple-100 text-purple-700' }
    case 'alert':
      return { label: 'Alerte', icon: '⚠️', color: 'bg-red-100 text-red-700' }
    default:
      return { label: type, icon: '📋', color: 'bg-gray-100 text-gray-700' }
  }
}

/**
 * Type d'aliment avec icône
 */
export const getFeedTypeInfo = (type: string) => {
  switch (type) {
    case 'starter':
      return { label: 'Démarrage', icon: '🌱', stage: '0-4 semaines' }
    case 'grower':
      return { label: 'Croissance', icon: '📈', stage: '4-12 semaines' }
    case 'layer':
      return { label: 'Ponte', icon: '🥚', stage: '12+ semaines' }
    case 'finisher':
      return { label: 'Finition', icon: '🍗', stage: '8-12 semaines' }
    default:
      return { label: type, icon: '🌾', stage: '' }
  }
}

/**
 * Calcule les statistiques globales
 */
export const calculateGlobalStats = (batches: PoultryBatch[], feedStock: FeedStock[]) => {
  const activeBatches = batches.filter(b => b.status === 'active')
  const totalBirds = activeBatches.reduce((sum, b) => sum + b.count, 0)
  const totalMortality = batches.reduce((sum, b) => sum + b.mortality, 0)
  const totalFeedStock = feedStock.reduce((sum, f) => sum + f.currentStock, 0)
  const feedValue = calculateTotalFeedValue(feedStock)
  const avgEggs = batches.filter(b => b.eggProduction).reduce((sum, b) => sum + (b.eggProduction || 0), 0)
  
  return {
    totalBirds,
    activeBatches: activeBatches.length,
    totalMortality,
    mortalityRate: (totalBirds + totalMortality) > 0 ? (totalMortality / (totalBirds + totalMortality)) * 100 : 0,
    totalFeedStock,
    feedValue,
    averageEggProduction: avgEggs,
  }
}

/**
 * Formate l'heure pour l'affichage
 */
export const formatTime = (timeString?: string): string => {
  if (!timeString) return '--:--'
  return timeString
}

/**
 * Calcule le nombre de jours entre deux dates
 */
export const daysBetween = (startDate: string, endDate: string): number => {
  try {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  } catch {
    return 0
  }
}

/**
 * Vérifie si un lot est en âge de produire des œufs
 */
export const isLayingAge = (batch: PoultryBatch): boolean => {
  const days = daysBetween(batch.startDate, new Date().toISOString().split('T')[0])
  return days >= 140 // 20 semaines
}

/**
 * Recommandation basée sur la température
 */
export const getTemperatureAdvice = (temperature: number): string => {
  if (temperature < 18) return "❄️ Température trop basse - Augmentez le chauffage"
  if (temperature > 30) return "🔥 Température trop élevée - Augmentez la ventilation"
  return "✅ Température idéale"
}

/**
 * Recommandation basée sur l'humidité
 */
export const getHumidityAdvice = (humidity: number): string => {
  if (humidity < 40) return "💨 Air trop sec - Augmentez l'humidité"
  if (humidity > 70) return "💧 Air trop humide - Risques de maladies respiratoires"
  return "✅ Humidité idéale"
}