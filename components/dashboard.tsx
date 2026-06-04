"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { showToast, formatRelativeTime, formatNumber } from "@/lib/utils"

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
}

interface LocalService {
  id: string
  name: string
  provider: string
  distance: number
  price: string
  available: boolean
  category: string
}

interface RecentActivity {
  id: string
  type: "personal" | "community" | "news"
  title: string
  description: string
  timestamp: string
  icon: string
  actionable: boolean
  category: string
}

// Traductions
const translations = {
  fr: {
    welcome: "Bonjour",
    dashboard: "Tableau de bord personnalisé",
    online: "En ligne",
    offline: "Hors ligne",
    myAlerts: "Mes Alertes & Conseils du Jour",
    weather: "Météo",
    humidity: "Humidité",
    wind: "Vent",
    forecast: "Prévisions",
    dailyTip: "Conseil du jour",
    viewAllAlerts: "Voir toutes les alertes",
    quickAccess: "Accès Rapide",
    nearbyNetwork: "Réseau à Proximité",
    yourPosition: "Votre Position",
    farmers: "agriculteurs",
    products: "produits",
    nearbyFarmers: "Agriculteurs Proches",
    contact: "Contact",
    availableProducts: "Produits Disponibles",
    available: "Disponible",
    outOfStock: "Épuisé",
    nearbyServices: "Services Disponibles",
    recentActivities: "Activités Récentes & Actualités",
    viewMore: "Voir plus d'activités",
    communityNews: "Actualités Communautaires",
    urgent: "Urgent",
    loading: "Chargement...",
    refresh: "Actualiser",
  },
  en: {
    welcome: "Hello",
    dashboard: "Personalized dashboard",
    online: "Online",
    offline: "Offline",
    myAlerts: "My Alerts & Daily Tips",
    weather: "Weather",
    humidity: "Humidity",
    wind: "Wind",
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
    recentActivities: "Recent Activities & News",
    viewMore: "View more activities",
    communityNews: "Community News",
    urgent: "Urgent",
    loading: "Loading...",
    refresh: "Refresh",
  },
}

export default function Dashboard({ currentLanguage, userRegion, onTabChange }: DashboardProps) {
  const { userData } = usePiAuth()
  const isOnline = useOnlineStatus()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentAdviceIndex, setCurrentAdviceIndex] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dismissedAlerts, setDismissedAlerts] = useLocalStorage<string[]>("dismissedAlerts", [])

  const t = translations[currentLanguage as keyof typeof translations] || translations.fr

  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 32,
    condition: "Ensoleillé",
    icon: "☀️",
    humidity: 45,
    windSpeed: 12,
    advice: "Temps idéal pour les travaux de récolte. Évitez l'arrosage en plein soleil.",
    forecast: [
      { day: "Aujourd'hui", temp: 32, icon: "☀️", condition: "Ensoleillé", advice: "Parfait pour la récolte du mil" },
      { day: "Demain", temp: 29, icon: "⛅", condition: "Nuageux", advice: "Bon moment pour les semis" },
      { day: "Après-demain", temp: 27, icon: "🌧️", condition: "Pluie", advice: "Évitez les pulvérisations" },
    ],
  })

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "1",
      type: "weather",
      priority: "high",
      title: "Pluies importantes prévues",
      message: "Fortes pluies attendues demain après-midi. Protégez vos récoltes.",
      actionable: true,
      timestamp: new Date().toISOString(),
      icon: "🌧️",
    },
    {
      id: "2",
      type: "season",
      priority: "medium",
      title: "Période de semis optimale",
      message: "C'est le moment idéal pour semer le maïs dans votre région.",
      actionable: true,
      timestamp: new Date().toISOString(),
      icon: "🌱",
    },
    {
      id: "3",
      type: "market",
      priority: "low",
      title: "Hausse des prix du mil",
      message: "Le prix du mil a augmenté de 15% sur le marché local.",
      actionable: false,
      timestamp: new Date().toISOString(),
      icon: "📈",
    },
  ])

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.includes(alert.id))

  const [nearbyUsers] = useState<NearbyUser[]>([
    { id: "1", name: "Koffi Asante", distance: 2.3, specialty: "Maraîchage bio", avatar: "KA", online: true, rating: 4.8, verified: true },
    { id: "2", name: "Aminata Traoré", distance: 5.1, specialty: "Aviculture moderne", avatar: "AT", online: false, rating: 4.9, verified: true },
    { id: "3", name: "Ibrahim Sawadogo", distance: 8.7, specialty: "Céréales", avatar: "IS", online: true, rating: 4.6, verified: false },
  ])

  const [localProducts] = useState<LocalProduct[]>([
    { id: "1", name: "Mangues Kent", price: 500, unit: "kg", seller: "Fatou Kaboré", distance: 1.8, image: "🥭", available: true, category: "fruits" },
    { id: "2", name: "Engrais NPK", price: 25000, unit: "sac", seller: "Coopérative YELEN", distance: 3.2, image: "🌾", available: true, category: "intrants" },
    { id: "3", name: "Poules pondeuses", price: 3500, unit: "unité", seller: "Moussa Koné", distance: 6.5, image: "🐔", available: false, category: "animaux" },
    { id: "4", name: "Semences maïs", price: 8000, unit: "kg", seller: "INERA", distance: 4.2, image: "🌽", available: true, category: "semences" },
  ])

  const [localServices] = useState<LocalService[]>([
    { id: "1", name: "Location tracteur", provider: "Coopérative Mécanisation", distance: 10.5, price: "15000 FCFA/jour", available: true, category: "équipement" },
    { id: "2", name: "Transport produits", provider: "Transport Sahel", distance: 7.8, price: "100 FCFA/kg", available: true, category: "logistique" },
    { id: "3", name: "Consultation vétérinaire", provider: "Dr. Aminata Traoré", distance: 5.1, price: "0.008 π", available: false, category: "conseil" },
  ])

  const [recentActivities] = useState<RecentActivity[]>([
    { id: "1", type: "personal", title: "Nouvelle parcelle ajoutée", description: "Parcelle de riz de 2 hectares", timestamp: new Date().toISOString(), icon: "🌾", actionable: true, category: "exploitation" },
    { id: "2", type: "community", title: "Nouveau membre", description: "Awa Ouédraogo a rejoint votre réseau", timestamp: new Date(Date.now() - 3600000).toISOString(), icon: "👥", actionable: false, category: "réseau" },
    { id: "3", type: "news", title: "Formation gratuite", description: "Agriculture biologique le 15 février", timestamp: new Date(Date.now() - 86400000).toISOString(), icon: "🎓", actionable: true, category: "formation" },
  ])

  const quickAccessModules = [
    { id: "exploitation", title: "Mon Exploitation", icon: "🏡", color: "bg-green-500", description: "Journal, parcelles", tab: "aviculture" },
    { id: "market", title: "Marché Local", icon: "🏪", color: "bg-blue-500", description: "Acheter, vendre", tab: "services" },
    { id: "network", title: "Réseau", icon: "👥", color: "bg-purple-500", description: "Messages, communauté", tab: "messages" },
    { id: "knowledge", title: "Conseils", icon: "📚", color: "bg-orange-500", description: "Guides, formations", tab: "regional" },
    { id: "wallet", title: "Paiement π", icon: "💰", color: "bg-yellow-500", description: "Portefeuille Pi", tab: "wallet" },
    { id: "analytics", title: "Cartes", icon: "🗺️", color: "bg-indigo-500", description: "Sols, climat", tab: "geolocation" },
  ]

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    const adviceTimer = setInterval(() => {
      setCurrentAdviceIndex(prev => (prev + 1) % weatherData.forecast.length)
    }, 10000)
    return () => {
      clearInterval(timer)
      clearInterval(adviceTimer)
    }
  }, [weatherData.forecast.length])

  const refreshData = useCallback(async () => {
    if (!isOnline) {
      showToast("Connexion internet requise", "error")
      return
    }
    setIsRefreshing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setWeatherData(prev => ({
        ...prev,
        temperature: prev.temperature + Math.floor(Math.random() * 3) - 1,
      }))
      showToast("Données actualisées", "success")
    } catch {
      showToast("Erreur lors de l'actualisation", "error")
    } finally {
      setIsRefreshing(false)
    }
  }, [isOnline])

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts([...dismissedAlerts, alertId])
    showToast("Alerte ignorée", "info")
  }

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const currentAdvice = weatherData.forecast[currentAdviceIndex]

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-600 to-blue-700 text-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4" />
              <span className="font-medium text-sm">{userRegion}</span>
            </div>
            <div className="flex items-center gap-3">
              {isOnline ? (
                <Badge className="bg-green-500/20 text-green-200 border-green-500/30 gap-1">
                  <Wifi className="h-3 w-3" /> {t.online}
                </Badge>
              ) : (
                <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-500/30 gap-1">
                  <WifiOff className="h-3 w-3" /> {t.offline}
                </Badge>
              )}
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 p-2" onClick={refreshData} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 p-2" onClick={() => onTabChange("profile")}>
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{t.welcome} {userData.username} ! 👋</p>
            <p className="text-sm text-green-100">{formatTime(currentTime)} • {t.dashboard}</p>
          </div>
        </CardContent>
      </Card>

      {/* Alertes & Météo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            {t.myAlerts}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{weatherData.icon}</span>
                <div>
                  <p className="text-2xl font-bold">{weatherData.temperature}°C</p>
                  <p className="text-sm text-gray-600">{weatherData.condition}</p>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Droplets className="h-3 w-3" />{weatherData.humidity}%</span>
                    <span className="flex items-center gap-1"><Wind className="h-3 w-3" />{weatherData.windSpeed} km/h</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-blue-800">{t.forecast}</p>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="p-1" onClick={() => setCurrentAdviceIndex(prev => (prev - 1 + weatherData.forecast.length) % weatherData.forecast.length)}>
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <div className="text-center min-w-[70px]">
                    <span className="text-2xl">{currentAdvice.icon}</span>
                    <p className="text-xs font-medium">{currentAdvice.temp}°</p>
                    <p className="text-xs text-gray-600">{currentAdvice.day}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="p-1" onClick={() => setCurrentAdviceIndex(prev => (prev + 1) % weatherData.forecast.length)}>
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-3 p-2 bg-green-100 rounded-lg">
              <p className="text-sm font-medium text-green-800 flex items-center gap-2"><Sprout className="h-4 w-4" />{t.dailyTip}</p>
              <p className="text-sm text-green-700 mt-1">{currentAdvice.advice}</p>
            </div>
          </div>

          {visibleAlerts.slice(0, 2).map(alert => (
            <div key={alert.id} className={`p-3 border-l-4 rounded-r-lg ${alert.priority === "high" ? "bg-red-50 border-l-red-500" : alert.priority === "medium" ? "bg-yellow-50 border-l-yellow-500" : "bg-blue-50 border-l-blue-500"}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{alert.icon}</span>
                  <p className="font-medium text-sm">{alert.title}</p>
                </div>
                <button onClick={() => dismissAlert(alert.id)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
              </div>
              <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
            </div>
          ))}
          {visibleAlerts.length > 2 && <Button variant="outline" size="sm" className="w-full">📋 {t.viewAllAlerts} ({visibleAlerts.length})</Button>}
        </CardContent>
      </Card>

      {/* Accès Rapide */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><Activity className="h-5 w-5" />{t.quickAccess}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickAccessModules.map(module => (
              <button key={module.id} onClick={() => onTabChange(module.tab)} className="p-4 text-center bg-white border rounded-xl hover:shadow-md transition-all">
                <span className="text-3xl mb-2 block">{module.icon}</span>
                <p className="font-semibold text-sm">{module.title}</p>
                <p className="text-xs text-gray-500">{module.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
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
          <div className="h-28 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex flex-col items-center justify-center relative">
            <MapPin className="h-6 w-6 text-blue-600 mb-1" />
            <p className="text-sm font-medium">{t.yourPosition}</p>
            <p className="text-xs text-gray-600">{nearbyUsers.length} {t.farmers} • {localProducts.length} {t.products}</p>
          </div>

          <div><h4 className="font-medium text-sm mb-2 flex items-center gap-2"><Users className="h-4 w-4" />{t.nearbyFarmers}</h4>
            {nearbyUsers.map(user => (
              <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold relative">
                    {user.avatar}
                    {user.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />}
                  </div>
                  <div><p className="font-medium text-sm">{user.name}</p><p className="text-xs text-gray-500">{user.specialty} • {user.distance}km</p><div className="flex items-center gap-0.5"><Star className="h-3 w-3 text-yellow-500 fill-current" /><span className="text-xs">{user.rating}</span></div></div>
                </div>
                <Button size="sm" variant="outline" className="text-xs gap-1"><MessageSquare className="h-3 w-3" />{t.contact}</Button>
              </div>
            ))}
          </div>

          <div><h4 className="font-medium text-sm mb-2 flex items-center gap-2"><ShoppingCart className="h-4 w-4" />{t.availableProducts}</h4>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {localProducts.map(product => (
                <div key={product.id} className="flex-shrink-0 w-40 p-3 border rounded-lg bg-white">
                  <span className="text-2xl block mb-1">{product.image}</span>
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.seller}</p>
                  <p className="text-sm font-bold text-purple-600">{formatNumber(product.price)} FCFA/{product.unit}</p>
                  <Badge className={`text-xs mt-1 ${product.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{product.available ? t.available : t.outOfStock}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div><h4 className="font-medium text-sm mb-2 flex items-center gap-2"><Tractor className="h-4 w-4" />{t.nearbyServices}</h4>
            {localServices.map(service => (
              <div key={service.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg mb-2">
                <div><p className="font-medium text-sm">{service.name}</p><p className="text-xs text-gray-600">{service.provider} • {service.distance}km</p><p className="text-xs font-medium text-purple-600">{service.price}</p></div>
                <Badge className={service.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>{service.available ? t.available : "Occupé"}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activités Récentes */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-lg"><Activity className="h-5 w-5" />{t.recentActivities}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">{activity.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-xs text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Clock className="h-3 w-3" />{formatRelativeTime(activity.timestamp)}</p>
                </div>
                {activity.actionable && <ChevronRight className="h-4 w-4 text-gray-400" />}
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4">{t.viewMore}</Button>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl text-center shadow-sm"><TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" /><p className="text-xl font-bold">{userData.credits_balance} π</p><p className="text-xs text-gray-500">Solde Pi</p></div>
        <div className="bg-white p-3 rounded-xl text-center shadow-sm"><Users className="h-5 w-5 text-blue-600 mx-auto mb-1" /><p className="text-xl font-bold">1.2k</p><p className="text-xs text-gray-500">Abonnés</p></div>
        <div className="bg-white p-3 rounded-xl text-center shadow-sm"><Star className="h-5 w-5 text-yellow-500 mx-auto mb-1 fill-yellow-500" /><p className="text-xl font-bold">4.9</p><p className="text-xs text-gray-500">Note</p></div>
        <div className="bg-white p-3 rounded-xl text-center shadow-sm"><CheckCircle className="h-5 w-5 text-purple-600 mx-auto mb-1" /><p className="text-xl font-bold">5</p><p className="text-xs text-gray-500">Services</p></div>
      </div>
    </div>
  )
}