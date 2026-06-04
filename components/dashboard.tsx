"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  MapPin,
  Globe,
  Shield,
  User,
  Wallet,
  Cloud,
  Droplets,
  Wind,
  AlertTriangle,
  TrendingUp,
  Users,
  Store,
  MessageSquare,
  BookOpen,
  Map,
  Activity,
  Bell,
  ChevronRight,
  Sprout,
  ShoppingCart,
  Wifi,
  WifiOff,
  RefreshCw,
  Star,
  ChevronLeft,
  Tractor,
  Loader2,
  CheckCircle,
  Clock,
  Calendar,
  Heart,
  Leaf,
  Sun,
  CloudRain,
  Thermometer,
  Package,
  Award,
  Target,
  Zap,
  BarChart3,
  LineChart,
} from "lucide-react"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { showToast, formatRelativeTime, formatNumber, formatDate } from "@/lib/utils"

interface DashboardProps {
  currentLanguage: string
  userRegion: string
  onTabChange: (tab: string) => void
}

interface WeatherData {
  temperature: number
  condition: string
  icon: string
  humidity: number
  windSpeed: number
  pressure: number
  uvIndex: number
  advice: string
  forecast: {
    day: string
    temp: number
    icon: string
    condition: string
    advice: string
  }[]
}

interface Alert {
  id: string
  type: "weather" | "season" | "market" | "health"
  priority: "high" | "medium" | "low"
  title: string
  message: string
  actionable: boolean
  timestamp: string
  icon: string
}

interface NearbyUser {
  id: string
  name: string
  distance: number
  specialty: string
  avatar: string
  online: boolean
  rating: number
  verified: boolean
  products?: number
}

interface LocalProduct {
  id: string
  name: string
  price: number
  unit: string
  seller: string
  distance: number
  image: string
  available: boolean
  category: string
  inStock: number
}

interface Activity {
  id: string
  type: "personal" | "community" | "news"
  title: string
  description: string
  timestamp: string
  icon: string
  actionable: boolean
  category: string
}

interface Recommendation {
  id: string
  title: string
  description: string
  icon: string
  color: string
  action: string
  tab: string
}

// Traductions
const translations = {
  fr: {
    welcome: "Bonjour",
    dashboard: "Tableau de bord personnalisé",
    online: "En ligne",
    offline: "Hors ligne",
    myAlerts: "Mes Alertes & Conseils",
    weather: "Météo",
    humidity: "Humidité",
    wind: "Vent",
    pressure: "Pression",
    uvIndex: "UV",
    forecast: "Prévisions",
    dailyTip: "Conseil du jour",
    viewAllAlerts: "Voir toutes les alertes",
    quickAccess: "Accès Rapide",
    nearbyNetwork: "Réseau à Proximité",
    yourPosition: "Votre Position",
    farmers: "agriculteurs",
    products: "produits",
    nearbyFarmers: "Agriculteurs Proches",
    contact: "Contacter",
    availableProducts: "Produits Disponibles",
    available: "Disponible",
    outOfStock: "Épuisé",
    nearbyServices: "Services Disponibles",
    recentActivities: "Activités Récentes",
    viewMore: "Voir plus d'activités",
    communityNews: "Actualités",
    urgent: "Urgent",
    loading: "Chargement...",
    refresh: "Actualiser",
    recommendations: "Recommandations",
    statistics: "Statistiques",
    production: "Production",
    earnings: "Gains",
    rating: "Note",
    followers: "Abonnés",
  },
  en: {
    welcome: "Hello",
    dashboard: "Personalized dashboard",
    online: "Online",
    offline: "Offline",
    myAlerts: "My Alerts & Tips",
    weather: "Weather",
    humidity: "Humidity",
    wind: "Wind",
    pressure: "Pressure",
    uvIndex: "UV",
    forecast: "Forecast",
    dailyTip: "Daily tip",
    viewAllAlerts: "View all alerts",
    quickAccess: "Quick Access",
    nearbyNetwork: "Nearby Network",
    yourPosition: "Your Position",
    farmers: "farmers",
    products: "products",
    nearbyFarmers: "Nearby Farmers",
    contact: "Contact",
    availableProducts: "Available Products",
    available: "Available",
    outOfStock: "Out of stock",
    nearbyServices: "Nearby Services",
    recentActivities: "Recent Activities",
    viewMore: "View more activities",
    communityNews: "Community News",
    urgent: "Urgent",
    loading: "Loading...",
    refresh: "Refresh",
    recommendations: "Recommendations",
    statistics: "Statistics",
    production: "Production",
    earnings: "Earnings",
    rating: "Rating",
    followers: "Followers",
  },
}

// Données météo par région
const regionWeather: Record<string, Partial<WeatherData>> = {
  "Burkina Faso": { temperature: 32, condition: "Ensoleillé", icon: "☀️", humidity: 45, windSpeed: 12, uvIndex: 8 },
  Mali: { temperature: 33, condition: "Ensoleillé", icon: "☀️", humidity: 38, windSpeed: 14, uvIndex: 9 },
  Sénégal: { temperature: 28, condition: "Nuageux", icon: "⛅", humidity: 65, windSpeed: 10, uvIndex: 6 },
  Niger: { temperature: 36, condition: "Ensoleillé", icon: "☀️", humidity: 35, windSpeed: 16, uvIndex: 10 },
}

export default function Dashboard({ currentLanguage, userRegion, onTabChange }: DashboardProps) {
  const { userData } = usePiAuth()
  const isOnline = useOnlineStatus()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentAdviceIndex, setCurrentAdviceIndex] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAllProducts, setShowAllProducts] = useState(false)
  const [dismissedAlerts, setDismissedAlerts] = useLocalStorage<string[]>("dismissedAlerts", [])
  const [favoriteProducts, setFavoriteProducts] = useLocalStorage<string[]>("favoriteProducts", [])
  const [userStats, setUserStats] = useLocalStorage("userStats", {
    followers: 1247,
    following: 89,
    rating: 4.9,
    reviews: 234,
    piEarned: 12.5847,
    servicesOffered: 5,
  })

  const t = translations[currentLanguage as keyof typeof translations] || translations.fr

  // Données météo dynamiques
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 32,
    condition: "Ensoleillé",
    icon: "☀️",
    humidity: 45,
    windSpeed: 12,
    pressure: 1012,
    uvIndex: 8,
    advice: "Temps idéal pour les travaux de récolte. Évitez l'arrosage en plein soleil.",
    forecast: [
      { day: "Aujourd'hui", temp: 32, icon: "☀️", condition: "Ensoleillé", advice: "Parfait pour la récolte du mil" },
      { day: "Demain", temp: 29, icon: "⛅", condition: "Nuageux", advice: "Bon moment pour les semis" },
      { day: "Après-demain", temp: 27, icon: "🌧️", condition: "Pluie", advice: "Évitez les pulvérisations" },
    ],
  })

  const [alerts] = useState<Alert[]>([
    { id: "1", type: "weather", priority: "high", title: "Pluies importantes prévues", message: "Fortes pluies attendues demain après-midi. Protégez vos récoltes.", actionable: true, timestamp: new Date().toISOString(), icon: "🌧️" },
    { id: "2", type: "season", priority: "medium", title: "Période de semis optimale", message: "C'est le moment idéal pour semer le maïs dans votre région.", actionable: true, timestamp: new Date().toISOString(), icon: "🌱" },
    { id: "3", type: "market", priority: "low", title: "Hausse des prix du mil", message: "Le prix du mil a augmenté de 15% sur le marché local.", actionable: false, timestamp: new Date().toISOString(), icon: "📈" },
  ])

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.includes(alert.id))

  const [nearbyUsers] = useState<NearbyUser[]>([
    { id: "1", name: "Koffi Asante", distance: 2.3, specialty: "Maraîchage bio", avatar: "KA", online: true, rating: 4.8, verified: true, products: 5 },
    { id: "2", name: "Aminata Traoré", distance: 5.1, specialty: "Aviculture moderne", avatar: "AT", online: false, rating: 4.9, verified: true, products: 3 },
    { id: "3", name: "Ibrahim Sawadogo", distance: 8.7, specialty: "Céréales", avatar: "IS", online: true, rating: 4.6, verified: false, products: 8 },
  ])

  // ✅ PRIX CORRIGÉS EN Pi (π)
  const [localProducts] = useState<LocalProduct[]>([
    { id: "1", name: "Mangues Kent", price: 0.5, unit: "kg", seller: "Fatou Kaboré", distance: 1.8, image: "🥭", available: true, category: "fruits", inStock: 50 },
    { id: "2", name: "Engrais NPK", price: 25, unit: "sac", seller: "Coopérative YELEN", distance: 3.2, image: "🌾", available: true, category: "intrants", inStock: 25 },
    { id: "3", name: "Poules pondeuses", price: 3.5, unit: "unité", seller: "Moussa Koné", distance: 6.5, image: "🐔", available: false, category: "animaux", inStock: 0 },
    { id: "4", name: "Semences maïs", price: 8, unit: "kg", seller: "INERA", distance: 4.2, image: "🌽", available: true, category: "semences", inStock: 100 },
    { id: "5", name: "Tomates fraîches", price: 0.3, unit: "kg", seller: "Mariam Diallo", distance: 2.1, image: "🍅", available: true, category: "legumes", inStock: 30 },
  ])

  const [activities] = useState<Activity[]>([
    { id: "1", type: "personal", title: "Nouvelle parcelle ajoutée", description: "Parcelle de riz de 2 hectares", timestamp: new Date().toISOString(), icon: "🌾", actionable: true, category: "exploitation" },
    { id: "2", type: "community", title: "Nouveau membre", description: "Awa Ouédraogo a rejoint votre réseau", timestamp: new Date(Date.now() - 3600000).toISOString(), icon: "👥", actionable: false, category: "réseau" },
    { id: "3", type: "news", title: "Formation gratuite", description: "Agriculture biologique le 15 février", timestamp: new Date(Date.now() - 86400000).toISOString(), icon: "🎓", actionable: true, category: "formation" },
    { id: "4", type: "personal", title: "Transaction Pi réussie", description: "+0.008π reçu pour consultation", timestamp: new Date(Date.now() - 172800000).toISOString(), icon: "💰", actionable: false, category: "finance" },
  ])

  const recommendations: Recommendation[] = [
    { id: "1", title: "Vaccination recommandée", description: "Vaccin Newcastle pour vos poules de 4 semaines", icon: "💉", color: "bg-blue-500", action: "Voir calendrier", tab: "aviculture" },
    { id: "2", title: "Période de semis", description: "Conditions idéales pour le maïs cette semaine", icon: "🌽", color: "bg-green-500", action: "Planter", tab: "services" },
    { id: "3", title: "Nouveaux services", description: "3 nouveaux vétérinaires disponibles", icon: "👨‍⚕️", color: "bg-purple-500", action: "Découvrir", tab: "services" },
  ]

  const quickAccessModules = [
    { id: "aviculture", title: "Mon Exploitation", icon: "🏡", color: "bg-green-500", description: "Journal, parcelles", tab: "aviculture" },
    { id: "services", title: "Marché Local", icon: "🏪", color: "bg-blue-500", description: "Acheter, vendre", tab: "services" },
    { id: "messages", title: "Réseau", icon: "👥", color: "bg-purple-500", description: "Messages, communauté", tab: "messages" },
    { id: "regional", title: "Conseils", icon: "📚", color: "bg-orange-500", description: "Guides, formations", tab: "regional" },
    { id: "wallet", title: "Paiement π", icon: "💰", color: "bg-yellow-500", description: "Portefeuille Pi", tab: "wallet" },
    { id: "geolocation", title: "Cartes", icon: "🗺️", color: "bg-indigo-500", description: "Sols, climat", tab: "geolocation" },
  ]

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    const adviceTimer = setInterval(() => {
      setCurrentAdviceIndex(prev => (prev + 1) % weatherData.forecast.length)
    }, 10000)
    const weatherInterval = setInterval(() => {
      if (isOnline) {
        const regionData = regionWeather[userRegion] || regionWeather["Burkina Faso"]
        setWeatherData(prev => ({
          ...prev,
          temperature: regionData.temperature || prev.temperature,
          humidity: regionData.humidity || prev.humidity,
          icon: regionData.icon || prev.icon,
        }))
      }
    }, 300000)
    return () => {
      clearInterval(timer)
      clearInterval(adviceTimer)
      clearInterval(weatherInterval)
    }
  }, [isOnline, userRegion])

  const refreshData = useCallback(async () => {
    if (!isOnline) {
      showToast("Connexion internet requise", "error")
      return
    }
    setIsRefreshing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUserStats(prev => ({
        ...prev,
        piEarned: prev.piEarned + Math.random() * 0.1,
      }))
      showToast("Données actualisées", "success")
    } catch {
      showToast("Erreur lors de l'actualisation", "error")
    } finally {
      setIsRefreshing(false)
    }
  }, [isOnline, setUserStats])

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const currentAdvice = weatherData.forecast[currentAdviceIndex]
  const displayedProducts = showAllProducts ? localProducts : localProducts.slice(0, 3)

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header avec météo et heure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-green-200">{t.welcome},</p>
                <p className="text-xl font-bold">{userData.username} ! 👋</p>
                <p className="text-xs text-green-200 mt-2 flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(currentTime)} • {t.dashboard}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  {isOnline ? <Badge className="bg-green-500/20 text-green-200"><Wifi className="h-3 w-3 mr-1" />{t.online}</Badge> : <Badge className="bg-yellow-500/20 text-yellow-200"><WifiOff className="h-3 w-3 mr-1" />{t.offline}</Badge>}
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 p-2" onClick={refreshData} disabled={isRefreshing}>
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  </Button>
                </div>
                <div className="flex items-center gap-1 mt-2 text-green-200 text-sm"><MapPin className="h-3 w-3" />{userRegion}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <CardContent className="p-5">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-4xl">{weatherData.icon}</span>
                  <div>
                    <p className="text-3xl font-bold">{weatherData.temperature}°C</p>
                    <p className="text-sm text-blue-200">{weatherData.condition}</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-2 text-xs text-blue-200">
                  <span className="flex items-center gap-1"><Droplets className="h-3 w-3" />{weatherData.humidity}%</span>
                  <span className="flex items-center gap-1"><Wind className="h-3 w-3" />{weatherData.windSpeed} km/h</span>
                  <span className="flex items-center gap-1"><Sun className="h-3 w-3" />UV {weatherData.uvIndex}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  {weatherData.forecast.slice(1, 4).map((day, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xl">{day.icon}</div>
                      <div className="text-xs">{day.temp}°</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-blue-200 mt-1">{t.forecast}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques utilisateur */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" /><p className="text-xl font-bold">{userStats.piEarned.toFixed(2)} π</p><p className="text-xs text-gray-500">{t.earnings}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 text-blue-600 mx-auto mb-1" /><p className="text-xl font-bold">{formatNumber(userStats.followers)}</p><p className="text-xs text-gray-500">{t.followers}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Star className="h-5 w-5 text-yellow-500 mx-auto mb-1 fill-current" /><p className="text-xl font-bold">{userStats.rating}</p><p className="text-xs text-gray-500">{t.rating}</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><MessageSquare className="h-5 w-5 text-purple-600 mx-auto mb-1" /><p className="text-xl font-bold">{formatNumber(userStats.reviews)}</p><p className="text-xs text-gray-500">Avis</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Briefcase className="h-5 w-5 text-orange-600 mx-auto mb-1" /><p className="text-xl font-bold">{userStats.servicesOffered}</p><p className="text-xs text-gray-500">Services</p></CardContent></Card>
      </div>

      {/* Alertes & Conseils */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg"><Bell className="h-5 w-5" />{t.myAlerts}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 flex items-center gap-2"><Sprout className="h-4 w-4" />{t.dailyTip}</p>
                <p className="text-sm text-green-700 mt-1">{currentAdvice.advice}</p>
              </div>
              <div className="text-center min-w-[70px]">
                <span className="text-2xl">{currentAdvice.icon}</span>
                <p className="text-xs font-medium">{currentAdvice.temp}°</p>
                <p className="text-xs text-gray-600">{currentAdvice.day}</p>
              </div>
            </div>
          </div>

          {visibleAlerts.slice(0, 2).map(alert => (
            <div key={alert.id} className={`p-3 border-l-4 rounded-r-lg ${alert.priority === "high" ? "bg-red-50 border-l-red-500" : alert.priority === "medium" ? "bg-yellow-50 border-l-yellow-500" : "bg-blue-50 border-l-blue-500"}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2"><span className="text-lg">{alert.icon}</span><p className="font-medium text-sm">{alert.title}</p></div>
                <button onClick={() => setDismissedAlerts([...dismissedAlerts, alert.id])} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
              </div>
              <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
            </div>
          ))}
          {visibleAlerts.length > 2 && <Button variant="outline" size="sm" className="w-full">📋 {t.viewAllAlerts} ({visibleAlerts.length})</Button>}
        </CardContent>
      </Card>

      {/* Accès Rapide */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><Zap className="h-5 w-5" />{t.quickAccess}</CardTitle></CardHeader>
        <CardContent><div className="grid grid-cols-3 md:grid-cols-6 gap-3">{quickAccessModules.map(module => (<button key={module.id} onClick={() => onTabChange(module.tab)} className="p-3 text-center bg-white border rounded-xl hover:shadow-md transition-all"><span className="text-2xl mb-1 block">{module.icon}</span><p className="font-semibold text-xs">{module.title}</p><p className="text-[10px] text-gray-500 hidden md:block">{module.description}</p></button>))}</div></CardContent>
      </Card>

      {/* Recommandations personnalisées */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Target className="h-5 w-5" />{t.recommendations}</CardTitle></CardHeader>
        <CardContent><div className="grid grid-cols-1 md:grid-cols-3 gap-3">{recommendations.map(rec => (<div key={rec.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"><div className="flex items-center gap-3"><div className={`w-10 h-10 ${rec.color} rounded-full flex items-center justify-center text-white text-lg`}>{rec.icon}</div><div><p className="font-medium text-sm">{rec.title}</p><p className="text-xs text-gray-500">{rec.description}</p></div></div><Button size="sm" variant="outline" className="text-xs" onClick={() => onTabChange(rec.tab)}>{rec.action}</Button></div>))}</div></CardContent>
      </Card>

      {/* Réseau à Proximité */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex justify-between items-center text-lg">
            <span className="flex items-center gap-2"><Map className="h-5 w-5" />{t.nearbyNetwork}</span>
            <Button variant="ghost" size="sm" onClick={() => onTabChange("geolocation")}><ChevronRight className="h-4 w-4" /></Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-24 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex flex-col items-center justify-center relative"><MapPin className="h-6 w-6 text-blue-600 mb-1" /><p className="text-sm font-medium">{t.yourPosition}</p><p className="text-xs text-gray-600">{nearbyUsers.length} {t.farmers} • {localProducts.length} {t.products}</p></div>

          <div><h4 className="font-medium text-sm mb-2 flex items-center gap-2"><Users className="h-4 w-4" />{t.nearbyFarmers}</h4>{nearbyUsers.map(user => (<div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-2"><div className="flex items-center gap-3"><div className="relative"><div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">{user.avatar}{user.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />}</div></div><div><p className="font-medium text-sm">{user.name}</p><p className="text-xs text-gray-500">{user.specialty} • {user.distance}km</p><div className="flex items-center gap-0.5"><Star className="h-3 w-3 text-yellow-500 fill-current" /><span className="text-xs">{user.rating}</span><span className="text-xs text-gray-400 ml-1">• {user.products} produits</span></div></div></div><Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => onTabChange("messages")}><MessageSquare className="h-3 w-3" />{t.contact}</Button></div>))}</div>

          {/* ✅ SECTION PRODUITS CORRIGÉE AVEC PRIX EN Pi */}
          <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              {t.availableProducts}
            </h4>
            <div className="space-y-2">
              {displayedProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{product.image}</span>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.seller} • {product.distance}km</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs">4.8</span>
                        <Badge className="ml-1 text-[10px]" variant={product.available ? "default" : "secondary"}>
                          {product.available ? `${product.inStock} en stock` : t.outOfStock}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">{product.price} π / {product.unit}</p>
                    <Button size="sm" className="mt-1 text-xs h-7" disabled={!product.available}>
                      Acheter
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {localProducts.length > 3 && (
              <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => setShowAllProducts(!showAllProducts)}>
                {showAllProducts ? "Voir moins" : `+${localProducts.length - 3} produits`}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activités Récentes */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><Activity className="h-5 w-5" />{t.recentActivities}</CardTitle></CardHeader>
        <CardContent><div className="space-y-3">{activities.map(activity => (<div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"><span className="text-2xl">{activity.icon}</span><div className="flex-1"><p className="font-medium text-sm">{activity.title}</p><p className="text-xs text-gray-600">{activity.description}</p><p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Clock className="h-3 w-3" />{formatRelativeTime(activity.timestamp)}</p></div>{activity.actionable && <ChevronRight className="h-4 w-4 text-gray-400" />}</div>))}</div><Button variant="outline" size="sm" className="w-full mt-4">{t.viewMore}</Button></CardContent>
      </Card>

      {/* Citation inspirante */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="p-4"><div className="flex items-start gap-3"><span className="text-2xl">💡</span><div><p className="font-medium text-amber-800">Citation du jour</p><p className="text-sm text-amber-700 italic">"L'agriculture n'est pas seulement une affaire de culture, c'est aussi une affaire de cœur et de persévérance."</p><p className="text-xs text-amber-600 mt-1">— Proverbe paysan burkinabè</p></div></div></CardContent>
      </Card>
    </div>
  )
}

// Composant Briefcase manquant
const Briefcase = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)