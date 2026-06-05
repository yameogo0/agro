"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Search,
  Star,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle,
  Edit,
  Trash2,
  MessageSquare,
  Heart,
  Loader2,
  Wifi,
  WifiOff,
  RefreshCw,
  Pi,
  Crown,
} from "lucide-react"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useSubscription } from "@/contexts/SubscriptionContext"
import { showToast } from "@/lib/utils"
import { createPiPayment, isPiSDKAvailable } from "@/lib/pi-payments"

interface ServiceManagementProps {
  currentLanguage: string
  userRegion: string
  onTabChange?: (tab: string) => void
}

interface Service {
  id: string
  title: string
  description: string
  provider: {
    name: string
    avatar: string
    rating: number
    reviews: number
    verified: boolean
    location: string
  }
  category: string
  price: number
  priceDisplay: string
  duration: string
  availability: "available" | "busy"
  tags: string[]
  bookings: number
  createdAt: string
}

interface MyService {
  id: string
  title: string
  description: string
  category: string
  price: number
  priceDisplay: string
  status: "active" | "inactive"
  bookings: number
  earnings: number
  earningsDisplay: string
  rating: number
  createdAt: string
}

interface Booking {
  id: string
  serviceId: string
  serviceTitle: string
  providerName: string
  clientName: string
  amount: number
  amountDisplay: string
  date: string
  time: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  paymentId?: string
}

export default function ServiceManagement({ currentLanguage, userRegion, onTabChange }: ServiceManagementProps) {
  const [activeTab, setActiveTab] = useState("browse")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showCreateService, setShowCreateService] = useState(false)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const isOnline = useOnlineStatus()
  const { isAuthenticated, userData } = usePiAuth()
  const { isVif } = useSubscription() // ✅ Récupération du statut Membre Vif
  const [favoriteServices, setFavoriteServices] = useLocalStorage<string[]>("favoriteServices", [])
  const [myBookings, setMyBookings] = useLocalStorage<Booking[]>("userBookings", [])

  const [newService, setNewService] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    duration: "",
    location: "",
    requirements: "",
    availability: "available",
  })

  const serviceCategories = [
    { id: "all", name: "Tous les services", count: 156 },
    { id: "veterinary", name: "Services vétérinaires", count: 23 },
    { id: "training", name: "Formation & Éducation", count: 34 },
    { id: "consulting", name: "Conseil technique", count: 28 },
    { id: "equipment", name: "Équipements & Matériel", count: 19 },
    { id: "feed", name: "Alimentation animale", count: 15 },
    { id: "processing", name: "Transformation", count: 12 },
    { id: "marketing", name: "Marketing & Vente", count: 18 },
    { id: "finance", name: "Services financiers", count: 7 },
  ]

  const [availableServices] = useState<Service[]>([
    {
      id: "service1",
      title: "Consultation vétérinaire aviculture",
      description: "Diagnostic et traitement des maladies aviaires. Consultation à domicile ou en ligne.",
      provider: {
        name: "Dr. Aminata Traoré",
        avatar: "AT",
        rating: 4.9,
        reviews: 127,
        verified: true,
        location: "Ouagadougou, Burkina Faso",
      },
      category: "veterinary",
      price: 0.008,
      priceDisplay: "0.008 π",
      duration: "1 heure",
      availability: "available",
      tags: ["Aviculture", "Diagnostic", "Traitement"],
      bookings: 89,
      createdAt: "2024-01-15",
    },
    {
      id: "service2",
      title: "Formation complète en aviculture moderne",
      description: "Formation pratique sur les techniques modernes d'élevage de volailles.",
      provider: {
        name: "Coopérative YELEN",
        avatar: "CY",
        rating: 4.7,
        reviews: 89,
        verified: true,
        location: "Bobo-Dioulasso, Burkina Faso",
      },
      category: "training",
      price: 0.025,
      priceDisplay: "0.025 π",
      duration: "3 jours",
      availability: "available",
      tags: ["Formation", "Aviculture", "Certification"],
      bookings: 156,
      createdAt: "2024-01-10",
    },
    {
      id: "service3",
      title: "Analyse nutritionnelle des aliments",
      description: "Service d'analyse de la qualité nutritionnelle des aliments pour volailles.",
      provider: {
        name: "TechAgri Solutions",
        avatar: "TS",
        rating: 4.8,
        reviews: 67,
        verified: true,
        location: "Koudougou, Burkina Faso",
      },
      category: "consulting",
      price: 0.012,
      priceDisplay: "0.012 π",
      duration: "2-3 jours",
      availability: "busy",
      tags: ["Nutrition", "Analyse", "Conseil"],
      bookings: 45,
      createdAt: "2024-01-08",
    },
    {
      id: "service4",
      title: "Vente d'équipements d'élevage",
      description: "Fourniture d'équipements modernes pour l'élevage.",
      provider: {
        name: "Agro-Équip Sahel",
        avatar: "AE",
        rating: 4.6,
        reviews: 234,
        verified: true,
        location: "Kaya, Burkina Faso",
      },
      category: "equipment",
      price: 25,
      priceDisplay: "25 π",
      duration: "Livraison 2-5 jours",
      availability: "available",
      tags: ["Équipements", "Matériel", "Livraison"],
      bookings: 312,
      createdAt: "2024-01-05",
    },
  ])

  const [myServices] = useState<MyService[]>([
    {
      id: "myservice1",
      title: "Conseil en gestion d'élevage",
      description: "Accompagnement personnalisé pour optimiser votre élevage de volailles.",
      category: "consulting",
      price: 0.015,
      priceDisplay: "0.015 π",
      status: "active",
      bookings: 23,
      earnings: 0.345,
      earningsDisplay: "0.345 π",
      rating: 4.8,
      createdAt: "2024-01-20",
    },
    {
      id: "myservice2",
      title: "Formation pratique aviculture",
      description: "Formation sur site pour les techniques d'élevage moderne.",
      category: "training",
      price: 0.03,
      priceDisplay: "0.030 π",
      status: "active",
      bookings: 12,
      earnings: 0.36,
      earningsDisplay: "0.360 π",
      rating: 4.9,
      createdAt: "2024-01-18",
    },
  ])

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

  const handleBookService = async (service: Service) => {
    // Vérifications
    if (!isOnline) {
      showToast("Connexion internet requise", "error")
      return
    }

    if (!isAuthenticated) {
      showToast("Veuillez vous connecter avec Pi Network", "error")
      return
    }

    if (!isPiSDKAvailable()) {
      showToast("Veuillez ouvrir cette application dans Pi Browser", "error")
      return
    }

    if (service.availability !== "available") {
      showToast("Ce service n'est pas disponible pour le moment", "error")
      return
    }

    setIsProcessing(service.id)

    try {
      // Créer le paiement Pi
      const payment = await createPiPayment(service.price, `Réservation: ${service.title}`)
      
      if (payment.identifier) {
        // Sauvegarder la réservation
        const newBooking: Booking = {
          id: payment.identifier,
          serviceId: service.id,
          serviceTitle: service.title,
          providerName: service.provider.name,
          clientName: userData?.username || "Client",
          amount: service.price,
          amountDisplay: service.priceDisplay,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: "confirmed",
          paymentId: payment.identifier,
        }
        
        setMyBookings([newBooking, ...myBookings])
        showToast(`✅ Réservation confirmée ! ${service.priceDisplay} débité`, "success")
      } else {
        throw new Error('Paiement échoué')
      }
    } catch (error: any) {
      console.error("Erreur paiement:", error)
      showToast(error.message || "Erreur lors du paiement", "error")
    } finally {
      setIsProcessing(null)
    }
  }

  const handleCreateService = () => {
    // ✅ Vérification du statut Vif avant création
    if (!isVif) {
      showToast("Seuls les membres Vif peuvent créer des services. Abonnez-vous !", "error")
      return
    }
    
    if (!newService.title || !newService.category || !newService.price) {
      showToast("Veuillez remplir tous les champs obligatoires", "error")
      return
    }
    setShowCreateService(false)
    setNewService({
      title: "",
      description: "",
      category: "",
      price: "",
      duration: "",
      location: "",
      requirements: "",
      availability: "available",
    })
    showToast("Service créé avec succès", "success")
  }

  const handleToggleFavorite = (serviceId: string) => {
    if (favoriteServices.includes(serviceId)) {
      setFavoriteServices(favoriteServices.filter(id => id !== serviceId))
      showToast("Retiré des favoris", "info")
    } else {
      setFavoriteServices([...favoriteServices, serviceId])
      showToast("Ajouté aux favoris", "success")
    }
  }

  const filteredServices = availableServices.filter((service) => {
    const matchesSearch =
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.provider.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalEarnings = myServices.reduce((sum, s) => sum + s.earnings, 0)
  const totalBookings = myServices.reduce((sum, s) => sum + s.bookings, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Services</h2>
          <p className="text-gray-500 text-sm">Découvrez et proposez des services agricoles - {userRegion}</p>
        </div>
        <div className="flex gap-2">
          {!isOnline && <Badge className="bg-yellow-500 text-white gap-1"><WifiOff className="h-3 w-3" />Hors ligne</Badge>}
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Dialog open={showCreateService} onOpenChange={setShowCreateService}>
            <DialogTrigger asChild>
              <Button 
                className={`${isVif ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}`}
                disabled={!isVif}
                title={!isVif ? "Seuls les membres Vif peuvent proposer des services" : "Proposer un service"}
              >
                <Plus className="h-4 w-4 mr-2" />
                Proposer un service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">Créer un nouveau service</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div><Label>Titre du service *</Label><Input value={newService.title} onChange={(e) => setNewService({ ...newService, title: e.target.value })} placeholder="Ex: Consultation vétérinaire" /></div>
                <div><Label>Description *</Label><Textarea value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} placeholder="Décrivez votre service..." rows={3} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Catégorie *</Label><Select value={newService.category} onValueChange={(value) => setNewService({ ...newService, category: value })}><SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger><SelectContent>{serviceCategories.slice(1).map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent></Select></div>
                  <div><Label>Prix (π) *</Label><Input type="number" step="0.001" value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} placeholder="0.000" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Durée</Label><Input value={newService.duration} onChange={(e) => setNewService({ ...newService, duration: e.target.value })} placeholder="Ex: 2 heures" /></div>
                  <div><Label>Localisation</Label><Input value={newService.location} onChange={(e) => setNewService({ ...newService, location: e.target.value })} placeholder="Ville, région" /></div>
                </div>
                <div><Label>Prérequis</Label><Textarea value={newService.requirements} onChange={(e) => setNewService({ ...newService, requirements: e.target.value })} placeholder="Conditions requises..." rows={2} /></div>
                <Button onClick={handleCreateService} className="w-full bg-green-600">Créer le service</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ✅ Message pour les non-Vif */}
      {!isVif && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="h-8 w-8 text-amber-500" />
            <div>
              <p className="font-semibold text-amber-800">Devenez Membre Vif</p>
              <p className="text-sm text-amber-700">Proposez des services, vendez vos produits et recevez des pourboires</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="border-amber-400 text-amber-700 hover:bg-amber-50"
            onClick={() => onTabChange?.('subscription')}
          >
            <Crown className="h-4 w-4 mr-2" />
            S'abonner (1 π/mois)
          </Button>
        </div>
      )}

      {/* Service Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Parcourir</TabsTrigger>
          <TabsTrigger value="my-services">Mes services</TabsTrigger>
          <TabsTrigger value="bookings">Réservations</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-6 space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" /><Input placeholder="Rechercher des services..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}><SelectTrigger className="w-full sm:w-64"><SelectValue /></SelectTrigger><SelectContent>{serviceCategories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name} ({cat.count})</SelectItem>))}</SelectContent></Select>
          </div>

          {/* Services List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredServices.map((service) => (
              <Card key={service.id} className="hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-lg">{service.provider.avatar}</div>
                      <div><div className="flex items-center gap-1"><p className="font-medium text-sm">{service.provider.name}</p>{service.provider.verified && <CheckCircle className="h-3 w-3 text-green-500" />}</div><div className="flex items-center gap-2 text-xs text-gray-500"><Star className="h-3 w-3 text-yellow-500 fill-current" /><span>{service.provider.rating}</span><span>•</span><span>{service.provider.reviews} avis</span></div></div>
                    </div>
                    <Badge className={service.availability === "available" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>{service.availability === "available" ? "Disponible" : "Occupé"}</Badge>
                  </div>
                  <h3 className="font-semibold text-base mb-1">{service.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{service.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">{service.tags.map((tag, i) => (<Badge key={i} variant="outline" className="text-[10px]">{tag}</Badge>))}</div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3"><Clock className="h-3 w-3" /><span>{service.duration}</span><MapPin className="h-3 w-3 ml-1" /><span>{service.provider.location.split(",")[0]}</span></div>
                  <div className="flex justify-between items-center">
                    <div><p className="text-xl font-bold text-purple-600">{service.priceDisplay}</p><p className="text-[10px] text-gray-400">{service.bookings} réservations</p></div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleToggleFavorite(service.id)}><Heart className={`h-4 w-4 ${favoriteServices.includes(service.id) ? "fill-red-500 text-red-500" : ""}`} /></Button>
                      <Button size="sm" variant="outline" className="h-8 gap-1 text-xs"><MessageSquare className="h-3 w-3" />Contacter</Button>
                      <Button 
                        size="sm" 
                        className="bg-purple-600 hover:bg-purple-700 h-8 gap-1 text-xs" 
                        disabled={service.availability !== "available" || isProcessing === service.id} 
                        onClick={() => handleBookService(service)}
                      >
                        {isProcessing === service.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Pi className="h-3 w-3" />}
                        Réserver
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-services" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Mes services ({myServices.length})</h3>
              {!isVif && myServices.length === 0 && (
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  <Crown className="h-3 w-3 mr-1" />
                  Devenez Vif
                </Badge>
              )}
            </div>
            <Button 
              size="sm" 
              onClick={() => setShowCreateService(true)}
              disabled={!isVif}
              title={!isVif ? "Seuls les membres Vif peuvent créer des services" : ""}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau service
            </Button>
          </div>
          
          {myServices.length === 0 && !isVif ? (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-8 text-center">
                <Crown className="h-12 w-12 text-amber-400 mx-auto mb-3" />
                <p className="font-medium text-amber-800">Vous n'avez pas encore de services</p>
                <p className="text-sm text-amber-700 mb-4">Devenez Membre Vif pour proposer vos services</p>
                <Button 
                  variant="outline" 
                  className="border-amber-400 text-amber-700"
                  onClick={() => onTabChange?.('subscription')}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Devenir Membre Vif (1 π/mois)
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myServices.map((service) => (
                <Card key={service.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold">{service.title}</h3>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" disabled={!isVif}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" disabled={!isVif}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{service.description}</p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="text-center p-2 bg-green-50 rounded">
                        <p className="text-lg font-bold text-green-600">{service.bookings}</p>
                        <p className="text-[10px] text-green-700">Réservations</p>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <p className="text-lg font-bold text-purple-600">{service.earningsDisplay}</p>
                        <p className="text-[10px] text-purple-700">Gains</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-sm">{service.rating}</span>
                        <Badge className={service.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
                          {service.status === "active" ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                      <p className="text-lg font-bold text-purple-600">{service.priceDisplay}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Mes réservations</CardTitle></CardHeader>
            <CardContent>
              {myBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune réservation pour le moment</p>
                  <p className="text-sm">Les réservations apparaîtront ici après paiement</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myBookings.map((booking) => (
                    <div key={booking.id} className="flex flex-col sm:flex-row justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                          {booking.providerName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{booking.serviceTitle}</p>
                          <p className="text-xs text-gray-500">{booking.providerName} • {booking.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0">
                        <p className="font-bold text-purple-600 text-sm">{booking.amountDisplay}</p>
                        <Badge className="bg-green-100 text-green-700">Confirmé</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><TrendingUp className="h-5 w-5 text-blue-600 mx-auto mb-1" /><p className="text-xl font-bold">{totalBookings}</p><p className="text-xs text-gray-500">Réservations</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Pi className="h-5 w-5 text-purple-600 mx-auto mb-1" /><p className="text-xl font-bold">{totalEarnings.toFixed(4)} π</p><p className="text-xs text-gray-500">Revenus totaux</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Star className="h-5 w-5 text-yellow-500 mx-auto mb-1 fill-current" /><p className="text-xl font-bold">4.8</p><p className="text-xs text-gray-500">Note moyenne</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" /><p className="text-xl font-bold">{myServices.length}</p><p className="text-xs text-gray-500">Services actifs</p></CardContent></Card>
      </div>
    </div>
  )
}