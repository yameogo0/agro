export interface PoultryBatch {
  id: string
  name: string
  breed: string
  count: number
  initialCount: number
  startDate: string
  expectedEndDate?: string
  location: string
  status: 'active' | 'completed' | 'culled'
  notes?: string
  mortality: number
  weight?: number
  feedConsumption: number
  eggProduction?: number
}

export interface HealthRecord {
  id: string
  batchId: string
  date: string
  type: 'vaccination' | 'treatment' | 'checkup' | 'alert'
  title: string
  description?: string
  product?: string
  dosage?: string
  nextDue?: string
  status: 'done' | 'scheduled' | 'overdue'
  performedBy?: string
}

export interface FeedStock {
  id: string
  name: string
  type: 'starter' | 'grower' | 'layer' | 'finisher'
  currentStock: number
  unit: string
  pricePerUnit: number
  threshold: number
  supplier: string
}

export interface FeedOrder {
  id: string
  feedId: string
  quantity: number
  totalPrice: number
  date: string
  paymentId: string
  status: 'pending' | 'completed'
}

export interface VetService {
  id: string
  name: string
  description: string
  price: number
  duration: string
  available: boolean
  provider: string
  location: string
  rating: number
}

export interface VetBooking {
  id: string
  serviceId: string
  serviceName: string
  provider: string
  date: string
  time: string
  price: number
  paymentId: string
  status: 'confirmed' | 'cancelled'
}