"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Wallet,
  Pi,
  RefreshCw,
  AlertTriangle,
  Shield,
  Award,
  Briefcase,
  GraduationCap,
  Stethoscope,
  Truck,
  Landmark,
  Megaphone,
  Utensils,
  Wifi,
  WifiOff,
  Loader2,
  Phone,
  Mail,
  ExternalLink,
  Tag,
  Building,
  User,
  Clock as ClockIcon,
} from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useDebounce } from "@/hooks/use-debounce"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { showToast, formatNumber, formatRelativeTime } from "@/lib/utils"

interface ServiceManagementProps {
  currentLanguage: string
  userRegion: string
}

interface Service {
  id: string
  title: string
  description: string
  category: string
  price: number
  duration: string
  provider: string
  providerAvatar: string
  location: string
  rating: number
  reviews: number
  available: boolean
  image?: string
  phone?: string
  experience?: number
  createdAt: string
}

interface MyService {
  id: string
  title: string
  description: string
  category: string
  price: number
  status: "active" | "busy" | "paused"
  bookings: number
  earnings: number
  rating: number
  createdAt: string
}

// Traductions
const translations: Record<string, any> = {
  fr: {
    title: "Services & Marketplace",
    subtitle: "Offres et prestations agricoles",
    createService: "Créer un service",
    editService: "Modifier le service",
    myServices: "Mes services",
    browse: "Explorer",
    stats: "Statistiques",
    allCategories: "Toutes catégories",
    veterinary: "Vétérinaire",
    training: "Formation",
    consulting: "Conseil",
    equipment: "Matériel",
    feed: "Alimentation",
    processing: "Transformation",
    marketing: "Marketing",
    finance: "Finance",
    serviceTitle: "Titre du service",
    description: "Description",
    category: "Catégorie",
    price: "Prix",
    duration: "Durée",
    location: "Localisation",
    requirements: "Prérequis",
    availability: "Disponibilité",
    available: "Disponible",
    busy: "Occupé",
    paused: "En pause",
    active: "Actif",
    searchPlaceholder: "Rechercher un service...",
    filter: "Filtrer",
    book: "Réserver",
    contact: "Contacter",
    viewDetails: "Voir détails",
    totalRevenue: "Chiffre d'affaires",
    totalBookings: "Réservations",
    avgRating: "Note moyenne",
    activeServices: "Services actifs",
    online: "En ligne",
    offline: "Hors ligne",
    refresh: "Actualiser",
    loading: "Chargement...",
    noServices: "Aucun service disponible",
    noMyServices: "Vous n'avez pas encore créé de service",
    pricePlaceholder: "0.008",
    exTitle: "Ex: Consultation avicole",
    exDescription: "Description détaillée de votre service...",
    exDuration: "Ex: 2 heures",
    exLocation: "Ex: Ouagadougou",
    selectCategory: "Sélectionner une catégorie",
    serviceCreated: "Service créé avec succès",
    serviceDeleted: "Service supprimé",
    serviceUpdated: "Service mis à jour",
    bookingSuccess: "Réservation confirmée",
    bookingError: "Erreur lors de la réservation",
    insufficientBalance: "Solde insuffisant",
    confirmDelete: "Confirmer la suppression",
    deleteConfirmMessage: "Cette action est irréversible",
    cancel: "Annuler",
    delete: "Supprimer",
    provider: "Prestataire",
    reviews: "avis",
    experience: "ans d'expérience",
    call: "Appeler",
  },
  en: {
    title: "Services & Marketplace",
    subtitle: "Agricultural offers and services",
    createService: "Create service",
    editService: "Edit service",
    myServices: "My services",
    browse: "Browse",
    stats: "Stats",
    allCategories: "All categories",
    veterinary: "Veterinary",
    training: "Training",
    consulting: "Consulting",
    equipment: "Equipment",
    feed: "Feed",
    processing: "Processing",
    marketing: "Marketing",
    finance: "Finance",
    serviceTitle: "Service title",
    description: "Description",
    category: "Category",
    price: "Price",
    duration: "Duration",
    location: "Location",
    requirements: "Requirements",
    availability: "Availability",
    available: "Available",
    busy: "Busy",
    paused: "Paused",
    active: "Active",
    searchPlaceholder: "Search service...",
    filter: "Filter",
    book: "Book",
    contact: "Contact",
    viewDetails: "View details",
    totalRevenue: "Revenue",
    totalBookings: "Bookings",
    avgRating: "Avg rating",
    activeServices: "Active services",
    online: "Online",
    offline: "Offline",
    refresh: "Refresh",
    loading: "Loading...",
    noServices: "No services available",
    noMyServices: "You haven't created any services yet",
    pricePlaceholder: "0.008",
    exTitle: "Ex: Poultry consultation",
    exDescription: "Detailed description of your service...",
    exDuration: "Ex: 2 hours",
    exLocation: "Ex: Ouagadougou",
    selectCategory: "Select category",
    serviceCreated: "Service created successfully",
    serviceDeleted: "Service deleted",
    serviceUpdated: "Service updated",
    bookingSuccess: "Booking confirmed",
    bookingError: "Booking error",
    insufficientBalance: "Insufficient balance",
    confirmDelete: "Confirm deletion",
    deleteConfirmMessage: "This action is irreversible",
    cancel: "Cancel",
    delete: "Delete",
    provider: "Provider",
    reviews: "reviews",
    experience: "years experience",
    call: "Call",
  },
}

// Catégories avec icônes
const categories = [
  { id: "all", name: "Toutes", icon: "📋", color: "bg-gray-500" },
  { id: "veterinary", name: "Vétérinaire", icon: "🏥", color: "bg-blue-500" },
  { id: "training", name: "Formation", icon: "🎓", color: "bg-green-500" },
  { id: "consulting", name: "Conseil", icon: "💡", color: "bg-purple-500" },
  { id: "equipment", name: "Matériel", icon: "🔧", color: "bg-orange-500" },
  { id: "feed", name: "Alimentation", icon: "🌾", color: "bg-yellow-500" },
  { id: "processing", name: "Transformation", icon: "🏭", color: "bg-indigo-500" },
  { id: "marketing", name: "Marketing", icon: "📢", color: "bg-pink-500" },
  { id: "finance", name: "Finance", icon: "💰", color: "bg-emerald-500" },
]

// Données de démonstration
const demoAvailableServices: Service[] = [
  {
    id: "1",
    title: "Consultation vétérinaire avicole",
    description: "Consultation complète pour votre élevage de volailles. Diagnostic, conseils et plan de vaccination personnalisé.",
    category: "veterinary",
    price: 0.008,
    duration: "2 heures",
    provider: "Dr. Aminata Traoré",
    providerAvatar: "AT",
    location: "Ouagadougou",
    rating: 4.9,
    reviews: 23,
    available: true,
    phone: "+226 70 12 34 56",
    experience: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Formation aviculture moderne",
    description: "Formation intensive de 3 jours sur les techniques d'élevage moderne et la gestion sanitaire.",
    category: "training",
    price: 0.015,
    duration: "3 jours",
    provider: "Coopérative YELEN",
    providerAvatar: "CY",
    location: "Bobo-Dioulasso",
    rating: 4.7,
    reviews: 15,
    available: true,
    phone: "+226 70 23 45 67",
    experience: 8,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Location tracteur agricole",
    description: "Location de tracteur avec chauffeur pour labour, semis et transport.",
    category: "equipment",
    price: 25,
    duration: "Journée",
    provider: "Coopérative Mécanisation",
    providerAvatar: "CM",
    location: "Koudougou",
    rating: 4.6,
    reviews: 8,
    available: false,
    phone: "+226 70 34 56 78",
    experience: 10,
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Conseil en agriculture durable",
    description: "Accompagnement personnalisé pour l'adoption de pratiques agricoles durables.",
    category: "consulting",
    price: 0.012,
    duration: "1 heure",
    provider: "Ibrahim Sawadogo",
    providerAvatar: "IS",
    location: "Ouahigouya",
    rating: 4.8,
    reviews: 12,
    available: true,
    phone: "+226 70 45 67 89",
    experience: 15,
    createdAt: new Date().toISOString(),
  },
]

const demoMyServices: MyService[] = [
  {
    id: "m1",
    title: "Conseil en aviculture",
    description: "Accompagnement personnalisé pour votre élevage de volailles.",
    category: "consulting",
    price: 0.01,
    status: "active",
    bookings: 12,
    earnings: 0.12,
    rating: 4.8,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: "m2",
    title: "Formation pondeuses",
    description: "Formation sur l'optimisation de la production d'œufs.",
    category: "training",
    price: 0.02,
    status: "active",
    bookings: 8,
    earnings: 0.16,
    rating: 4.9,
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
  },
]

export default function ServiceManagement({ currentLanguage, userRegion }: ServiceManagementProps) {
  const [activeTab, setActiveTab] = useState("browse")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showCreateService, setShowCreateService] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [editingService, setEditingService] = useState<MyService | null>(null)
  const [language, setLanguage] = useState(currentLanguage)
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const isOnline = useOnlineStatus()
  const { userData, isAuthenticated } = usePiAuth()
  const debouncedSearch = useDebounce(searchQuery, 300)

  const [services, setServices] = useState<Service[]>(demoAvailableServices)
  const [myServices, setMyServices] = useState<MyService[]>(demoMyServices)
  const [isLoadingServices, setIsLoadingServices] = useState(false)

  const t = translations[language as keyof typeof translations] || translations.fr

  const [newService, setNewService] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    duration: "",
    location: "",
    availability: "available",
  })

  // Filtrer les services
  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      service.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      service.provider.toLowerCase().includes(debouncedSearch.toLowerCase())
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Statistiques
  const totalRevenue = myServices.reduce((sum, s) => sum + (s.earnings || 0), 0)
  const totalBookings = myServices.reduce((sum, s) => sum + (s.bookings || 0), 0)
  const avgRating = myServices.length > 0
    ? myServices.reduce((sum, s) => sum + (s.rating || 0), 0) / myServices.length
    : 0
  const activeServicesCount = myServices.filter(s => s.status === "active").length

  // Créer un service
  const handleCreateService = async () => {
    if (!newService.title || !newService.category || !newService.price) {
      showToast("Veuillez remplir tous les champs obligatoires", "error")
      return
    }

    if (!isOnline) {
      showToast("Connexion internet requise", "error")
      return
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newServiceData: MyService = {
        id: `m${Date.now()}`,
        title: newService.title,
        description: newService.description,
        category: newService.category,
        price: parseFloat(newService.price),
        status: "active",
        bookings: 0,
        earnings: 0,
        rating: 0,
        createdAt: new Date().toISOString(),
      }

      setMyServices([newServiceData, ...myServices])
      setShowCreateService(false)
      setNewService({
        title: "",
        description: "",
        category: "",
        price: "",
        duration: "",
        location: "",
        availability: "available",
      })
      showToast(t.serviceCreated, "success")
    } catch {
      showToast("Erreur lors de la création", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Supprimer un service
  const handleDeleteService = async (id: string) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setMyServices(myServices.filter(s => s.id !== id))
      setShowDeleteConfirm(null)
      showToast(t.serviceDeleted, "success")
    } catch {
      showToast("Erreur lors de la suppression", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Réserver un service (paiement Pi)
  const handleBookService = async (service: Service) => {
    if (!isOnline) {
      showToast("Connexion internet requise", "error")
      return
    }

    if (!isAuthenticated) {
      showToast("Veuillez vous connecter avec Pi Network", "error")
      return
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      showToast(`Réservation confirmée pour ${service.price} π`, "success")
    } catch {
      showToast("Erreur lors de la réservation", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Rafraîchir les données
  const refreshData = useCallback(async () => {
    if (!isOnline) {
      showToast("Connexion internet requise", "error")
      return
    }

    setIsSyncing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      showToast("Données actualisées", "success")
    } catch {
      showToast("Erreur lors de l'actualisation", "error")
    } finally {
      setIsSyncing(false)
    }
  }, [isOnline])

  useEffect(() => {
    setLanguage(currentLanguage)
  }, [currentLanguage])

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId) || categories[0]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700"
      case "busy": return "bg-yellow-100 text-yellow-700"
      case "paused": return "bg-gray-100 text-gray-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return t.available
      case "busy": return t.busy
      case "paused": return t.paused
      default: return status
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Briefcase className="h-6 w-6 text-green-600" />
            <h2 className="text-xl md:text-2xl font-bold">{t.title}</h2>
            {!isOnline && (
              <Badge className="bg-yellow-500 text-white text-xs gap-1">
                <WifiOff className="h-3 w-3" />
                {t.offline}
              </Badge>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">{t.subtitle} - {userRegion}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isSyncing} className="gap-1">
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            {t.refresh}
          </Button>
          <Dialog open={showCreateService} onOpenChange={setShowCreateService}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 gap-1 text-sm">
                <Plus className="h-4 w-4" />
                {t.createService}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Plus className="h-5 w-5 text-green-600" />
                  {editingService ? t.editService : t.createService}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>{t.serviceTitle} *</Label>
                  <Input
                    value={newService.title}
                    onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                    placeholder={t.exTitle}
                  />
                </div>
                <div>
                  <Label>{t.description} *</Label>
                  <Textarea
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    placeholder={t.exDescription}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t.category} *</Label>
                    <Select value={newService.category} onValueChange={(v) => setNewService({ ...newService, category: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectCategory} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c.id !== "all").map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-2">
                              <span>{cat.icon}</span>
                              <span>{cat.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t.price} (π) *</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                      placeholder={t.pricePlaceholder}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t.duration}</Label>
                    <Input
                      value={newService.duration}
                      onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                      placeholder={t.exDuration}
                    />
                  </div>
                  <div>
                    <Label>{t.location}</Label>
                    <Input
                      value={newService.location}
                      onChange={(e) => setNewService({ ...newService, location: e.target.value })}
                      placeholder={t.exLocation}
                    />
                  </div>
                </div>
                <div>
                  <Label>{t.availability}</Label>
                  <Select value={newService.availability} onValueChange={(v) => setNewService({ ...newService, availability: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">{t.available}</SelectItem>
                      <SelectItem value="busy">{t.busy}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleCreateService}
                  className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pi className="h-4 w-4" />}
                  {editingService ? t.editService : t.createService}
                </Button>
                {!isOnline && <p className="text-xs text-red-500 text-center">⚠️ {t.offline}</p>}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse" className="gap-2">
            <Search className="h-4 w-4" />
            {t.browse}
          </TabsTrigger>
          <TabsTrigger value="my-services" className="gap-2">
            <Briefcase className="h-4 w-4" />
            {t.myServices}
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            {t.stats}
          </TabsTrigger>
        </TabsList>

        {/* Onglet Explorer */}
        <TabsContent value="browse" className="mt-6 space-y-4">
          {/* Barre de recherche et filtres */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  size="sm"
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  className={`gap-1 whitespace-nowrap ${selectedCategory === cat.id ? "bg-green-600" : ""}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span>{cat.icon}</span>
                  <span className="hidden sm:inline">{cat.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Liste des services */}
          {isLoadingServices ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">{t.noServices}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredServices.map((service) => {
                const category = getCategoryInfo(service.category)
                return (
                  <Card key={service.id} className="hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex gap-3">
                          <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center text-white text-xl bg-opacity-20`}>
                            <span>{category.icon}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{service.title}</h3>
                              <Badge className={service.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
                                {service.available ? t.available : t.busy}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{service.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span>{service.rating}</span>
                                <span>({service.reviews} {t.reviews})</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{service.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ClockIcon className="h-3 w-3" />
                                <span>{service.duration}</span>
                              </div>
                              {service.experience && (
                                <div className="flex items-center gap-1">
                                  <Award className="h-3 w-3" />
                                  <span>{service.experience} {t.experience}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <User className="h-2.5 w-2.5" />
                              {service.provider}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xl font-bold text-purple-600">{service.price} π</p>
                            <p className="text-xs text-gray-500">Prix estimé</p>
                          </div>
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 gap-1"
                            onClick={() => handleBookService(service)}
                            disabled={!service.available || isLoading}
                          >
                            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Pi className="h-3 w-3" />}
                            {t.book}
                          </Button>
                          {service.phone && (
                            <Button size="sm" variant="outline" className="gap-1" asChild>
                              <a href={`tel:${service.phone}`}>
                                <Phone className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Onglet Mes services */}
        <TabsContent value="my-services" className="mt-6 space-y-4">
          {myServices.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">{t.noMyServices}</p>
              <Button variant="outline" className="mt-4 gap-2" onClick={() => setShowCreateService(true)}>
                <Plus className="h-4 w-4" />
                {t.createService}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {myServices.map((service) => {
                const category = getCategoryInfo(service.category)
                return (
                  <Card key={service.id} className="hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex gap-3">
                          <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center text-white text-lg bg-opacity-20`}>
                            <span>{category.icon}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{service.title}</h3>
                              <Badge className={getStatusColor(service.status)}>
                                {getStatusLabel(service.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-1">{service.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span>{service.rating || "Nouveau"}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{service.bookings} réservations</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatRelativeTime(service.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg font-bold text-purple-600">{service.price} π</p>
                            <p className="text-xs text-gray-500">Gagné: {service.earnings} π</p>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1"
                            onClick={() => setShowDeleteConfirm(service.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                            {t.delete}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Onglet Statistiques */}
        <TabsContent value="stats" className="mt-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-purple-600">{totalRevenue.toFixed(4)} π</p>
                <p className="text-xs text-gray-500">{t.totalRevenue}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold">{totalBookings}</p>
                <p className="text-xs text-gray-500">{t.totalBookings}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                </div>
                <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
                <p className="text-xs text-gray-500">{t.avgRating}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold">{activeServicesCount}</p>
                <p className="text-xs text-gray-500">{t.activeServices}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progression mensuelle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Janvier</span>
                    <span className="font-medium">2.5 π</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Février</span>
                    <span className="font-medium">4.2 π</span>
                  </div>
                  <Progress value={42} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Mars</span>
                    <span className="font-medium">6.8 π</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Répartition par catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categories.filter(c => c.id !== "all").map((cat) => {
                  const count = myServices.filter(s => s.category === cat.id).length
                  if (count === 0) return null
                  return (
                    <div key={cat.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center gap-2"><span>{cat.icon}</span> {cat.name}</span>
                        <span className="font-medium">{count} service{count > 1 ? 's' : ''}</span>
                      </div>
                      <Progress value={Math.min((count / myServices.length) * 100, 100)} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de confirmation de suppression */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              {t.confirmDelete}
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">{t.deleteConfirmMessage}</p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(null)}>
              {t.cancel}
            </Button>
            <Button
              variant="destructive"
              className="flex-1 gap-2"
              onClick={() => showDeleteConfirm && handleDeleteService(showDeleteConfirm)}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {t.delete}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}