"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Navigation,
  Globe,
  Shield,
  AlertCircle,
  CheckCircle,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  Thermometer,
  Cloud,
  Users,
  Store,
  Droplets,
  Wind,
  Sun,
  Moon,
  Compass,
  Home,
  TrendingUp,
  ShoppingCart,
  Bell,
  Lock,
  Database,
  Trash2,
  Download,
  Pi,
  Wifi,
  WifiOff,
  Loader2,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Sprout,
  Tractor,
  Leaf,
  Star,
  Clock,
  Calendar,
} from "lucide-react"
import { useGeolocation } from "@/hooks/use-geolocation"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { showToast, formatRelativeTime } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

interface GeolocationManagerProps {
  currentLanguage: string
  userRegion: string
}

interface LocationData {
  latitude: number
  longitude: number
  country: string
  region: string
  city: string
  accuracy: number
  timestamp: number
  address?: string
}

interface NearbyPlace {
  id: string
  name: string
  type: "farmer" | "veterinary" | "market" | "service"
  distance: number
  rating: number
  address: string
  phone?: string
  image?: string
}

interface WeatherData {
  temperature: number
  condition: string
  icon: string
  humidity: number
  windSpeed: number
  pressure: number
  forecast: {
    day: string
    temp: number
    icon: string
  }[]
}

// Traductions
const translations: Record<string, any> = {
  fr: {
    title: "Géolocalisation",
    subtitle: "Services et informations basés sur votre position",
    online: "En ligne",
    offline: "Hors ligne",
    enabled: "Activée",
    disabled: "Désactivée",
    refresh: "Actualiser",
    position: "Position",
    localContent: "Contenu local",
    privacy: "Confidentialité",
    settings: "Paramètres",
    locating: "Recherche de votre position...",
    currentPosition: "Position actuelle",
    coordinates: "Coordonnées",
    accuracy: "Précision",
    country: "Pays",
    region: "Région",
    city: "Ville",
    lastUpdate: "Dernière mise à jour",
    shareLocation: "Partager ma position",
    locationShared: "Position partagée",
    locationNotShared: "Position non partagée",
    weather: "Météo",
    temperature: "Température",
    humidity: "Humidité",
    wind: "Vent",
    pressure: "Pression",
    forecast: "Prévisions",
    nearbyFarmers: "Agriculteurs proches",
    nearbyServices: "Services à proximité",
    distance: "distance",
    contact: "Contacter",
    noResults: "Aucun résultat à proximité",
    loading: "Chargement...",
    permissionRequired: "Permission requise",
    enableService: "Activer la géolocalisation",
    privacyInfo: "Vos données de localisation sont sécurisées et utilisées uniquement pour personnaliser votre expérience.",
  },
  en: {
    title: "Geolocation",
    subtitle: "Services and information based on your location",
    online: "Online",
    offline: "Offline",
    enabled: "Enabled",
    disabled: "Disabled",
    refresh: "Refresh",
    position: "Position",
    localContent: "Local content",
    privacy: "Privacy",
    settings: "Settings",
    locating: "Locating your position...",
    currentPosition: "Current position",
    coordinates: "Coordinates",
    accuracy: "Accuracy",
    country: "Country",
    region: "Region",
    city: "City",
    lastUpdate: "Last update",
    shareLocation: "Share my location",
    locationShared: "Location shared",
    locationNotShared: "Location not shared",
    weather: "Weather",
    temperature: "Temperature",
    humidity: "Humidity",
    wind: "Wind",
    pressure: "Pressure",
    forecast: "Forecast",
    nearbyFarmers: "Nearby farmers",
    nearbyServices: "Nearby services",
    distance: "away",
    contact: "Contact",
    noResults: "No results nearby",
    loading: "Loading...",
    permissionRequired: "Permission required",
    enableService: "Enable geolocation",
    privacyInfo: "Your location data is secure and only used to personalize your experience.",
  },
}

// Données de démonstration
const demoWeather: WeatherData = {
  temperature: 32,
  condition: "Ensoleillé",
  icon: "☀️",
  humidity: 45,
  windSpeed: 12,
  pressure: 1012,
  forecast: [
    { day: "Aujourd'hui", temp: 32, icon: "☀️" },
    { day: "Demain", temp: 29, icon: "⛅" },
    { day: "Après-demain", temp: 27, icon: "🌧️" },
    { day: "J+3", temp: 30, icon: "☀️" },
    { day: "J+4", temp: 28, icon: "⛅" },
  ],
}

const demoNearbyPlaces: NearbyPlace[] = [
  { id: "1", name: "Koffi Asante", type: "farmer", distance: 2.3, rating: 4.8, address: "Ouagadougou", phone: "+226 70 12 34 56" },
  { id: "2", name: "Dr. Aminata Traoré", type: "veterinary", distance: 5.1, rating: 4.9, address: "Bobo-Dioulasso", phone: "+226 70 23 45 67" },
  { id: "3", name: "Marché Central", type: "market", distance: 1.8, rating: 4.2, address: "Ouagadougou", phone: "+226 70 34 56 78" },
  { id: "4", name: "Coopérative YELEN", type: "service", distance: 3.2, rating: 4.7, address: "Ouagadougou", phone: "+226 70 45 67 89" },
]

export default function GeolocationManager({ currentLanguage, userRegion }: GeolocationManagerProps) {
  const [activeTab, setActiveTab] = useState("location")
  const [showCoordinates, setShowCoordinates] = useState(false)
  const [language, setLanguage] = useState(currentLanguage)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [weatherData, setWeatherData] = useState<WeatherData>(demoWeather)
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>(demoNearbyPlaces)

  const isOnline = useOnlineStatus()
  const { isAuthenticated } = usePiAuth()
  const { latitude, longitude, accuracy, error: geoError, loading: geoLoading, refresh: refreshGeolocation } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000,
  })
  const [locationEnabled, setLocationEnabled] = useLocalStorage("geolocationEnabled", true)
  const [savedLocation, setSavedLocation] = useLocalStorage<LocationData | null>("userLocation", null)

  const t = translations[language as keyof typeof translations] || translations.fr

  // Rafraîchir les données
  const refreshAllData = useCallback(async () => {
    if (!isOnline) {
      showToast("Connexion internet requise", "error")
      return
    }
    setIsRefreshing(true)
    try {
      await refreshGeolocation()
      await new Promise(resolve => setTimeout(resolve, 500))
      setWeatherData(prev => ({
        ...prev,
        temperature: prev.temperature + (Math.random() * 2 - 1),
      }))
      showToast("Données actualisées", "success")
    } catch {
      showToast("Erreur lors de l'actualisation", "error")
    } finally {
      setIsRefreshing(false)
    }
  }, [isOnline, refreshGeolocation])

  // Construction des données de localisation
  const locationData: LocationData | null = latitude && longitude ? {
    latitude,
    longitude,
    country: userRegion,
    region: userRegion,
    city: "Ouagadougou",
    accuracy: accuracy || 0,
    timestamp: Date.now(),
    address: `${userRegion}, Ouagadougou`,
  } : savedLocation

  useEffect(() => {
    setLanguage(currentLanguage)
  }, [currentLanguage])

  const formatCoordinates = (lat: number, lng: number) => `${lat.toFixed(6)}°, ${lng.toFixed(6)}°`

  const getAccuracyStatus = (accuracy: number) => {
    if (accuracy <= 10) return { status: "Excellent", color: "text-green-600", bg: "bg-green-100" }
    if (accuracy <= 50) return { status: "Bon", color: "text-blue-600", bg: "bg-blue-100" }
    if (accuracy <= 100) return { status: "Moyen", color: "text-yellow-600", bg: "bg-yellow-100" }
    return { status: "Faible", color: "text-red-600", bg: "bg-red-100" }
  }

  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleString()

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "farmer": return "👨‍🌾"
      case "veterinary": return "👩‍⚕️"
      case "market": return "🏪"
      default: return "🏢"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "farmer": return "Agriculteur"
      case "veterinary": return "Vétérinaire"
      case "market": return "Marché"
      default: return "Service"
    }
  }

  // Filtrage par type
  const farmers = nearbyPlaces.filter(p => p.type === "farmer")
  const services = nearbyPlaces.filter(p => p.type === "veterinary" || p.type === "service")
  const markets = nearbyPlaces.filter(p => p.type === "market")

  if (geoLoading && !locationData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-500">{t.locating}</p>
        </div>
      </div>
    )
  }

  if (!locationEnabled) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t.permissionRequired}</h3>
            <p className="text-gray-500 text-sm mb-4">{t.privacyInfo}</p>
            <Button onClick={() => setLocationEnabled(true)} className="gap-2">
              <Globe className="h-4 w-4" />
              {t.enableService}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">{t.title}</h2>
              <p className="text-blue-100 text-sm">{t.subtitle}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0" onClick={refreshAllData} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
                {t.refresh}
              </Button>
              {isOnline ? (
                <Badge className="bg-green-500/20 text-green-200"><Wifi className="h-3 w-3 mr-1" />{t.online}</Badge>
              ) : (
                <Badge className="bg-yellow-500/20 text-yellow-200"><WifiOff className="h-3 w-3 mr-1" />{t.offline}</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Position actuelle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-blue-600" />
            {t.currentPosition}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {geoError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{geoError}</span>
            </div>
          )}

          {locationData && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{t.coordinates}</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setShowCoordinates(!showCoordinates)}>
                  {showCoordinates ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
              <code className="block bg-gray-100 p-2 rounded text-sm font-mono">
                {showCoordinates ? formatCoordinates(locationData.latitude, locationData.longitude) : "••••••••"}
              </code>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">{t.accuracy}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{Math.round(locationData.accuracy)} m</span>
                    <Badge className={getAccuracyStatus(locationData.accuracy).bg}>
                      <span className={getAccuracyStatus(locationData.accuracy).color}>
                        {getAccuracyStatus(locationData.accuracy).status}
                      </span>
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t.lastUpdate}</p>
                  <p className="font-medium text-sm">{formatDate(locationData.timestamp)}</p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-sm text-gray-600">{locationData.address || `${locationData.city}, ${locationData.region}`}</p>
              </div>

              {/* Carte miniature */}
              <div className="h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-200/30 to-blue-200/30" />
                <div className="relative z-10 text-center">
                  <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs font-medium">📍 Votre position</p>
                  <p className="text-[10px] text-gray-600">{locationData.city}, {locationData.region}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Météo locale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Cloud className="h-5 w-5 text-blue-600" />
            {t.weather}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="text-center">
              <span className="text-5xl">{weatherData.icon}</span>
              <div className="text-2xl font-bold mt-1">{weatherData.temperature}°C</div>
              <p className="text-sm text-gray-500">{weatherData.condition}</p>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2"><Droplets className="h-4 w-4 text-blue-500" />{weatherData.humidity}%</div>
              <div className="flex items-center gap-2"><Wind className="h-4 w-4 text-gray-500" />{weatherData.windSpeed} km/h</div>
              <div className="flex items-center gap-2"><Thermometer className="h-4 w-4 text-red-500" />{weatherData.pressure} hPa</div>
            </div>
          </div>
          <div className="pt-3 border-t">
            <p className="text-sm font-medium mb-2">{t.forecast}</p>
            <div className="flex justify-between">
              {weatherData.forecast.map((day, i) => (
                <div key={i} className="text-center">
                  <p className="text-[10px] text-gray-500">{day.day}</p>
                  <div className="text-xl my-1">{day.icon}</div>
                  <p className="text-xs font-medium">{day.temp}°</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agriculteurs à proximité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-blue-600" />
            {t.nearbyFarmers}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {farmers.length === 0 ? (
            <p className="text-center text-gray-400 py-4">{t.noResults}</p>
          ) : (
            <div className="space-y-3">
              {farmers.map(farmer => (
                <div key={farmer.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">
                      {getTypeIcon(farmer.type)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{farmer.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{farmer.distance} km</span>
                        <span>•</span>
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span>{farmer.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">{farmer.address}</p>
                    </div>
                  </div>
                  {farmer.phone && (
                    <Button size="sm" variant="outline" className="gap-1 text-xs" asChild>
                      <a href={`tel:${farmer.phone}`}>
                        <Phone className="h-3 w-3" />
                        {t.contact}
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services à proximité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Store className="h-5 w-5 text-purple-600" />
            {t.nearbyServices}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <p className="text-center text-gray-400 py-4">{t.noResults}</p>
          ) : (
            <div className="space-y-3">
              {services.map(service => (
                <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-xl">
                      {getTypeIcon(service.type)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{service.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{getTypeLabel(service.type)}</span>
                        <span>•</span>
                        <span>{service.distance} km</span>
                        <span>•</span>
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span>{service.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">{service.address}</p>
                    </div>
                  </div>
                  {service.phone && (
                    <Button size="sm" variant="outline" className="gap-1 text-xs" asChild>
                      <a href={`tel:${service.phone}`}>
                        <Phone className="h-3 w-3" />
                        {t.contact}
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Composant Phone manquant
const Phone = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)