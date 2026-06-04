"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
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
  Menu,
  X,
  ChevronDown,
} from "lucide-react"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { showToast, formatRelativeTime, formatNumber, formatDate } from "@/lib/utils"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, Autoplay, Navigation } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"

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

// Traductions
const translations = {
  fr: {
    welcome: "Bonjour",
    dashboard: "Tableau de bord",
    online: "En ligne",
    offline: "Hors ligne",
    myAlerts: "Alertes & Conseils",
    weather: "Météo",
    humidity: "Humidité",
    wind: "Vent",
    pressure: "Pression",
    uvIndex: "UV",
    forecast: "Prévisions",
    dailyTip: "Conseil du jour",
    viewAllAlerts: "Voir toutes les alertes",
    quickAccess: "Accès Rapide",
    nearbyNetwork: "À proximité",
    yourPosition: "Votre position",
    farmers: "agriculteurs",
    products: "produits",
    nearbyFarmers: "Agriculteurs proches",
    contact: "Contacter",
    availableProducts: "Produits disponibles",
    available: "Dispo",
    outOfStock: "Épuisé",
    recentActivities: "Activités récentes",
    viewMore: "Voir plus",
    recommendations: "Suggestions",
    statistics: "Statistiques",
    production: "Production",
    earnings: "Gains",
    rating: "Note",
    followers: "Abonnés",
    back: "Retour",
  },
  en: {
    welcome: "Hello",
    dashboard: "Dashboard",
    online: "Online",
    offline: "Offline",
    myAlerts: "Alerts & Tips",
    weather: "Weather",
    humidity: "Humidity",
    wind: "Wind",
    pressure: "Pressure",
    uvIndex: "UV",
    forecast: "Forecast",
    dailyTip: "Daily tip",
    viewAllAlerts: "View all alerts",
    quickAccess: "Quick Access",
    nearbyNetwork: "Nearby",
    yourPosition: "Your position",
    farmers: "farmers",
    products: "products",
    nearbyFarmers: "Nearby farmers",
    contact: "Contact",
    availableProducts: "Available products",
    available: "Avail",
    outOfStock: "Out of stock",
    recentActivities: "Recent activities",
    viewMore: "View more",
    recommendations: "Suggestions",
    statistics: "Stats",
    production: "Production",
    earnings: "Earnings",
    rating: "Rating",
    followers: "Followers",
    back: "Back",
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
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const [userStats, setUserStats] = useLocalStorage("userStats", {
    followers: 1247,
    following: 89,
    rating: 4.9,
    reviews: 234,
    piEarned: 12.5847,
    servicesOffered: 5,
  })

  const t = translations[currentLanguage as keyof typeof translations] || translations.fr

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Données météo dynamiques
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 32,
    condition: "Ensoleillé",
    icon: "☀️",
    humidity: 45,
    windSpeed: 12,
    pressure: 1012,
    uvIndex: 8,
    advice: "Temps idéal pour les travaux de récolte",
    forecast: [
      { day: "Auj", temp: 32, icon: "☀️", condition: "Ensoleillé", advice: "Parfait pour la récolte" },
      { day: "Demain", temp: 29, icon: "⛅", condition: "Nuageux", advice: "Bon moment pour les semis" },
      { day: "J+2", temp: 27, icon: "🌧️", condition: "Pluie", advice: "Évitez les pulvérisations" },
      { day: "J+3", temp: 30, icon: "☀️", condition: "Ensoleillé", advice: "Idéal pour les récoltes" },
      { day: "J+4", temp: 28, icon: "⛅", condition: "Nuageux", advice: "Travaux au sol possibles" },
    ],
  })

  const [alerts] = useState<Alert[]>([
    { id: "1", type: "weather", priority: "high", title: "Pluies importantes", message: "Fortes pluies demain après-midi", actionable: true, timestamp: new Date().toISOString(), icon: "🌧️" },
    { id: "2", type: "season", priority: "medium", title: "Semis optimale", message: "Moment idéal pour semer le maïs", actionable: true, timestamp: new Date().toISOString(), icon: "🌱" },
    { id: "3", type: "market", priority: "low", title: "Hausse des prix", message: "Prix du mil +15%", actionable: false, timestamp: new Date().toISOString(), icon: "📈" },
  ])

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.includes(alert.id))

  const nearbyUsers: NearbyUser[] = [
    { id: "1", name: "Koffi Asante", distance: 2.3, specialty: "Maraîchage bio", avatar: "KA", online: true, rating: 4.8, verified: true, products: 5 },
    { id: "2", name: "Aminata Traoré", distance: 5.1, specialty: "Aviculture", avatar: "AT", online: false, rating: 4.9, verified: true, products: 3 },
    { id: "3", name: "Ibrahim S.", distance: 8.7, specialty: "Céréales", avatar: "IS", online: true, rating: 4.6, verified: false, products: 8 },
  ]

  const localProducts: LocalProduct[] = [
    { id: "1", name: "Mangues Kent", price: 500, unit: "kg", seller: "Fatou K.", distance: 1.8, image: "🥭", available: true, category: "fruits", inStock: 50 },
    { id: "2", name: "Engrais NPK", price: 25000, unit: "sac", seller: "Coop YELEN", distance: 3.2, image: "🌾", available: true, category: "intrants", inStock: 25 },
    { id: "3", name: "Poules pondeuses", price: 3500, unit: "unité", seller: "Moussa K.", distance: 6.5, image: "🐔", available: false, category: "animaux", inStock: 0 },
    { id: "4", name: "Semences maïs", price: 8000, unit: "kg", seller: "INERA", distance: 4.2, image: "🌽", available: true, category: "semences", inStock: 100 },
  ]

  const activities: Activity[] = [
    { id: "1", type: "personal", title: "Nouvelle parcelle", description: "Parcelle de riz ajoutée", timestamp: new Date().toISOString(), icon: "🌾", actionable: true, category: "exploitation" },
    { id: "2", type: "community", title: "Nouveau membre", description: "Awa a rejoint le réseau", timestamp: new Date(Date.now() - 3600000).toISOString(), icon: "👥", actionable: false, category: "réseau" },
    { id: "3", type: "news", title: "Formation gratuite", description: "Agriculture bio le 15/02", timestamp: new Date(Date.now() - 86400000).toISOString(), icon: "🎓", actionable: true, category: "formation" },
  ]

  const quickAccessModules = [
    { id: "aviculture", title: "Ferme", icon: "🏡", color: "bg-green-500", tab: "aviculture" },
    { id: "services", title: "Marché", icon: "🏪", color: "bg-blue-500", tab: "services" },
    { id: "messages", title: "Réseau", icon: "👥", color: "bg-purple-500", tab: "messages" },
    { id: "regional", title: "Conseils", icon: "📚", color: "bg-orange-500", tab: "regional" },
    { id: "wallet", title: "Portefeuille", icon: "💰", color: "bg-yellow-500", tab: "wallet" },
    { id: "geolocation", title: "Cartes", icon: "🗺️", color: "bg-indigo-500", tab: "geolocation" },
  ]

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    const adviceTimer = setInterval(() => {
      setCurrentAdviceIndex(prev => (prev + 1) % weatherData.forecast.length)
    }, 10000)
    const weatherInterval = setInterval(() => {
      if (isOnline) {
        const regionData = regionWeather[userRegion] || regionWeather["Burkina Faso"]
        setWeatherData(prev => ({ ...prev, temperature: regionData.temperature || prev.temperature, humidity: regionData.humidity || prev.humidity, icon: regionData.icon || prev.icon }))
      }
    }, 300000)
    return () => {
      clearInterval(timer)
      clearInterval(adviceTimer)
      clearInterval(weatherInterval)
    }
  }, [isOnline, userRegion])

  const refreshData = useCallback(async () => {
    if (!isOnline) { showToast("Connexion requise", "error"); return }
    setIsRefreshing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      setUserStats(prev => ({ ...prev, piEarned: prev.piEarned + Math.random() * 0.1 }))
      showToast("Données actualisées", "success")
    } catch { showToast("Erreur", "error") }
    finally { setIsRefreshing(false) }
  }, [isOnline, setUserStats])

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const currentAdvice = weatherData.forecast[currentAdviceIndex]
  const displayedProducts = showAllProducts ? localProducts : localProducts.slice(0, isMobile ? 2 : 3)

  if (!userData) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>

  return (
    <div className="space-y-4 pb-20">
      {/* Header mobile */}
      <div className="flex justify-between items-center sticky top-0 bg-white z-10 p-3 border-b md:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center"><span className="text-white text-sm">🌾</span></div>
          <h1 className="font-bold text-green-800 text-sm">AGRO MC</h1>
        </div>
        <div className="flex items-center gap-2">
          {!isOnline && <WifiOff className="h-4 w-4 text-yellow-500" />}
          <Button variant="ghost" size="sm" className="p-1" onClick={() => setShowMobileMenu(!showMobileMenu)}>{showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</Button>
        </div>
      </div>

      {/* Menu mobile */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-20" onClick={() => setShowMobileMenu(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 animate-slide-up">
            <div className="flex justify-between items-center mb-4"><h3 className="font-semibold">Navigation</h3><button onClick={() => setShowMobileMenu(false)}><X className="h-5 w-5" /></button></div>
            <div className="grid grid-cols-2 gap-2">
              {quickAccessModules.map(module => (<button key={module.id} onClick={() => { onTabChange(module.tab); setShowMobileMenu(false); }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50"><span className="text-2xl">{module.icon}</span><span className="text-sm">{module.title}</span></button>))}
            </div>
          </div>
        </div>
      )}

      {/* Carte utilisateur et météo */}
      <div className="grid grid-cols-1 gap-3">
        <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div><p className="text-xs text-green-200">{t.welcome},</p><p className="text-base font-bold">{userData.username.split(" ")[0]}! 👋</p><p className="text-[10px] text-green-200 mt-1 flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{formatTime(currentTime)}</p></div>
              <div className="text-right"><div className="flex items-center gap-1">{isOnline ? <Wifi className="h-3 w-3 text-green-300" /> : <WifiOff className="h-3 w-3 text-red-300" />}<span className="text-[10px]">{isOnline ? t.online : t.offline}</span></div><div className="flex items-center gap-0.5 mt-1"><MapPin className="h-2.5 w-2.5" /><span className="text-[10px]">{userRegion}</span></div></div>
            </div>
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-green-500/30">
              <div className="flex items-center gap-2"><span className="text-2xl">{weatherData.icon}</span><div><p className="text-lg font-bold">{weatherData.temperature}°C</p><p className="text-[10px] text-green-200">{weatherData.condition}</p></div></div>
              <div className="flex gap-2"><div className="text-center"><Droplets className="h-3 w-3 mx-auto" /><span className="text-[10px]">{weatherData.humidity}%</span></div><div className="text-center"><Wind className="h-3 w-3 mx-auto" /><span className="text-[10px]">{weatherData.windSpeed}</span></div></div>
              <Button variant="ghost" size="sm" className="h-7 text-white hover:bg-white/20" onClick={refreshData} disabled={isRefreshing}><RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} /></Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats utilisateur mobiles */}
        <div className="grid grid-cols-4 gap-2">
          <Card><CardContent className="p-2 text-center"><TrendingUp className="h-4 w-4 text-green-600 mx-auto" /><p className="text-sm font-bold">{userStats.piEarned.toFixed(1)}π</p><p className="text-[9px] text-gray-500">Gains</p></CardContent></Card>
          <Card><CardContent className="p-2 text-center"><Users className="h-4 w-4 text-blue-600 mx-auto" /><p className="text-sm font-bold">{formatNumber(userStats.followers)}</p><p className="text-[9px] text-gray-500">Abonnés</p></CardContent></Card>
          <Card><CardContent className="p-2 text-center"><Star className="h-4 w-4 text-yellow-500 mx-auto fill-current" /><p className="text-sm font-bold">{userStats.rating}</p><p className="text-[9px] text-gray-500">Note</p></CardContent></Card>
          <Card><CardContent className="p-2 text-center"><MessageSquare className="h-4 w-4 text-purple-600 mx-auto" /><p className="text-sm font-bold">{userStats.servicesOffered}</p><p className="text-[9px] text-gray-500">Services</p></CardContent></Card>
        </div>
      </div>

      {/* Alertes - version compacte mobile */}
      <Card>
        <CardHeader className="pb-1"><CardTitle className="flex items-center gap-1 text-sm"><Bell className="h-4 w-4" />{t.myAlerts}</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="bg-green-50 rounded-lg p-2"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Sprout className="h-3 w-3 text-green-600" /><span className="text-xs font-medium text-green-800">💡 {t.dailyTip}</span></div><div className="flex items-center gap-1"><span className="text-sm">{currentAdvice.icon}</span><span className="text-[10px] font-medium">{currentAdvice.temp}°</span></div></div><p className="text-[11px] text-green-700 mt-1">{currentAdvice.advice}</p></div>
          {visibleAlerts.slice(0, 2).map(alert => (<div key={alert.id} className={`p-2 border-l-4 rounded-r-lg ${alert.priority === "high" ? "bg-red-50 border-l-red-500" : "bg-yellow-50 border-l-yellow-500"}`}><div className="flex justify-between items-start"><div className="flex items-center gap-1"><span className="text-sm">{alert.icon}</span><span className="text-xs font-medium">{alert.title}</span></div><button onClick={() => setDismissedAlerts([...dismissedAlerts, alert.id])} className="text-gray-400 text-[10px]">✕</button></div><p className="text-[10px] text-gray-600">{alert.message}</p></div>))}
        </CardContent>
      </Card>

      {/* Accès rapide - grille responsive */}
      <div className="grid grid-cols-3 gap-2">
        {quickAccessModules.map(module => (<button key={module.id} onClick={() => onTabChange(module.tab)} className="bg-white p-3 rounded-xl text-center shadow-sm border hover:shadow-md transition-all"><span className="text-2xl block mb-1">{module.icon}</span><span className="text-[10px] font-medium">{module.title}</span></button>))}
      </div>

      {/* Réseau à proximité */}
      <Card><CardHeader className="pb-1 flex-row justify-between items-center"><CardTitle className="text-sm flex items-center gap-1"><Map className="h-4 w-4" />{t.nearbyNetwork}</CardTitle><Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => onTabChange("geolocation")}>Voir →</Button></CardHeader>
      <CardContent className="space-y-2">
        <div className="h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center gap-2"><MapPin className="h-4 w-4 text-blue-600" /><span className="text-xs font-medium">{t.yourPosition}</span><span className="text-[10px] text-gray-600">{nearbyUsers.length} {t.farmers}</span></div>
        <div className="space-y-2">{nearbyUsers.slice(0, isMobile ? 2 : 3).map(user => (<div key={user.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"><div className="flex items-center gap-2"><div className="relative"><div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xs">{user.avatar}{user.online && <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />}</div></div><div><p className="text-xs font-medium">{user.name}</p><p className="text-[10px] text-gray-500">{user.specialty} • {user.distance}km</p><div className="flex items-center gap-0.5"><Star className="h-2.5 w-2.5 text-yellow-500 fill-current" /><span className="text-[10px]">{user.rating}</span></div></div></div><Button size="sm" variant="outline" className="h-7 text-[10px] px-2" onClick={() => onTabChange("messages")}>{t.contact}</Button></div>))}</div>
      </CardContent></Card>

      {/* Produits disponibles - version swipe mobile */}
      <Card><CardHeader className="pb-1 flex-row justify-between items-center"><CardTitle className="text-sm flex items-center gap-1"><ShoppingCart className="h-4 w-4" />{t.availableProducts}</CardTitle><Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setShowAllProducts(!showAllProducts)}>{showAllProducts ? "Voir -" : `+${localProducts.length}`}</Button></CardHeader>
      <CardContent>{isMobile ? (<div className="flex overflow-x-auto gap-2 pb-2 snap-x">{displayedProducts.map(product => (<div key={product.id} className="min-w-[140px] p-2 bg-gray-50 rounded-lg snap-start"><div className="flex items-center gap-2"><span className="text-xl">{product.image}</span><div><p className="text-xs font-medium">{product.name}</p><p className="text-[10px] text-gray-500">{product.seller}</p></div></div><div className="flex justify-between items-center mt-2"><p className="text-xs font-bold text-purple-600">{formatNumber(product.price)} FCFA</p><Badge className="text-[9px]" variant={product.available ? "default" : "secondary"}>{product.available ? t.available : t.outOfStock}</Badge></div></div>))}</div>) : (<div className="space-y-2">{displayedProducts.map(product => (<div key={product.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"><div className="flex items-center gap-2"><span className="text-xl">{product.image}</span><div><p className="text-xs font-medium">{product.name}</p><p className="text-[10px] text-gray-500">{product.seller}</p></div></div><div className="text-right"><p className="text-xs font-bold text-purple-600">{formatNumber(product.price)} FCFA</p><Badge className="text-[9px]" variant={product.available ? "default" : "secondary"}>{product.available ? t.available : t.outOfStock}</Badge></div></div>))}</div>)}</CardContent></Card>

      {/* Activités récentes */}
      <Card><CardHeader className="pb-1"><CardTitle className="text-sm flex items-center gap-1"><Activity className="h-4 w-4" />{t.recentActivities}</CardTitle></CardHeader>
      <CardContent><div className="space-y-2">{activities.slice(0, isMobile ? 2 : 3).map(activity => (<div key={activity.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg"><span className="text-lg">{activity.icon}</span><div className="flex-1"><p className="text-xs font-medium">{activity.title}</p><p className="text-[10px] text-gray-600">{activity.description}</p><p className="text-[9px] text-gray-400 mt-1">{formatRelativeTime(activity.timestamp)}</p></div>{activity.actionable && <ChevronRight className="h-3 w-3 text-gray-400" />}</div>))}</div><Button variant="outline" size="sm" className="w-full mt-2 h-7 text-xs">{t.viewMore}</Button></CardContent></Card>

      {/* Citation inspirante */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50"><CardContent className="p-3"><div className="flex items-start gap-2"><span className="text-lg">💡</span><div><p className="text-xs font-medium text-amber-800">Citation</p><p className="text-[10px] text-amber-700 italic">"L'agriculture, c'est une affaire de cœur et de persévérance."</p></div></div></CardContent></Card>

      {/* Installation des dépendances Swiper */}
      <style jsx global>{`
        .swiper-pagination-bullet-active { background-color: #22c55e !important; }
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  )
}