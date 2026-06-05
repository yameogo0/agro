// lib/aviculture/constants.ts

import { PoultryBatch, HealthRecord, FeedStock, VetService } from './types'

// Lots de volailles mockés
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
    notes: "Premier lot de pondeuses de la saison",
    mortality: 50,
    weight: 1.8,
    feedConsumption: 1250,
    eggProduction: 380,
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
    notes: "Élevage pour la viande",
    mortality: 20,
    weight: 2.1,
    feedConsumption: 680,
  },
  {
    id: "batch3",
    name: "Lot C - Poulettes",
    breed: "Bovans Brown",
    count: 380,
    initialCount: 400,
    startDate: "2024-05-01",
    expectedEndDate: "2024-08-01",
    location: "Poulailler 3",
    status: "active",
    mortality: 20,
    feedConsumption: 450,
  },
  {
    id: "batch4",
    name: "Lot D - Reproductions",
    breed: "Kabir",
    count: 120,
    initialCount: 120,
    startDate: "2024-02-15",
    expectedEndDate: "2024-12-15",
    location: "Poulailler 1",
    status: "active",
    notes: "Race locale améliorée",
    mortality: 8,
    weight: 2.3,
    feedConsumption: 890,
    eggProduction: 95,
  },
]

// Enregistrements santé mockés
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
    nextDue: "2024-04-15",
    status: "done",
    performedBy: "Dr. Koné",
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
    nextDue: "2024-10-01",
    status: "done",
    performedBy: "Dr. Traoré",
  },
  {
    id: "health3",
    batchId: "batch2",
    date: "2024-04-20",
    type: "treatment",
    title: "Traitement anticoccidien",
    description: "Prévention coccidiose",
    product: "Amprolium",
    dosage: "1 ml/l eau",
    nextDue: "2024-05-04",
    status: "scheduled",
  },
  {
    id: "health4",
    batchId: "batch3",
    date: "2024-05-10",
    type: "checkup",
    title: "Contrôle de croissance",
    description: "Pesée et évaluation de l'état de santé général",
    status: "scheduled",
  },
  {
    id: "health5",
    batchId: "batch4",
    date: "2024-03-20",
    type: "alert",
    title: "Pic de mortalité suspecté",
    description: "Surveiller attentivement les signes de maladie respiratoire",
    status: "overdue",
    nextDue: "2024-03-25",
  },
]

// Stocks d'aliments mockés
export const mockFeedStock: FeedStock[] = [
  { 
    id: "feed1", 
    name: "Aliment démarrage", 
    type: "starter", 
    currentStock: 850, 
    unit: "kg", 
    pricePerUnit: 0.45, 
    threshold: 200, 
    supplier: "NutriVolaille" 
  },
  { 
    id: "feed2", 
    name: "Aliment croissance", 
    type: "grower", 
    currentStock: 420, 
    unit: "kg", 
    pricePerUnit: 0.42, 
    threshold: 150, 
    supplier: "AgriFeed" 
  },
  { 
    id: "feed3", 
    name: "Aliment ponte", 
    type: "layer", 
    currentStock: 1200, 
    unit: "kg", 
    pricePerUnit: 0.48, 
    threshold: 300, 
    supplier: "NutriVolaille" 
  },
  { 
    id: "feed4", 
    name: "Aliment finition", 
    type: "finisher", 
    currentStock: 350, 
    unit: "kg", 
    pricePerUnit: 0.44, 
    threshold: 100, 
    supplier: "AgriFeed" 
  },
]

// Services vétérinaires mockés
export const mockVetServices: VetService[] = [
  { 
    id: "svc1", 
    name: "Consultation vétérinaire à domicile", 
    description: "Examen complet de l'élevage avec conseils personnalisés", 
    price: 0.015, 
    duration: "2h", 
    available: true, 
    provider: "Dr. Aminata Traoré", 
    location: "Ouagadougou", 
    rating: 4.9 
  },
  { 
    id: "svc2", 
    name: "Programme de vaccination complet", 
    description: "Vaccination pour tout le cheptel (Newcastle, Gumboro, etc.)", 
    price: 0.025, 
    duration: "1 journée", 
    available: true, 
    provider: "SantéAviaire BF", 
    location: "Bobo-Dioulasso", 
    rating: 4.8 
  },
  { 
    id: "svc3", 
    name: "Analyse de laboratoire", 
    description: "Diagnostic de maladies aviaires (coproculture, autopsie)", 
    price: 0.008, 
    duration: "48h", 
    available: true, 
    provider: "Labo vétérinaire national", 
    location: "Ouagadougou", 
    rating: 4.7 
  },
  { 
    id: "svc4", 
    name: "Certification sanitaire", 
    description: "Inspection et délivrance de certificats pour l'exportation", 
    price: 0.012, 
    duration: "3 jours", 
    available: true, 
    provider: "Direction des services vétérinaires", 
    location: "Koudougou", 
    rating: 4.6 
  },
  { 
    id: "svc5", 
    name: "Conseil en alimentation", 
    description: "Élaboration de rations équilibrées pour vos volailles", 
    price: 0.01, 
    duration: "2h", 
    available: true, 
    provider: "Nutri-Conseil", 
    location: "À distance", 
    rating: 4.8 
  },
]

// Consommations d'aliments mockées (historique)
export const mockFeedConsumptions = [
  { id: "cons1", batchId: "batch1", date: "2024-05-01", amount: 45, feedType: "Aliment ponte" },
  { id: "cons2", batchId: "batch1", date: "2024-05-02", amount: 48, feedType: "Aliment ponte" },
  { id: "cons3", batchId: "batch2", date: "2024-05-01", amount: 32, feedType: "Aliment croissance" },
  { id: "cons4", batchId: "batch2", date: "2024-05-02", amount: 35, feedType: "Aliment croissance" },
  { id: "cons5", batchId: "batch3", date: "2024-05-01", amount: 28, feedType: "Aliment démarrage" },
]

// Statistiques par défaut pour l'aperçu
export const defaultStats = {
  totalBirds: 0,
  totalMortality: 0,
  totalFeedStock: 0,
  averageEggProduction: 0,
  activeBatches: 0,
  completionRate: 0,
}

// Conseils quotidiens mockés
export const dailyTips = [
  "Vérifiez la température du poulailler : 32°C la première semaine, réduisez de 2°C chaque semaine.",
  "Nettoyez les abreuvoirs tous les jours pour éviter les maladies.",
  "Un poulet en bonne santé a la crête rouge vif et les yeux brillants.",
  "La consommation d'eau est le double de la consommation d'aliment.",
  "Isoler les oiseaux malades dès les premiers symptômes.",
  "Une bonne litière sèche réduit les risques respiratoires.",
]