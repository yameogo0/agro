"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Heart,
  Utensils,
  TrendingUp,
  Package,
  BarChart3,
  GraduationCap,
  Share2,
  Headphones,
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  Star,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  Thermometer,
  Droplets,
  Wifi,
  WifiOff,
  Loader2,
  RefreshCw,
  Edit,
  Trash2,
  Download,
  Printer,
  Eye,
  PieChart,
  LineChart,
  Egg,
  Weight,
  Syringe,
  Tractor,
  X,
} from "lucide-react"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { showToast, formatDate, formatNumber } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface AvicultureManagementProps {
  currentLanguage: string
  userRegion: string
}

interface Batch {
  id: string
  name: string
  type: "pondeuses" | "poulets" | "reproducteurs"
  birds: number
  age: number
  health: "bon" | "moyen" | "critique"
  eggs?: number
  weight?: number
  mortality: number
  createdAt: string
  lastVaccination?: string
  nextVaccination?: string
}

interface FeedItem {
  type: string
  quantity: number
  unit: string
  costPerUnit: number
  lastOrder: string
  supplier: string
}

interface HealthRecord {
  id: string
  batchId: string
  date: string
  type: "vaccination" | "checkup" | "treatment"
  description: string
  veterinarian?: string
  cost: number
}

interface ProductionStat {
  date: string
  eggs: number
  mortality: number
  avgWeight: number
  feedConsumption: number
}

interface Service {
  id: string
  provider: string
  service: string
  price: number
  rating: number
  location: string
  available: boolean
  phone?: string
  experience?: number
}

export default function AvicultureManagement({ currentLanguage, userRegion }: AvicultureManagementProps) {
  const isOnline = useOnlineStatus()
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [showHealthModal, setShowHealthModal] = useState(false)
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null)

  // Données persistantes
  const [batches, setBatches] = useLocalStorage<Batch[]>("avicultureBatches", [
    { id: "batch-1", name: "Lot pondeuses A", type: "pondeuses", birds: 1250, age: 18, health: "bon", eggs: 890, mortality: 2.1, createdAt: "2024-01-01", lastVaccination: "2024-01-15", nextVaccination: "2024-02-15" },
    { id: "batch-2", name: "Lot poulets B", type: "poulets", birds: 800, age: 6, health: "bon", weight: 1.2, mortality: 1.5, createdAt: "2024-01-10", lastVaccination: "2024-01-20", nextVaccination: "2024-02-20" },
    { id: "batch-3", name: "Lot reproducteurs C", type: "reproducteurs", birds: 300, age: 24, health: "bon", eggs: 180, mortality: 0.8, createdAt: "2023-12-01", lastVaccination: "2024-01-10", nextVaccination: "2024-02-10" },
  ])

  const [feedStock, setFeedStock] = useLocalStorage<FeedItem[]>("avicultureFeedStock", [
    { type: "Aliment pondeuses", quantity: 500, unit: "kg", costPerUnit: 0.025, lastOrder: "2024-01-15", supplier: "Ferme Moderne" },
    { type: "Aliment démarrage", quantity: 300, unit: "kg", costPerUnit: 0.018, lastOrder: "2024-01-10", supplier: "Coopérative YELEN" },
    { type: "Aliment croissance", quantity: 400, unit: "kg", costPerUnit: 0.022, lastOrder: "2024-01-12", supplier: "Ferme Moderne" },
    { type: "Aliment finition", quantity: 350, unit: "kg", costPerUnit: 0.02, lastOrder: "2024-01-14", supplier: "AgriTech BF" },
  ])

  const [healthRecords, setHealthRecords] = useLocalStorage<HealthRecord[]>("avicultureHealthRecords", [
    { id: "1", batchId: "batch-1", date: "2024-01-15", type: "vaccination", description: "Vaccin Newcastle", veterinarian: "Dr. Aminata", cost: 0.008 },
    { id: "2", batchId: "batch-2", date: "2024-01-20", type: "vaccination", description: "Vaccin Gumboro", veterinarian: "Dr. Moussa", cost: 0.006 },
  ])

  const [productionStats, setProductionStats] = useLocalStorage<ProductionStat[]>("avicultureProductionStats", [
    { date: "Sem 1", eggs: 580, mortality: 2.1, avgWeight: 1.8, feedConsumption: 45 },
    { date: "Sem 2", eggs: 620, mortality: 1.9, avgWeight: 1.9, feedConsumption: 47 },
    { date: "Sem 3", eggs: 650, mortality: 1.8, avgWeight: 2.0, feedConsumption: 48 },
    { date: "Sem 4", eggs: 670, mortality: 1.7, avgWeight: 2.1, feedConsumption: 50 },
    { date: "Sem 5", eggs: 690, mortality: 1.6, avgWeight: 2.2, feedConsumption: 52 },
    { date: "Sem 6", eggs: 710, mortality: 1.5, avgWeight: 2.3, feedConsumption: 53 },
    { date: "Sem 7", eggs: 730, mortality: 1.4, avgWeight: 2.4, feedConsumption: 55 },
  ])

  const [services] = useState<Service[]>([
    { id: "1", provider: "Dr. Aminata Traoré", service: "Consultation vétérinaire", price: 0.008, rating: 4.9, location: "Ouagadougou", available: true, phone: "+226 70 12 34 56", experience: 12 },
    { id: "2", provider: "Coopérative YELEN", service: "Formation aviculture", price: 0.015, rating: 4.7, location: "Bobo-Dioulasso", available: true, phone: "+226 70 23 45 67", experience: 8 },
    { id: "3", provider: "TechAgri Solutions", service: "Analyse de données", price: 0.012, rating: 4.8, location: "Koudougou", available: false, phone: "+226 70 34 56 78", experience: 5 },
    { id: "4", provider: "Ferme Moderne", service: "Alimentation certifiée", price: 0.025, rating: 4.9, location: "Banfora", available: true, phone: "+226 70 45 67 89", experience: 15 },
  ])

  const [newBatch, setNewBatch] = useState({
    name: "",
    type: "pondeuses",
    birds: 0,
    age: 0,
  })

  const [healthRecord, setHealthRecord] = useState({
    batchId: "",
    type: "vaccination",
    description: "",
    veterinarian: "",
    cost: 0,
  })

  const selectedBatch = batches.find(b => b.id === selectedBatchId)

  // Calculs des statistiques globales
  const totalBirds = batches.reduce((sum, b) => sum + b.birds, 0)
  const totalEggs = batches.filter(b => b.type === "pondeuses").reduce((sum, b) => sum + (b.eggs || 0), 0)
  const avgMortality = batches.reduce((sum, b) => sum + b.mortality, 0) / batches.length
  const totalFeedValue = feedStock.reduce((sum, f) => sum + (f.quantity * f.costPerUnit), 0)

  const refreshData = useCallback(async () => {
    if (!isOnline) {
      showToast("Connexion internet requise", "error")
      return
    }
    setIsRefreshing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      showToast("Données actualisées", "success")
    } catch {
      showToast("Erreur lors de l'actualisation", "error")
    } finally {
      setIsRefreshing(false)
    }
  }, [isOnline])

  const handleAddBatch = () => {
    if (!newBatch.name || newBatch.birds <= 0) {
      showToast("Veuillez remplir tous les champs", "error")
      return
    }
    const batch: Batch = {
      id: `batch-${Date.now()}`,
      name: newBatch.name,
      type: newBatch.type as any,
      birds: newBatch.birds,
      age: newBatch.age,
      health: "bon",
      mortality: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setBatches([...batches, batch])
    setShowBatchModal(false)
    setNewBatch({ name: "", type: "pondeuses", birds: 0, age: 0 })
    showToast("Lot ajouté avec succès", "success")
  }

  const handleDeleteBatch = (id: string) => {
    setBatches(batches.filter(b => b.id !== id))
    showToast("Lot supprimé", "success")
  }

  const handleAddHealthRecord = () => {
    if (!healthRecord.batchId || !healthRecord.description) {
      showToast("Veuillez remplir tous les champs", "error")
      return
    }
    const record: HealthRecord = {
      id: `hr-${Date.now()}`,
      batchId: healthRecord.batchId,
      date: new Date().toISOString().split("T")[0],
      type: healthRecord.type as any,
      description: healthRecord.description,
      veterinarian: healthRecord.veterinarian,
      cost: healthRecord.cost,
    }
    setHealthRecords([...healthRecords, record])
    setShowHealthModal(false)
    setHealthRecord({ batchId: "", type: "vaccination", description: "", veterinarian: "", cost: 0 })
    showToast("Suivi santé ajouté", "success")
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case "bon": return "text-green-600 bg-green-100"
      case "moyen": return "text-yellow-600 bg-yellow-100"
      case "critique": return "text-red-600 bg-red-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  const getBatchTypeLabel = (type: string) => {
    switch (type) {
      case "pondeuses": return "🥚 Pondeuses"
      case "poulets": return "🍗 Poulets de chair"
      case "reproducteurs": return "🐓 Reproducteurs"
      default: return type
    }
  }

  const filteredServices = services.filter(s => 
    s.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.provider.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Composant graphique simplifié
  const ProductionChart = () => (
    <div className="flex items-end gap-2 h-40 mt-4">
      {productionStats.map((stat, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full bg-green-500 rounded-t-lg transition-all hover:bg-green-600" style={{ height: `${(stat.eggs / 800) * 100}px` }} />
          <span className="text-xs text-gray-500">{stat.date}</span>
          <span className="text-[10px] font-medium">{stat.eggs}</span>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">🐔 Gestion Aviculture</h2>
          <p className="text-gray-500 text-sm">Outils complets pour votre élevage - {userRegion}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!isOnline && <Badge className="bg-yellow-500 text-white gap-1"><WifiOff className="h-3 w-3" />Hors ligne</Badge>}
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1" onClick={() => setShowBatchModal(true)}>
            <Plus className="h-4 w-4" /> Nouveau lot
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Rechercher..." className="pl-9 w-48 sm:w-64" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Cartes de statistiques globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex justify-between items-start"><div><p className="text-sm text-gray-500">Volailles totales</p><p className="text-2xl font-bold">{formatNumber(totalBirds)}</p></div><Users className="h-8 w-8 text-blue-500 opacity-50" /></div><Badge className="mt-2 bg-green-100 text-green-700">+8%</Badge></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex justify-between items-start"><div><p className="text-sm text-gray-500">Production œufs/jour</p><p className="text-2xl font-bold">{formatNumber(totalEggs)}</p></div><Egg className="h-8 w-8 text-yellow-500 opacity-50" /></div><Badge className="mt-2 bg-green-100 text-green-700">+5%</Badge></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex justify-between items-start"><div><p className="text-sm text-gray-500">Mortalité moyenne</p><p className="text-2xl font-bold">{avgMortality.toFixed(1)}%</p></div><Activity className="h-8 w-8 text-red-500 opacity-50" /></div><Badge className="mt-2 bg-green-100 text-green-700">-0.3%</Badge></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex justify-between items-start"><div><p className="text-sm text-gray-500">Valeur stock aliments</p><p className="text-2xl font-bold text-purple-600">{totalFeedValue.toFixed(4)} π</p></div><Package className="h-8 w-8 text-purple-500 opacity-50" /></div></CardContent></Card>
      </div>

      {/* Onglets principaux */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["overview", "batches", "health", "feeding", "services"].map(tab => (
          <Button key={tab} variant={activeTab === tab ? "default" : "outline"} onClick={() => setActiveTab(tab)} className={activeTab === tab ? "bg-green-600" : ""}>
            {tab === "overview" && <BarChart3 className="h-4 w-4 mr-2" />}
            {tab === "batches" && <Users className="h-4 w-4 mr-2" />}
            {tab === "health" && <Heart className="h-4 w-4 mr-2" />}
            {tab === "feeding" && <Utensils className="h-4 w-4 mr-2" />}
            {tab === "services" && <ShoppingCart className="h-4 w-4 mr-2" />}
            {tab === "overview" && "Aperçu"}
            {tab === "batches" && "Mes lots"}
            {tab === "health" && "Santé"}
            {tab === "feeding" && "Alimentation"}
            {tab === "services" && "Services"}
          </Button>
        ))}
      </div>

      {/* Onglet Aperçu */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><LineChart className="h-5 w-5" />Production hebdomadaire</CardTitle></CardHeader><CardContent><ProductionChart /></CardContent></Card>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Alertes récentes</CardTitle></CardHeader><CardContent><div className="space-y-3">{[
              { message: "Vaccination prévue pour le lot A", type: "warning" },
              { message: "Stock d'aliment pondeuses faible", type: "warning" },
              { message: "Contrôle sanitaire OK", type: "success" },
            ].map((a, i) => (<div key={i} className={`p-3 rounded-lg ${a.type === "warning" ? "bg-yellow-50 border-l-4 border-yellow-500" : "bg-green-50 border-l-4 border-green-500"}`}><p className="text-sm">{a.message}</p></div>))}</div></CardContent></Card>

            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Vaccinations à venir</CardTitle></CardHeader><CardContent><div className="space-y-3">{batches.filter(b => b.nextVaccination).map(batch => (<div key={batch.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><div><p className="font-medium">{batch.name}</p><p className="text-xs text-gray-500">Prochaine: {batch.nextVaccination}</p></div><Badge className="bg-yellow-100 text-yellow-700">À venir</Badge></div>))}</div></CardContent></Card>
          </div>

          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5" />Services recommandés</CardTitle></CardHeader><CardContent><div className="grid grid-cols-1 md:grid-cols-3 gap-3">{services.filter(s => s.available).slice(0, 3).map(s => (<div key={s.id} className="flex justify-between items-center p-3 border rounded-lg"><div><p className="font-medium text-sm">{s.service}</p><p className="text-xs text-gray-500">{s.provider}</p><div className="flex items-center gap-1 mt-1"><Star className="h-3 w-3 text-yellow-500 fill-current" /><span className="text-xs">{s.rating}</span></div></div><div className="text-right"><p className="font-bold text-purple-600">{s.price} π</p><Button size="sm" className="mt-1 text-xs h-7">Réserver</Button></div></div>))}</div></CardContent></Card>
        </div>
      )}

      {/* Onglet Mes lots */}
      {activeTab === "batches" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {batches.map(batch => (
            <Card key={batch.id} className="hover:shadow-md transition-all">
              <CardHeader className="pb-2"><div className="flex justify-between items-start"><CardTitle className="text-lg">{batch.name}</CardTitle><div className="flex gap-1"><Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditingBatch(batch); setShowBatchModal(true); }}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => handleDeleteBatch(batch.id)}><Trash2 className="h-4 w-4" /></Button></div></div><p className="text-sm text-gray-500">{getBatchTypeLabel(batch.type)}</p></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 bg-gray-50 rounded"><p className="text-xs text-gray-500">Effectif</p><p className="text-lg font-bold">{formatNumber(batch.birds)}</p></div>
                  <div className="p-2 bg-gray-50 rounded"><p className="text-xs text-gray-500">Âge</p><p className="text-lg font-bold">{batch.age} sem</p></div>
                  {batch.type === "pondeuses" && (<div className="p-2 bg-gray-50 rounded"><p className="text-xs text-gray-500">Production/jour</p><p className="text-lg font-bold">{formatNumber(batch.eggs || 0)}</p></div>)}
                  {batch.type === "poulets" && (<div className="p-2 bg-gray-50 rounded"><p className="text-xs text-gray-500">Poids moyen</p><p className="text-lg font-bold">{batch.weight || 1.2} kg</p></div>)}
                  <div className="p-2 bg-gray-50 rounded"><p className="text-xs text-gray-500">Mortalité</p><p className="text-lg font-bold text-red-600">{batch.mortality}%</p></div>
                </div>
                <div className="flex justify-between items-center"><span className="text-sm">État sanitaire</span><Badge className={getHealthColor(batch.health)}>{batch.health === "bon" ? "✅ Bon" : batch.health === "moyen" ? "⚠️ Moyen" : "🔴 Critique"}</Badge></div>
                <Progress value={100 - batch.mortality} className="h-2" />
                <div className="flex justify-between text-xs text-gray-400"><span>Créé le {batch.createdAt}</span>{batch.lastVaccination && <span>Dernière vaccination: {batch.lastVaccination}</span>}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Onglet Santé */}
      {activeTab === "health" && (
        <div className="space-y-6">
          <div className="flex justify-end"><Button size="sm" onClick={() => setShowHealthModal(true)} className="gap-1"><Plus className="h-4 w-4" />Ajouter un suivi</Button></div>
          <div className="space-y-3">
            {healthRecords.map(record => {
              const batch = batches.find(b => b.id === record.batchId)
              return (<div key={record.id} className="flex justify-between items-center p-4 border rounded-lg"><div><div className="flex items-center gap-2"><Badge className={record.type === "vaccination" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}>{record.type === "vaccination" ? "💉 Vaccination" : "🏥 Consultation"}</Badge><span className="text-sm text-gray-500">{record.date}</span></div><p className="font-medium mt-1">{record.description}</p><p className="text-sm text-gray-500">Lot: {batch?.name || "Inconnu"} • {record.veterinarian && `Dr. ${record.veterinarian}`}</p></div><div className="text-right"><p className="font-bold text-purple-600">{record.cost} π</p></div></div>)
            })}
            {healthRecords.length === 0 && <div className="text-center py-8 text-gray-400"><Heart className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>Aucun suivi santé</p></div>}
          </div>
        </div>
      )}

      {/* Onglet Alimentation */}
      {activeTab === "feeding" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Stock d'aliments</CardTitle></CardHeader><CardContent><div className="space-y-3">{feedStock.map((feed, i) => (<div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><div><p className="font-medium">{feed.type}</p><p className="text-xs text-gray-500">{feed.supplier}</p></div><div className="text-right"><p className="font-medium">{feed.quantity} {feed.unit}</p><p className="text-sm text-purple-600">{feed.costPerUnit} π/{feed.unit}</p><p className="text-xs text-gray-400">Dernière commande: {feed.lastOrder}</p></div></div>))}</div></CardContent></Card>

            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Tractor className="h-5 w-5" />Calculateur d'aliments</CardTitle></CardHeader><CardContent><div className="space-y-4"><div><label className="text-sm font-medium">Nombre de volailles</label><Input placeholder="Ex: 1000" /></div><div><label className="text-sm font-medium">Âge (semaines)</label><Input placeholder="Ex: 18" /></div><div><label className="text-sm font-medium">Type d'élevage</label><select className="w-full p-2 border rounded"><option>Pondeuses</option><option>Poulets de chair</option><option>Reproducteurs</option></select></div><Button className="w-full bg-purple-600 hover:bg-purple-700">Calculer les besoins (≈ 2.5 kg/jour)</Button></div></CardContent></Card>
          </div>
        </div>
      )}

      {/* Onglet Services */}
      {activeTab === "services" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map(service => (
            <Card key={service.id} className="hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2"><div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">{service.provider.charAt(0)}</div><div><p className="font-medium text-sm">{service.provider}</p><div className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500 fill-current" /><span className="text-xs">{service.rating}</span><span className="text-xs text-gray-400">• {service.experience} ans</span></div></div></div>
                  <Badge className={service.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>{service.available ? "Disponible" : "Occupé"}</Badge>
                </div>
                <h4 className="font-semibold text-sm mb-2">{service.service}</h4>
                <div className="flex justify-between items-center text-sm mb-3"><div className="flex items-center gap-1 text-gray-500"><MapPin className="h-3 w-3" /><span>{service.location}</span></div><span className="font-bold text-purple-600">{service.price} π</span></div>
                {service.phone && <p className="text-xs text-gray-400 mb-2">📞 {service.phone}</p>}
                <Button className="w-full" size="sm" disabled={!service.available} onClick={() => showToast(`Réservation de ${service.service} envoyée`, "success")}>{service.available ? "Réserver" : "Non disponible"}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal ajout lot */}
      <Dialog open={showBatchModal} onOpenChange={setShowBatchModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingBatch ? "Modifier le lot" : "Nouveau lot"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nom du lot</Label><Input value={newBatch.name} onChange={e => setNewBatch({ ...newBatch, name: e.target.value })} placeholder="Lot pondeuses A" /></div>
            <div><Label>Type</Label><select className="w-full p-2 border rounded" value={newBatch.type} onChange={e => setNewBatch({ ...newBatch, type: e.target.value as any })}><option value="pondeuses">Pondeuses</option><option value="poulets">Poulets de chair</option><option value="reproducteurs">Reproducteurs</option></select></div>
            <div><Label>Nombre de volailles</Label><Input type="number" value={newBatch.birds} onChange={e => setNewBatch({ ...newBatch, birds: parseInt(e.target.value) || 0 })} /></div>
            <div><Label>Âge (semaines)</Label><Input type="number" value={newBatch.age} onChange={e => setNewBatch({ ...newBatch, age: parseInt(e.target.value) || 0 })} /></div>
            <Button onClick={handleAddBatch} className="w-full bg-green-600">{editingBatch ? "Modifier" : "Créer"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal suivi santé */}
      <Dialog open={showHealthModal} onOpenChange={setShowHealthModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Ajouter un suivi santé</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Lot</Label><select className="w-full p-2 border rounded" value={healthRecord.batchId} onChange={e => setHealthRecord({ ...healthRecord, batchId: e.target.value })}><option value="">Sélectionner un lot</option>{batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
            <div><Label>Type</Label><select className="w-full p-2 border rounded" value={healthRecord.type} onChange={e => setHealthRecord({ ...healthRecord, type: e.target.value as any })}><option value="vaccination">Vaccination</option><option value="checkup">Consultation</option><option value="treatment">Traitement</option></select></div>
            <div><Label>Description</Label><Input value={healthRecord.description} onChange={e => setHealthRecord({ ...healthRecord, description: e.target.value })} placeholder="Vaccin Newcastle" /></div>
            <div><Label>Vétérinaire</Label><Input value={healthRecord.veterinarian} onChange={e => setHealthRecord({ ...healthRecord, veterinarian: e.target.value })} placeholder="Dr. Nom" /></div>
            <div><Label>Coût (π)</Label><Input type="number" step="0.001" value={healthRecord.cost} onChange={e => setHealthRecord({ ...healthRecord, cost: parseFloat(e.target.value) || 0 })} /></div>
            <Button onClick={handleAddHealthRecord} className="w-full bg-green-600">Ajouter</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Composant Label manquant
const Label = ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
)