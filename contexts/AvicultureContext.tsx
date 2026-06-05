// contexts/AvicultureContext.tsx

"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { 
  PoultryBatch, HealthRecord, FeedStock, VetService, 
  VetBooking, DailyReport, Alert, FeedOrder 
} from '@/lib/aviculture/types'
import { 
  mockBatches, mockHealthRecords, mockFeedStock, mockVetServices, mockAlerts 
} from '@/lib/aviculture/constants'
import { 
  getBatches, saveBatches, getBatchById, updateBatchStats,
  getHealthRecords, saveHealthRecords,
  getFeedStock, saveFeedStock, updateFeedStockQuantity,
  getFeedOrders, addFeedOrder,
  getVetBookings, addVetBooking, updateVetBookingStatus,
  getDailyReports, addDailyReport,
  getAlerts, addAlert, markAlertAsRead, deleteAlert,
  clearAllAvicultureData
} from '@/lib/aviculture/storage'
import { calculateGlobalStats } from '@/lib/aviculture/helpers'

// ============ Types du contexte ============
interface AvicultureContextType {
  // Données
  batches: PoultryBatch[]
  healthRecords: HealthRecord[]
  feedStock: FeedStock[]
  feedOrders: FeedOrder[]
  vetServices: VetService[]
  vetBookings: VetBooking[]
  dailyReports: DailyReport[]
  alerts: Alert[]
  
  // Statistiques
  stats: {
    totalBirds: number
    activeBatches: number
    totalMortality: number
    mortalityRate: number
    totalFeedStock: number
    feedValue: number
    averageEggProduction: number
  }
  
  // État de chargement
  isLoading: boolean
  
  // Actions Lots
  addBatch: (batch: Omit<PoultryBatch, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateBatch: (batch: PoultryBatch) => void
  deleteBatch: (id: string) => void
  getBatch: (id: string) => PoultryBatch | undefined
  
  // Actions Santé
  addHealthRecord: (record: Omit<HealthRecord, 'id'>) => void
  updateHealthRecord: (record: HealthRecord) => void
  deleteHealthRecord: (id: string) => void
  
  // Actions Alimentation
  updateFeedStock: (stock: FeedStock[]) => void
  addFeedOrder: (order: Omit<FeedOrder, 'id'>) => void
  orderFeed: (feedId: string, quantity: number, paymentId: string) => Promise<boolean>
  
  // Actions Services
  addVetBooking: (booking: Omit<VetBooking, 'id' | 'createdAt'>) => void
  cancelVetBooking: (bookingId: string) => void
  
  // Actions Rapports
  addDailyReport: (report: Omit<DailyReport, 'id'>) => void
  
  // Actions Alertes
  addAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'read'>) => void
  markAlertRead: (alertId: string) => void
  deleteAlert: (alertId: string) => void
  
  // Utilitaires
  refreshData: () => void
  clearAllData: () => void
}

// ============ Création du contexte ============
const AvicultureContext = createContext<AvicultureContextType | undefined>(undefined)

// ============ Provider ============
export const AvicultureProvider = ({ children }: { children: ReactNode }) => {
  // États
  const [isLoading, setIsLoading] = useState(true)
  const [batches, setBatches] = useState<PoultryBatch[]>([])
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([])
  const [feedStock, setFeedStock] = useState<FeedStock[]>([])
  const [feedOrders, setFeedOrders] = useState<FeedOrder[]>([])
  const [vetServices] = useState<VetService[]>(mockVetServices)
  const [vetBookings, setVetBookings] = useState<VetBooking[]>([])
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [stats, setStats] = useState({
    totalBirds: 0,
    activeBatches: 0,
    totalMortality: 0,
    mortalityRate: 0,
    totalFeedStock: 0,
    feedValue: 0,
    averageEggProduction: 0,
  })

  // ============ Rafraîchir toutes les données ============
  const refreshData = useCallback(() => {
    const savedBatches = getBatches()
    setBatches(savedBatches.length ? savedBatches : mockBatches)
    
    const savedHealth = getHealthRecords()
    setHealthRecords(savedHealth.length ? savedHealth : mockHealthRecords)
    
    const savedFeed = getFeedStock()
    setFeedStock(savedFeed.length ? savedFeed : mockFeedStock)
    
    const savedOrders = getFeedOrders()
    setFeedOrders(savedOrders)
    
    const savedBookings = getVetBookings()
    setVetBookings(savedBookings)
    
    const savedReports = getDailyReports()
    setDailyReports(savedReports)
    
    const savedAlerts = getAlerts()
    setAlerts(savedAlerts.length ? savedAlerts : mockAlerts)
    
    setIsLoading(false)
  }, [])

  // ============ Mettre à jour les statistiques ============
  const updateStats = useCallback(() => {
    const newStats = calculateGlobalStats(batches, feedStock)
    setStats(newStats)
  }, [batches, feedStock])

  // ============ Vérifier et créer des alertes automatiques ============
  const checkAndCreateAlerts = useCallback(() => {
    // Alerte stock faible
    feedStock.forEach(feed => {
      if (feed.currentStock <= feed.threshold) {
        const existingAlert = alerts.find(a => 
          a.type === 'stock' && a.title.includes(feed.name)
        )
        if (!existingAlert) {
          const newAlert: Omit<Alert, 'id' | 'createdAt' | 'read'> = {
            type: 'stock',
            severity: feed.currentStock <= feed.threshold / 2 ? 'high' : 'medium',
            title: `Stock faible: ${feed.name}`,
            message: `Il reste ${feed.currentStock} kg de ${feed.name}. Seuil: ${feed.threshold} kg.`,
            actionable: true,
          }
          addAlert(newAlert)
        }
      }
    })

    // Alerte vaccination en retard
    const today = new Date()
    healthRecords.forEach(record => {
      if (record.nextDue && record.status !== 'done') {
        const dueDate = new Date(record.nextDue)
        if (dueDate < today && record.status !== 'overdue') {
          const newAlert: Omit<Alert, 'id' | 'createdAt' | 'read'> = {
            type: 'vaccination',
            severity: 'high',
            title: `Vaccination en retard: ${record.title}`,
            message: `La vaccination ${record.title} était prévue le ${record.nextDue}.`,
            actionable: true,
          }
          addAlert(newAlert)
        }
      }
    })
  }, [feedStock, healthRecords, alerts])

  // ============ Chargement initial ============
  useEffect(() => {
    refreshData()
  }, [refreshData])

  // ============ Mettre à jour les stats quand les données changent ============
  useEffect(() => {
    updateStats()
  }, [batches, feedStock, updateStats])

  // ============ Vérifier les alertes ============
  useEffect(() => {
    if (!isLoading) {
      checkAndCreateAlerts()
    }
  }, [feedStock, healthRecords, isLoading, checkAndCreateAlerts])

  // ============ Actions Lots ============
  const addBatch = (batch: Omit<PoultryBatch, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBatch: PoultryBatch = {
      ...batch,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const newBatches = [newBatch, ...batches]
    setBatches(newBatches)
    saveBatches(newBatches)
  }

  const updateBatch = (batch: PoultryBatch) => {
    const updatedBatch = { ...batch, updatedAt: new Date().toISOString() }
    const newBatches = batches.map(b => b.id === batch.id ? updatedBatch : b)
    setBatches(newBatches)
    saveBatches(newBatches)
  }

  const deleteBatch = (id: string) => {
    const newBatches = batches.filter(b => b.id !== id)
    setBatches(newBatches)
    saveBatches(newBatches)
  }

  const getBatch = (id: string) => getBatchById(id)

  // ============ Actions Santé ============
  const addHealthRecord = (record: Omit<HealthRecord, 'id'>) => {
    const newRecord: HealthRecord = {
      ...record,
      id: Date.now().toString(),
    }
    const newRecords = [newRecord, ...healthRecords]
    setHealthRecords(newRecords)
    saveHealthRecords(newRecords)
  }

  const updateHealthRecord = (record: HealthRecord) => {
    const newRecords = healthRecords.map(r => r.id === record.id ? record : r)
    setHealthRecords(newRecords)
    saveHealthRecords(newRecords)
  }

  const deleteHealthRecord = (id: string) => {
    const newRecords = healthRecords.filter(r => r.id !== id)
    setHealthRecords(newRecords)
    saveHealthRecords(newRecords)
  }

  // ============ Actions Alimentation ============
  const updateFeedStock = (newStock: FeedStock[]) => {
    setFeedStock(newStock)
    saveFeedStock(newStock)
  }

  const handleAddFeedOrder = (order: Omit<FeedOrder, 'id'>) => {
    const newOrder: FeedOrder = {
      ...order,
      id: Date.now().toString(),
    }
    addFeedOrder(newOrder)
    setFeedOrders([newOrder, ...feedOrders])
  }

  const orderFeed = async (feedId: string, quantity: number, paymentId: string): Promise<boolean> => {
    const feed = feedStock.find(f => f.id === feedId)
    if (!feed) return false

    const totalPrice = feed.pricePerUnit * quantity
    
    handleAddFeedOrder({
      feedId,
      quantity,
      totalPrice,
      date: new Date().toISOString(),
      paymentId,
      status: 'completed',
    })
    
    updateFeedStockQuantity(feedId, quantity)
    refreshData()
    return true
  }

  // ============ Actions Services ============
  const handleAddVetBooking = (booking: Omit<VetBooking, 'id' | 'createdAt'>) => {
    const newBooking: VetBooking = {
      ...booking,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    addVetBooking(newBooking)
    setVetBookings([newBooking, ...vetBookings])
  }

  const cancelVetBooking = (bookingId: string) => {
    updateVetBookingStatus(bookingId, 'cancelled')
    setVetBookings(getVetBookings())
  }

  // ============ Actions Rapports ============
  const handleAddDailyReport = (report: Omit<DailyReport, 'id'>) => {
    const newReport: DailyReport = {
      ...report,
      id: Date.now().toString(),
    }
    addDailyReport(newReport)
    setDailyReports([newReport, ...dailyReports])
  }

  // ============ Actions Alertes ============
  const handleAddAlert = (alert: Omit<Alert, 'id' | 'createdAt' | 'read'>) => {
    const newAlert: Alert = {
      ...alert,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false,
    }
    addAlert(newAlert)
    setAlerts([newAlert, ...alerts])
  }

  const handleMarkAlertRead = (alertId: string) => {
    markAlertAsRead(alertId)
    setAlerts(getAlerts())
  }

  const handleDeleteAlert = (alertId: string) => {
    deleteAlert(alertId)
    setAlerts(getAlerts())
  }

  // ============ Utilitaires ============
  const clearAllData = () => {
    clearAllAvicultureData()
    refreshData()
  }

  // ============ Valeur du contexte ============
  const value: AvicultureContextType = {
    // Données
    batches,
    healthRecords,
    feedStock,
    feedOrders,
    vetServices,
    vetBookings,
    dailyReports,
    alerts,
    
    // Statistiques
    stats,
    
    // État
    isLoading,
    
    // Actions Lots
    addBatch,
    updateBatch,
    deleteBatch,
    getBatch,
    
    // Actions Santé
    addHealthRecord,
    updateHealthRecord,
    deleteHealthRecord,
    
    // Actions Alimentation
    updateFeedStock,
    addFeedOrder: handleAddFeedOrder,
    orderFeed,
    
    // Actions Services
    addVetBooking: handleAddVetBooking,
    cancelVetBooking,
    
    // Actions Rapports
    addDailyReport: handleAddDailyReport,
    
    // Actions Alertes
    addAlert: handleAddAlert,
    markAlertRead: handleMarkAlertRead,
    deleteAlert: handleDeleteAlert,
    
    // Utilitaires
    refreshData,
    clearAllData,
  }

  return (
    <AvicultureContext.Provider value={value}>
      {children}
    </AvicultureContext.Provider>
  )
}

// ============ Hook personnalisé pour utiliser le contexte ============
export const useAviculture = () => {
  const context = useContext(AvicultureContext)
  if (!context) {
    throw new Error('useAviculture must be used within an AvicultureProvider')
  }
  return context
}