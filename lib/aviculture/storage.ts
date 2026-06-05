// lib/aviculture/storage.ts

import { 
  PoultryBatch, HealthRecord, FeedStock, FeedOrder, 
  VetBooking, DailyReport, Alert 
} from './types'

// Clés localStorage
const BATCHES_KEY = 'aviculture_batches'
const HEALTH_KEY = 'aviculture_health'
const FEED_STOCK_KEY = 'aviculture_feed'
const FEED_ORDERS_KEY = 'aviculture_feed_orders'
const VET_BOOKINGS_KEY = 'aviculture_vet_bookings'
const DAILY_REPORTS_KEY = 'aviculture_daily_reports'
const ALERTS_KEY = 'aviculture_alerts'

// ============ Lots ============
export const getBatches = (): PoultryBatch[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(BATCHES_KEY)
  return data ? JSON.parse(data) : []
}

export const saveBatches = (batches: PoultryBatch[]) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(BATCHES_KEY, JSON.stringify(batches))
}

export const getBatchById = (id: string): PoultryBatch | undefined => {
  const batches = getBatches()
  return batches.find(b => b.id === id)
}

export const updateBatchStats = (batchId: string, updates: Partial<PoultryBatch>) => {
  const batches = getBatches()
  const index = batches.findIndex(b => b.id === batchId)
  if (index !== -1) {
    batches[index] = { ...batches[index], ...updates, updatedAt: new Date().toISOString() }
    saveBatches(batches)
  }
}

// ============ Santé ============
export const getHealthRecords = (): HealthRecord[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(HEALTH_KEY)
  return data ? JSON.parse(data) : []
}

export const saveHealthRecords = (records: HealthRecord[]) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(HEALTH_KEY, JSON.stringify(records))
}

export const getHealthRecordsByBatch = (batchId: string): HealthRecord[] => {
  const records = getHealthRecords()
  return records.filter(r => r.batchId === batchId)
}

// ============ Alimentation ============
export const getFeedStock = (): FeedStock[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(FEED_STOCK_KEY)
  return data ? JSON.parse(data) : []
}

export const saveFeedStock = (stock: FeedStock[]) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(FEED_STOCK_KEY, JSON.stringify(stock))
}

export const updateFeedStockQuantity = (feedId: string, quantityChange: number) => {
  const stock = getFeedStock()
  const index = stock.findIndex(f => f.id === feedId)
  if (index !== -1) {
    stock[index].currentStock += quantityChange
    saveFeedStock(stock)
  }
}

export const addFeedOrder = (order: FeedOrder) => {
  const existing = localStorage.getItem(FEED_ORDERS_KEY)
  const orders: FeedOrder[] = existing ? JSON.parse(existing) : []
  orders.unshift(order)
  localStorage.setItem(FEED_ORDERS_KEY, JSON.stringify(orders))
}

export const getFeedOrders = (): FeedOrder[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(FEED_ORDERS_KEY)
  return data ? JSON.parse(data) : []
}

// ============ Services vétérinaires ============
export const addVetBooking = (booking: VetBooking) => {
  const existing = localStorage.getItem(VET_BOOKINGS_KEY)
  const bookings: VetBooking[] = existing ? JSON.parse(existing) : []
  bookings.unshift(booking)
  localStorage.setItem(VET_BOOKINGS_KEY, JSON.stringify(bookings))
}

export const getVetBookings = (): VetBooking[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(VET_BOOKINGS_KEY)
  return data ? JSON.parse(data) : []
}

export const updateVetBookingStatus = (bookingId: string, status: VetBooking['status']) => {
  const bookings = getVetBookings()
  const index = bookings.findIndex(b => b.id === bookingId)
  if (index !== -1) {
    bookings[index].status = status
    localStorage.setItem(VET_BOOKINGS_KEY, JSON.stringify(bookings))
  }
}

// ============ Rapports quotidiens ============
export const getDailyReports = (): DailyReport[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(DAILY_REPORTS_KEY)
  return data ? JSON.parse(data) : []
}

export const addDailyReport = (report: DailyReport) => {
  const existing = getDailyReports()
  existing.unshift(report)
  localStorage.setItem(DAILY_REPORTS_KEY, JSON.stringify(existing))
}

export const getDailyReportsByBatch = (batchId: string): DailyReport[] => {
  const reports = getDailyReports()
  return reports.filter(r => r.batchId === batchId)
}

// ============ Alertes ============
export const getAlerts = (): Alert[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(ALERTS_KEY)
  return data ? JSON.parse(data) : []
}

export const addAlert = (alert: Alert) => {
  const existing = getAlerts()
  existing.unshift(alert)
  localStorage.setItem(ALERTS_KEY, JSON.stringify(existing))
}

export const markAlertAsRead = (alertId: string) => {
  const alerts = getAlerts()
  const index = alerts.findIndex(a => a.id === alertId)
  if (index !== -1) {
    alerts[index].read = true
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts))
  }
}

export const deleteAlert = (alertId: string) => {
  const alerts = getAlerts()
  const filtered = alerts.filter(a => a.id !== alertId)
  localStorage.setItem(ALERTS_KEY, JSON.stringify(filtered))
}

// ============ Utilitaires ============
export const clearAllAvicultureData = () => {
  localStorage.removeItem(BATCHES_KEY)
  localStorage.removeItem(HEALTH_KEY)
  localStorage.removeItem(FEED_STOCK_KEY)
  localStorage.removeItem(FEED_ORDERS_KEY)
  localStorage.removeItem(VET_BOOKINGS_KEY)
  localStorage.removeItem(DAILY_REPORTS_KEY)
  localStorage.removeItem(ALERTS_KEY)
}