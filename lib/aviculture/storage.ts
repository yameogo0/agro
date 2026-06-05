import { PoultryBatch, HealthRecord, FeedStock, FeedOrder, VetBooking } from './types'

const BATCHES_KEY = 'aviculture_batches'
const HEALTH_KEY = 'aviculture_health'
const FEED_STOCK_KEY = 'aviculture_feed'
const FEED_ORDERS_KEY = 'aviculture_feed_orders'
const VET_BOOKINGS_KEY = 'aviculture_vet_bookings'

export const getBatches = (): PoultryBatch[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(BATCHES_KEY)
  return data ? JSON.parse(data) : []
}

export const saveBatches = (batches: PoultryBatch[]) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(BATCHES_KEY, JSON.stringify(batches))
}

export const getHealthRecords = (): HealthRecord[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(HEALTH_KEY)
  return data ? JSON.parse(data) : []
}

export const saveHealthRecords = (records: HealthRecord[]) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(HEALTH_KEY, JSON.stringify(records))
}

export const getFeedStock = (): FeedStock[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(FEED_STOCK_KEY)
  return data ? JSON.parse(data) : []
}

export const saveFeedStock = (stock: FeedStock[]) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(FEED_STOCK_KEY, JSON.stringify(stock))
}

export const addFeedOrder = (order: FeedOrder) => {
  const existing = localStorage.getItem(FEED_ORDERS_KEY)
  const orders: FeedOrder[] = existing ? JSON.parse(existing) : []
  orders.unshift(order)
  localStorage.setItem(FEED_ORDERS_KEY, JSON.stringify(orders))
}

export const addVetBooking = (booking: VetBooking) => {
  const existing = localStorage.getItem(VET_BOOKINGS_KEY)
  const bookings: VetBooking[] = existing ? JSON.parse(existing) : []
  bookings.unshift(booking)
  localStorage.setItem(VET_BOOKINGS_KEY, JSON.stringify(bookings))
}