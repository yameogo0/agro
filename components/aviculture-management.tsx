"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Pill,
  Syringe,
  Apple,
  Calendar,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
  WifiOff,
  RefreshCw,
  PieChart,
  LineChart,
  Package,
  ShoppingCart,
  Phone,
  MapPin,
  Clock,
  Heart,
  Droplets,
  Thermometer,
  Weight,
  Egg,
  Users,
  AlertCircle,
} from "lucide-react"

import { useOnlineStatus } from "@/hooks/use-online-status"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { showToast } from "@/lib/utils"
import { createPiPayment, isPiSDKAvailable } from "@/lib/pi-payments"

interface AvicultureManagementProps {
  currentLanguage: string
  userRegion: string
}

// Types
interface PoultryBatch {
  id: string
  name: string
  breed: string
  count: number
  initialCount: number
  startDate: string
  expectedEndDate: string
  location: string
  status: "active" | "completed" | "culled"
  notes?: string
  mortality: number
  weight?: number // average weight in kg
  feedConsumption: number // total feed consumed in kg
  eggProduction?: number // daily egg production
}

interface HealthRecord {
  id: string
  batchId: string
  date: string
  type: "vaccination" | "treatment" | "checkup" | "alert"
  title: string
  description: string
  product?: string
  dosage?: string
  nextDue?: string
  status: "done" | "scheduled" | "overdue"
  performedBy?: string
}

interface FeedStock {
  id: string
  name: string
  type: "starter" | "grower" | "layer" | "finisher"
  currentStock: number // kg
  unit: string
  pricePerUnit: number // Pi
  threshold: number
  supplier: string
}

interface FeedConsumptionRecord {
  id: string
  batchId: string
  date: string
  amount: number // kg
  feedType: string
}

interface VetService {
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

// Données mockées initiales
const mockBatches: PoultryBatch[] = [
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
    mortality: 20,
    weight: 2.1,
    feedConsumption: 680,
  },
]

const mockHealthRecords: HealthRecord[] = [
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
]

const mockFeedStock: FeedStock[] = [
  { id: "feed1", name: "Aliment démarrage", type: "starter", currentStock: 850, unit: "kg", pricePerUnit: 0.45, threshold: 200, supplier: "NutriVolaille" },
  { id: "feed2", name: "Aliment croissance", type: "grower", currentStock: 420, unit: "kg", pricePerUnit: 0.42, threshold: 150, supplier: "AgriFeed" },
  { id: "feed3", name: "Aliment ponte", type: "layer", currentStock: 1200, unit: "kg", pricePerUnit: 0.48, threshold: 300, supplier: "NutriVolaille" },
]

const mockVetServices: VetService[] = [
  { id: "svc1", name: "Consultation vétérinaire à domicile", description: "Examen complet de l'élevage", price: 0.015, duration: "2h", available: true, provider: "Dr. Aminata Traoré", location: "Ouagadougou", rating: 4.9 },
  { id: "svc2", name: "Programme de vaccination complet", description: "Vaccination pour tout le cheptel", price: 0.025, duration: "1 journée", available: true, provider: "SantéAviaire BF", location: "Bobo-Dioulasso", rating: 4.8 },
  { id: "svc3", name: "Analyse de laboratoire", description: "Diagnostic de maladies aviaires", price: 0.008, duration: "48h", available: true, provider: "Labo vétérinaire national", location: "Ouagadougou", rating: 4.7 },
]

export default function AvicultureManagement({ currentLanguage, userRegion }: AvicultureManagementProps) {
  const isOnline = useOnlineStatus()
  const { isAuthenticated, userData } = usePiAuth()
  const [activeTab, setActiveTab] = useState("overview")

  // États principaux
  const [batches, setBatches] = useLocalStorage<PoultryBatch[]>("aviculture_batches", mockBatches)
  const [healthRecords, setHealthRecords] = useLocalStorage<HealthRecord[]>("aviculture_health", mockHealthRecords)
  const [feedStock, setFeedStock] = useLocalStorage<FeedStock[]>("aviculture_feed", mockFeedStock)
  const [feedConsumptions, setFeedConsumptions] = useLocalStorage<FeedConsumptionRecord[]>("aviculture_consumption", [])
  const [vetServices] = useState<VetService[]>(mockVetServices)

  // États UI
  const [selectedBatch, setSelectedBatch] = useState<PoultryBatch | null>(null)
  const [showBatchDialog, setShowBatchDialog] = useState(false)
  const [showHealthDialog, setShowHealthDialog] = useState(false)
  const [showFeedOrderDialog, setShowFeedOrderDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [editingBatch, setEditingBatch] = useState<PoultryBatch | null>(null)
  const [editingHealth, setEditingHealth] = useState<HealthRecord | null>(null)

  // Formulaires
  const [batchForm, setBatchForm] = useState({
    name: "", breed: "", count: 0, startDate: "", expectedEndDate: "", location: "", notes: "",
  })
  const [healthForm, setHealthForm] = useState({
    batchId: "", type: "vaccination", title: "", description: "", product: "", dosage: "", nextDue: "", status: "scheduled",
  })
  const [feedOrder, setFeedOrder] = useState({ feedId: "", quantity: 0 })

  // Calculs pour l'aperçu
  const totalBirds = batches.filter(b => b.status === "active").reduce((sum, b) => sum + b.count, 0)
  const totalMortality = batches.reduce((sum, b) => sum + b.mortality, 0)
  const totalFeedStock = feedStock.reduce((sum, f) => sum + f.currentStock, 0)
  const lowStockAlerts = feedStock.filter(f => f.currentStock <= f.threshold)
  const overdueHealth = healthRecords.filter(h => h.status === "overdue")
  const averageEggProduction = batches.filter(b => b.eggProduction).reduce((sum, b) => sum + (b.eggProduction || 0), 0)

  // Fonctions de gestion des lots
  const handleAddBatch = () => {
    if (!batchForm.name || !batchForm.breed || batchForm.count <= 0 || !batchForm.startDate) {
      showToast("Veuillez remplir tous les champs obligatoires", "error")
      return
    }
    const newBatch: PoultryBatch = {
      id: Date.now().toString(),
      name: batchForm.name,
      breed: batchForm.breed,
      count: batchForm.count,
      initialCount: batchForm.count,
      startDate: batchForm.startDate,
      expectedEndDate: batchForm.expectedEndDate,
      location: batchForm.location,
      status: "active",
      notes: batchForm.notes,
      mortality: 0,
      feedConsumption: 0,
    }
    setBatches([newBatch, ...batches])
    setShowBatchDialog(false)
    setBatchForm({ name: "", breed: "", count: 0, startDate: "", expectedEndDate: "", location: "", notes: "" })
    showToast("Lot ajouté avec succès", "success")
  }

  const handleUpdateBatch = () => {
    if (!editingBatch) return
    setBatches(batches.map(b => b.id === editingBatch.id ? editingBatch : b))
    setEditingBatch(null)
    showToast("Lot mis à jour", "success")
  }

  const handleDeleteBatch = (id: string) => {
    if (confirm("Supprimer ce lot ?")) {
      setBatches(batches.filter(b => b.id !== id))
      showToast("Lot supprimé", "info")
    }
  }

  const handleAddHealthRecord = () => {
    if (!healthForm.batchId || !healthForm.title) {
      showToast("Veuillez remplir les champs obligatoires", "error")
      return
    }
    const newRecord: HealthRecord = {
      id: Date.now().toString(),
      batchId: healthForm.batchId,
      date: new Date().toISOString().split("T")[0],
      type: healthForm.type as any,
      title: healthForm.title,
      description: healthForm.description,
      product: healthForm.product,
      dosage: healthForm.dosage,
      nextDue: healthForm.nextDue,
      status: healthForm.status as any,
    }
    setHealthRecords([newRecord, ...healthRecords])
    setShowHealthDialog(false)
    setHealthForm({ batchId: "", type: "vaccination", title: "", description: "", product: "", dosage: "", nextDue: "", status: "scheduled" })
    showToast("Enregistrement santé ajouté", "success")
  }

  // Achat d'aliment (paiement Pi)
  const handleOrderFeed = async () => {
    const feed = feedStock.find(f => f.id === feedOrder.feedId)
    if (!feed || feedOrder.quantity <= 0) {
      showToast("Sélectionnez un aliment et une quantité valide", "error")
      return
    }
    if (!isOnline) {
      showToast("Connexion internet requise", "error")
      return
    }
    if (!isAuthenticated) {
      showToast("Veuillez vous connecter avec Pi Network", "error")
      return
    }
    if (!isPiSDKAvailable()) {
      showToast("Ouvrez cette application dans Pi Browser", "error")
      return
    }

    const totalPrice = feed.pricePerUnit * feedOrder.quantity
    setIsProcessing(true)
    try {
      const payment = await createPiPayment(totalPrice, `Achat aliment: ${feed.name} x${feedOrder.quantity}kg`)
      if (payment.identifier) {
        // Mettre à jour le stock
        setFeedStock(feedStock.map(f => f.id === feed.id ? { ...f, currentStock: f.currentStock + feedOrder.quantity } : f))
        // Enregistrer la consommation
        const consumption: FeedConsumptionRecord = {
          id: Date.now().toString(),
          batchId: "stock",
          date: new Date().toISOString().split("T")[0],
          amount: feedOrder.quantity,
          feedType: feed.name,
        }
        setFeedConsumptions([consumption, ...feedConsumptions])
        showToast(`Commande réussie ! ${totalPrice} π débité`, "success")
        setShowFeedOrderDialog(false)
        setFeedOrder({ feedId: "", quantity: 0 })
      }
    } catch (error: any) {
      showToast(error.message || "Erreur lors du paiement", "error")
    } finally {
      setIsProcessing(false)
    }
  }

  // Réservation service vétérinaire
  const handleBookVetService = async (service: VetService) => {
    if (!isOnline || !isAuthenticated || !isPiSDKAvailable()) {
      showToast("Conditions non remplies (connexion, Pi Browser)", "error")
      return
    }
    setIsProcessing(true)
    try {
      const payment = await createPiPayment(service.price, `Service vétérinaire: ${service.name}`)
      if (payment.identifier) {
        showToast(`Service réservé ! ${service.price} π débité`, "success")
        // Ici vous pourriez enregistrer le rendez-vous dans localStorage
      }
    } catch (error: any) {
      showToast(error.message, "error")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">🐔 Gestion Avicole</h2>
          <p className="text-gray-500 text-sm">Gérez vos élevages de volailles - {userRegion}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setEditingBatch(null); setBatchForm({ name: "", breed: "", count: 0, startDate: "", expectedEndDate: "", location: "", notes: "" }); setShowBatchDialog(true) }} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" /> Nouveau lot
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 gap-2">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="batches">Mes lots</TabsTrigger>
          <TabsTrigger value="health">Santé</TabsTrigger>
          <TabsTrigger value="feeding">Alimentation</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        {/* ==================== APERÇU ==================== */}
        <TabsContent value="overview" className="space-y-4 mt-6">
          {/* Cartes KPI */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 text-blue-600 mx-auto mb-1" /><p className="text-2xl font-bold">{totalBirds}</p><p className="text-xs text-gray-500">Volailles actives</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><TrendingDown className="h-5 w-5 text-red-500 mx-auto mb-1" /><p className="text-2xl font-bold">{totalMortality}</p><p className="text-xs text-gray-500">Mortalité totale</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><Package className="h-5 w-5 text-orange-500 mx-auto mb-1" /><p className="text-2xl font-bold">{totalFeedStock} kg</p><p className="text-xs text-gray-500">Stock alimentaire</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><Egg className="h-5 w-5 text-yellow-500 mx-auto mb-1" /><p className="text-2xl font-bold">{averageEggProduction}</p><p className="text-xs text-gray-500">Œufs/jour</p></CardContent></Card>
          </div>

          {/* Alertes */}
          {(lowStockAlerts.length > 0 || overdueHealth.length > 0) && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-yellow-700 mb-2"><AlertTriangle className="h-5 w-5" />Alertes importantes</div>
                <div className="space-y-1 text-sm">
                  {lowStockAlerts.map(f => <div key={f.id}>⚠️ Stock faible : {f.name} ({f.currentStock} kg)</div>)}
                  {overdueHealth.map(h => <div key={h.id}>⚠️ {h.title} en retard depuis le {h.nextDue}</div>)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Derniers lots */}
          <Card><CardHeader><CardTitle>Derniers lots actifs</CardTitle></CardHeader><CardContent><div className="space-y-2">{batches.filter(b=>b.status==="active").slice(0,3).map(b=>(
            <div key={b.id} className="flex justify-between items-center p-2 border rounded"><div><p className="font-medium">{b.name}</p><p className="text-xs text-gray-500">{b.breed} • {b.count} sujets</p></div><Badge>{b.location}</Badge></div>
          ))}</div></CardContent></Card>
        </TabsContent>

        {/* ==================== MES LOTS ==================== */}
        <TabsContent value="batches" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {batches.map(batch => (
              <Card key={batch.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{batch.name}</h3>
                      <p className="text-xs text-gray-500">{batch.breed} • {batch.location}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingBatch(batch); setShowBatchDialog(true) }}><Edit className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => handleDeleteBatch(batch.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Effectif:</span> {batch.count}</div>
                    <div><span className="text-gray-500">Début:</span> {batch.startDate}</div>
                    <div><span className="text-gray-500">Mortalité:</span> {batch.mortality}</div>
                    {batch.weight && <div><span className="text-gray-500">Poids moy.:</span> {batch.weight} kg</div>}
                    {batch.eggProduction && <div><span className="text-gray-500">Ponte/jour:</span> {batch.eggProduction}</div>}
                  </div>
                  <Progress value={(batch.count / batch.initialCount) * 100} className="mt-3 h-1" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ==================== SANTÉ ==================== */}
        <TabsContent value="health" className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Suivi sanitaire</h3>
            <Button size="sm" onClick={() => { setEditingHealth(null); setHealthForm({ batchId: batches[0]?.id || "", type: "vaccination", title: "", description: "", product: "", dosage: "", nextDue: "", status: "scheduled" }); setShowHealthDialog(true) }}><Plus className="h-4 w-4 mr-1" />Ajouter un suivi</Button>
          </div>
          <div className="space-y-3">
            {healthRecords.map(rec => (
              <Card key={rec.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between">
                    <div><p className="font-medium">{rec.title}</p><p className="text-xs text-gray-500">{rec.type} • {rec.date}</p></div>
                    <Badge variant={rec.status === "done" ? "default" : rec.status === "scheduled" ? "secondary" : "destructive"}>{rec.status === "done" ? "Effectué" : rec.status === "scheduled" ? "Planifié" : "En retard"}</Badge>
                  </div>
                  {rec.description && <p className="text-sm mt-1">{rec.description}</p>}
                  {rec.product && <p className="text-xs text-gray-500">Produit: {rec.product} - {rec.dosage}</p>}
                  {rec.nextDue && <p className="text-xs text-blue-600 mt-1">Prochain: {rec.nextDue}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ==================== ALIMENTATION ==================== */}
        <TabsContent value="feeding" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedStock.map(feed => (
              <Card key={feed.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div><h3 className="font-semibold">{feed.name}</h3><p className="text-xs text-gray-500">Fournisseur: {feed.supplier}</p></div>
                    <Badge variant={feed.currentStock <= feed.threshold ? "destructive" : "default"}>{feed.currentStock} kg</Badge>
                  </div>
                  <Progress value={(feed.currentStock / 2000) * 100} className="my-2 h-1" />
                  <div className="flex justify-between text-sm">
                    <span>{feed.pricePerUnit} π/kg</span>
                    <Button size="sm" variant="outline" onClick={() => { setFeedOrder({ feedId: feed.id, quantity: 0 }); setShowFeedOrderDialog(true) }}><ShoppingCart className="h-3 w-3 mr-1" /> Commander</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ==================== SERVICES ==================== */}
        <TabsContent value="services" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vetServices.map(service => (
              <Card key={service.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div><h3 className="font-semibold">{service.name}</h3><p className="text-xs text-gray-500">{service.provider} • {service.location}</p><div className="flex items-center gap-1 mt-1"><Heart className="h-3 w-3 text-red-500" /> {service.rating}</div></div>
                    <Badge>{service.price} π</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{service.description}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-gray-400"><Clock className="h-3 w-3 inline mr-1" />{service.duration}</span>
                    <Button size="sm" className="bg-purple-600" disabled={isProcessing} onClick={() => handleBookVetService(service)}>{isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : "Réserver"}</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Ajout/Modification Lot */}
      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingBatch ? "Modifier le lot" : "Nouveau lot"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nom du lot *</Label><Input value={editingBatch ? editingBatch.name : batchForm.name} onChange={(e) => editingBatch ? setEditingBatch({...editingBatch, name: e.target.value}) : setBatchForm({...batchForm, name: e.target.value})} /></div>
            <div><Label>Race *</Label><Input value={editingBatch ? editingBatch.breed : batchForm.breed} onChange={(e) => editingBatch ? setEditingBatch({...editingBatch, breed: e.target.value}) : setBatchForm({...batchForm, breed: e.target.value})} /></div>
            <div><Label>Nombre de sujets *</Label><Input type="number" value={editingBatch ? editingBatch.count : batchForm.count} onChange={(e) => editingBatch ? setEditingBatch({...editingBatch, count: Number(e.target.value)}) : setBatchForm({...batchForm, count: Number(e.target.value)})} /></div>
            <div><Label>Date de début *</Label><Input type="date" value={editingBatch ? editingBatch.startDate : batchForm.startDate} onChange={(e) => editingBatch ? setEditingBatch({...editingBatch, startDate: e.target.value}) : setBatchForm({...batchForm, startDate: e.target.value})} /></div>
            <div><Label>Emplacement</Label><Input value={editingBatch ? editingBatch.location : batchForm.location} onChange={(e) => editingBatch ? setEditingBatch({...editingBatch, location: e.target.value}) : setBatchForm({...batchForm, location: e.target.value})} /></div>
            <div><Label>Notes</Label><Textarea value={editingBatch ? editingBatch.notes : batchForm.notes} onChange={(e) => editingBatch ? setEditingBatch({...editingBatch, notes: e.target.value}) : setBatchForm({...batchForm, notes: e.target.value})} /></div>
            <Button onClick={editingBatch ? handleUpdateBatch : handleAddBatch} className="w-full">{editingBatch ? "Mettre à jour" : "Créer le lot"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Santé */}
      <Dialog open={showHealthDialog} onOpenChange={setShowHealthDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajouter un suivi sanitaire</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Lot concerné</Label><select className="w-full border rounded p-2" value={healthForm.batchId} onChange={(e) => setHealthForm({...healthForm, batchId: e.target.value})}>{batches.map(b=> <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
            <div><Label>Type</Label><select className="w-full border rounded p-2" value={healthForm.type} onChange={(e) => setHealthForm({...healthForm, type: e.target.value as any})}><option value="vaccination">Vaccination</option><option value="treatment">Traitement</option><option value="checkup">Contrôle</option><option value="alert">Alerte</option></select></div>
            <div><Label>Titre *</Label><Input value={healthForm.title} onChange={(e) => setHealthForm({...healthForm, title: e.target.value})} /></div>
            <div><Label>Description</Label><Textarea value={healthForm.description} onChange={(e) => setHealthForm({...healthForm, description: e.target.value})} /></div>
            <div><Label>Produit / Médicament</Label><Input value={healthForm.product} onChange={(e) => setHealthForm({...healthForm, product: e.target.value})} /></div>
            <div><Label>Prochaine échéance</Label><Input type="date" value={healthForm.nextDue} onChange={(e) => setHealthForm({...healthForm, nextDue: e.target.value})} /></div>
            <Button onClick={handleAddHealthRecord}>Enregistrer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Commande aliment */}
      <Dialog open={showFeedOrderDialog} onOpenChange={setShowFeedOrderDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Commander un aliment</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Aliment</Label><select className="w-full border rounded p-2" value={feedOrder.feedId} onChange={(e) => setFeedOrder({...feedOrder, feedId: e.target.value})}>{feedStock.map(f=> <option key={f.id} value={f.id}>{f.name} ({f.pricePerUnit} π/kg)</option>)}</select></div>
            <div><Label>Quantité (kg) *</Label><Input type="number" step="10" value={feedOrder.quantity} onChange={(e) => setFeedOrder({...feedOrder, quantity: Number(e.target.value)})} /></div>
            <Button onClick={handleOrderFeed} disabled={isProcessing}>{isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Payer avec Pi"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}