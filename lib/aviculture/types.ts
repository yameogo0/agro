// lib/aviculture/types.ts
// Types complets pour la gestion avicole

export interface PoultryBatch {
  id: string
  name: string
  breed: string
  count: number
  initialCount: number
  startDate: string
  expectedEndDate?: string
  actualEndDate?: string
  location: string
  status: 'active' | 'completed' | 'culled'
  notes?: string
  mortality: number
  mortalityReasons?: MortalityRecord[]
  weight?: number
  feedConsumption: number
  waterConsumption?: number
  eggProduction?: number
  eggQuality?: 'excellent' | 'good' | 'average' | 'poor'
  temperature?: number
  humidity?: number
  lastVaccination?: string
  nextVaccination?: string
  createdAt: string
  updatedAt: string
}

export interface MortalityRecord {
  id: string
  date: string
  count: number
  cause: string
  notes?: string
  batchId: string
}

export interface HealthRecord {
  id: string
  batchId: string
  date: string
  type: 'vaccination' | 'treatment' | 'checkup' | 'alert' | 'necropsy'
  title: string
  description?: string
  product?: string
  dosage?: string
  administrationMethod?: 'oral' | 'injection' | 'spray' | 'water'
  nextDue?: string
  status: 'done' | 'scheduled' | 'overdue' | 'cancelled'
  performedBy?: string
  cost?: number
  observations?: string
  attachments?: string[]
}

export interface FeedStock {
  id: string
  name: string
  type: 'starter' | 'grower' | 'layer' | 'finisher' | 'supplement'
  currentStock: number
  unit: string
  pricePerUnit: number
  threshold: number
  supplier: string
  supplierContact?: string
  lastOrderDate?: string
  nutritionalInfo?: {
    protein: number
    energy: number
    calcium: number
    phosphorus: number
  }
}

export interface FeedOrder {
  id: string
  feedId: string
  quantity: number
  totalPrice: number
  date: string
  deliveryDate?: string
  paymentId: string
  status: 'pending' | 'completed' | 'delivered' | 'cancelled'
  deliveryAddress?: string
  notes?: string
}

export interface VetService {
  id: string
  name: string
  description: string
  price: number
  duration: string
  available: boolean
  provider: string
  providerContact?: string
  location: string
  rating: number
  reviews: number
  category: 'consultation' | 'vaccination' | 'laboratory' | 'emergency' | 'training'
  availableSlots?: TimeSlot[]
}

export interface TimeSlot {
  id: string
  date: string
  time: string
  available: boolean
}

export interface VetBooking {
  id: string
  serviceId: string
  serviceName: string
  provider: string
  clientName: string
  clientPhone?: string
  date: string
  time: string
  price: number
  paymentId: string
  status: 'confirmed' | 'cancelled' | 'completed' | 'pending'
  notes?: string
  createdAt: string
}

export interface DailyReport {
  id: string
  date: string
  batchId: string
  temperature: number
  humidity: number
  mortality: number
  feedConsumed: number
  waterConsumed: number
  eggCount?: number
  observations: string
  createdBy: string
}

export interface Alert {
  id: string
  type: 'stock' | 'health' | 'vaccination' | 'temperature' | 'mortality'
  severity: 'low' | 'medium' | 'high'
  title: string
  message: string
  batchId?: string
  createdAt: string
  read: boolean
  actionable: boolean
}

export interface AnalyticsData {
  date: string
  mortality: number
  feedEfficiency: number
  eggProduction: number
  weight: number
}