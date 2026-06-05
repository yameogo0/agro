// lib/aviculture/constants.ts

import { PoultryBatch, HealthRecord, FeedStock, VetService, DailyReport, Alert } from './types'

export const mockBatches: PoultryBatch[] = [
  {
    id: "batch1",
    name: "Lot A - Pondeuses Mars",
    breed: "Isa Brown",
    count: 450,
    initialCount: 500,
    startDate: "2024-03-01",
    expectedEndDate: "2025-03-01",
    location: "Poulailler 1",
    status: "active",
    notes: "Premier lot de pondeuses de la saison. Excellente santé.",
    mortality: 50,
    weight: 1.8,
    feedConsumption: 1250,
    waterConsumption: 2500,
    eggProduction: 380,
    eggQuality: "good",
    temperature: 28,
    humidity: 65,
    createdAt: "2024-03-01T08:00:00Z",
    updatedAt: "2024-06-01T08:00:00Z",
  },
  {
    id: "batch2",
    name: "Lot B - Poulets de chair",
    breed: "Cobb 500",
    count: 280,
    initialCount: 300,
    startDate: "2024-04-10",
    expectedEndDate: "2024-06-20",
    location: "Poulailler 2",
    status: "active",
    notes: "Élevage pour la viande. Croissance rapide.",
    mortality: 20,
    weight: 2.1,
    feedConsumption: 680,
    waterConsumption: 1360,
    createdAt: "2024-04-10T08:00:00Z",
    updatedAt: "2024-06-01T08:00:00Z",
  },
]

export const mockHealthRecords: HealthRecord[] = [
  {
    id: "health1",
    batchId: "batch1",
    date: "2024-03-15",
    type: "vaccination",
    title: "Vaccin Gumboro",
    description: "Vaccin contre la maladie de Gumboro",
    product: "Nobilis Gumboro",
    dosage: "0.5 ml/oiseau",
    administrationMethod: "injection",
    nextDue: "2024-04-15",
    status: "done",
    performedBy: "Dr. Koné",
    cost: 0.025,
  },
  {
    id: "health2",
    batchId: "batch1",
    date: "2024-04-01",
    type: "vaccination",
    title: "Vaccin Newcastle",
    description: "Vaccin contre la maladie de Newcastle",
    product: "Newvac",
    dosage: "1 goutte/oiseau",
    administrationMethod: "spray",
    nextDue: "2024-10-01",
    status: "done",
    performedBy: "Dr. Traoré",
    cost: 0.03,
  },
]

export const mockFeedStock: FeedStock[] = [
  { 
    id: "feed1", 
    name: "Aliment démarrage", 
    type: "starter", 
    currentStock: 850, 
    unit: "kg", 
    pricePerUnit: 0.45, 
    threshold: 200, 
    supplier: "NutriVolaille",
    supplierContact: "+226 70 12 34 56",
    lastOrderDate: "2024-05-15",
    nutritionalInfo: { protein: 22, energy: 2900, calcium: 1.2, phosphorus: 0.8 }
  },
  { 
    id: "feed2", 
    name: "Aliment croissance", 
    type: "grower", 
    currentStock: 420, 
    unit: "kg", 
    pricePerUnit: 0.42, 
    threshold: 150, 
    supplier: "AgriFeed",
    supplierContact: "+226 70 23 45 67",
    lastOrderDate: "2024-05-20",
    nutritionalInfo: { protein: 18, energy: 2850, calcium: 1.0, phosphorus: 0.7 }
  },
]

export const mockVetServices: VetService[] = [
  { 
    id: "svc1", 
    name: "Consultation vétérinaire à domicile", 
    description: "Examen complet de l'élevage avec conseils personnalisés", 
    price: 0.015, 
    duration: "2h", 
    available: true, 
    provider: "Dr. Aminata Traoré",
    providerContact: "+226 70 34 56 78",
    location: "Ouagadougou", 
    rating: 4.9,
    reviews: 127,
    category: "consultation",
  },
  { 
    id: "svc2", 
    name: "Programme de vaccination complet", 
    description: "Vaccination pour tout le cheptel (Newcastle, Gumboro, etc.)", 
    price: 0.025, 
    duration: "1 journée", 
    available: true, 
    provider: "SantéAviaire BF",
    providerContact: "+226 70 45 67 89",
    location: "Bobo-Dioulasso", 
    rating: 4.8,
    reviews: 89,
    category: "vaccination",
  },
]

export const mockAlerts: Alert[] = [
  {
    id: "alert1",
    type: "stock",
    severity: "high",
    title: "Stock alimentaire critique",
    message: "L'aliment croissance atteint son seuil critique (150 kg). Commandez rapidement.",
    createdAt: "2024-06-05T08:00:00Z",
    read: false,
    actionable: true,
  },
  {
    id: "alert2",
    type: "vaccination",
    severity: "medium",
    title: "Rappel vaccination",
    message: "Le lot A nécessite un rappel de vaccination Gumboro le 15/06/2024.",
    batchId: "batch1",
    createdAt: "2024-06-05T08:00:00Z",
    read: false,
    actionable: true,
  },
]

export const mockDailyReports: DailyReport[] = [
  {
    id: "report1",
    date: "2024-06-04",
    batchId: "batch1",
    temperature: 28,
    humidity: 65,
    mortality: 2,
    feedConsumed: 42,
    waterConsumed: 85,
    eggCount: 380,
    observations: "Bonne santé générale, consommation normale.",
    createdBy: "Agriculteur",
  },
  {
    id: "report2",
    date: "2024-06-04",
    batchId: "batch2",
    temperature: 26,
    humidity: 60,
    mortality: 1,
    feedConsumed: 38,
    waterConsumed: 76,
    observations: "Croissance satisfaisante.",
    createdBy: "Agriculteur",
  },
]

// Conseils quotidiens
export const dailyTips = [
  "Vérifiez la température du poulailler : 32°C la première semaine, réduisez de 2°C chaque semaine.",
  "Nettoyez les abreuvoirs tous les jours pour éviter les maladies.",
  "Un poulet en bonne santé a la crête rouge vif et les yeux brillants.",
  "La consommation d'eau est le double de la consommation d'aliment.",
  "Isoler les oiseaux malades dès les premiers symptômes.",
]

// Statistiques par défaut
export const defaultStats = {
  totalBirds: 0,
  activeBatches: 0,
  totalMortality: 0,
  mortalityRate: 0,
  totalFeedStock: 0,
  feedValue: 0,
  averageEggProduction: 0,
  completionRate: 0,
}