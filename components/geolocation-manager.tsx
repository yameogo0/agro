"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Filter,
  Search,
  X,
  ChevronRight,
} from "lucide-react"
import { useGeolocation } from "@/hooks/use-geolocation"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { showToast, formatRelativeTime, formatNumber } from "@/lib/utils"
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
  description?: string
}

interface WeatherData {
  temperature: number
  condition: string
  icon: string
  humidity: number
  windSpeed: number
  pressure: number
  uvIndex?: number
  forecast: {
    day: string
    temp: number
    icon: string
  }[]
}

// Traductions complètes
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
    farmers: "Agriculteurs",
    markets: "Marchés",
    all: "Tous",
    filter: "Filtrer",
    searchPlaceholder: "Rechercher un lieu...",
    details: "Détails",
    call: "Appeler",
    navigate: "Y aller",
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
    farmers: "Farmers",
    markets: "Markets",
    all: "All",
    filter: "Filter",
    searchPlaceholder: "Search place...",
    details: "Details",
    call: "Call",
    navigate: "Navigate",
  },
}

// Données météo améliorées
const demoWeather: WeatherData = {
  temperature: 32,
  condition: "Ensoleillé",
  icon: "☀️",
  humidity: 45,
  windSpeed: 12,
  pressure: 1012,
  uvIndex: 8,
  forecast: [
    { day: "Aujourd'hui", temp: 32, icon: "☀️" },
    { day: "Demain", temp: 29, icon: "⛅" },
    { day: "Après-demain", temp: 27, icon: "🌧️" },
    { day: "J+3", temp: 30, icon: "☀️" },
    { day: "J+4", temp: 28, icon: "⛅" },
  ],
}

// Données de lieux enrichies
const demoNearbyPlaces: NearbyPlace[] = [
  { id: "1", name: "Koffi Asante", type: "farmer", distance: 2.3, rating: 4.8, address: "Ouagadougou", phone: "+226 70 12 34 56", description: "Producteur de mangues bio" },
  { id: "2", name: "Dr. Aminata Traoré", type: "veterinary", distance: 5.1, rating: 4.9, address: "Bobo-Dioulasso", phone: "+226 70 23 45 67", description: "Vétérinaire spécialiste avicole" },
  { id: "3", name: "Marché Central", type: "market", distance: 1.8, rating: 4.2, address: "Ouagadougou", phone: "+226 70 34 56 78", description: "Marché couvert fruits et légumes" },
  { id: "4", name: "Coopérative YELEN", type: "service", distance: 3.2, rating: 4.7, address: "Ouagadougou", phone: "+226 70 45 67 89", description: "Formation et conseil agricole" },
  { id: "5", name: "Ferme Moderne", type: "farmer", distance: 4.5, rating: 4.6, address: "Koudougou", phone: "+226 70 56 78 90", description: "Production de poulets de chair" },
  { id: "6", name: "Marché de Rood-Woko", type: "market", distance: 2.7, rating: 4.3, address: "Ouagadougou", phone: "+226 70 67 89 01", description: "Marché artisanal" },
]

export default function GeolocationManager({ currentLanguage, userRegion }: GeolocationManagerProps) {
  const [activeTab, setActiveTab] = useState("location")
  const [showCoordinates, setShowCoordinates] = useState(false)
  const [language, setLanguage] = useState(currentLanguage)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [weatherData, setWeatherData] = useState<WeatherData>(demoWeather)
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>(demoNearbyPlaces)
  const [selectedType, setSelectedType] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null)

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

  // Filtrer les lieux
  const filteredPlaces = useMemo(() => {
    let filtered = nearbyPlaces
    if (selectedType !== "all") {
      filtered = filtered.filter(p => p.type === selectedType)
    }
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return filtered
  }, [nearbyPlaces, selectedType, searchQuery])

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

  const getAccuracyStatus = (accuracy: number) => {
    if (accuracy <= 10) return { status: "Excellent", color: "text-green-600", bg: "bg-green-100" }
    if (accuracy <= 50) return { status: "Bon", color: "text-blue-600", bg: "bg-blue-100" }
    if (accuracy <= 100) return { status: "Moyen", color: "text-yellow-600", bg: "bg-yellow-100" }
    return { status: "Faible", color: "text-red-600", bg: "bg-red-100" }
  }

  const formatCoordinates = (lat: number, lng: number) => `${lat.toFixed(6)}°, ${lng.toFixed(6)}°`
  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleString()

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
        <Card className="max-w-md w-full border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t.permissionRequired}</h3>
            <p className="text-gray-500 text-sm mb-4">{t.privacyInfo}</p>
            <Button onClick={() => setLocationEnabled(true)} className="gap-2 bg-green-600 hover:bg-green-700">
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
      <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
        <CardContent className="p-5 relative z-10">
          <div className="flex justify-between items-start flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t.title}
              </h2>
              <p className="text-blue-100 text-sm mt-1">{t.subtitle}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0" onClick={refreshAllData} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
                {t.refresh}
              </Button>
              {isOnline ? (
                <Badge className="bg-green-500/20 text-green-200 border-0"><Wifi className="h-3 w-3 mr-1" />{t.online}</Badge>
              ) : (
                <Badge className="bg-yellow-500/20 text-yellow-200 border-0"><WifiOff className="h-3 w-3 mr-1" />{t.offline}</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="location" className="gap-2"><MapPin className="h-4 w-4" />Position</TabsTrigger>
          <TabsTrigger value="nearby" className="gap-2"><Users className="h-4 w-4" />À proximité</TabsTrigger>
          <TabsTrigger value="weather" className="gap-2"><Cloud className="h-4 w-4" />Météo</TabsTrigger>
        </TabsList>

        {/* Onglet Position */}
        <TabsContent value="location" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-blue-600" />
                {t.currentPosition}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setShowCoordinates(!showCoordinates)}>
                      {showCoordinates ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                  <code className="block bg-gray-100 p-3 rounded-lg text-sm font-mono text-center">
                    {showCoordinates ? formatCoordinates(locationData.latitude, locationData.longitude) : "••••••••"}
                  </code>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">{t.accuracy}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-semibold">{Math.round(locationData.accuracy)} m</span>
                        <Badge className={getAccuracyStatus(locationData.accuracy).bg}>
                          <span className={getAccuracyStatus(locationData.accuracy).color}>
                            {getAccuracyStatus(locationData.accuracy).status}
                          </span>
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">{t.lastUpdate}</p>
                      <p className="font-medium text-sm mt-1">{formatDate(locationData.timestamp)}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">{locationData.address || `${locationData.city}, ${locationData.region}`}</p>
                  </div>

                  {/* Carte stylisée */}
                  <div className="h-40 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Cpath fill=%22%234CAF50%22 fill-opacity=%220.1%22 d=%22M50 10 L80 30 L80 70 L50 90 L20 70 L20 30 Z%22/%3E%3C/svg%3E')] bg-repeat opacity-30" />
                    <div className="relative z-10 text-center">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800">📍 {t.yourPosition}</p>
                      <p className="text-xs text-gray-500">{locationData.city}, {locationData.region}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet À proximité */}
        <TabsContent value="nearby" className="mt-6 space-y-4">
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
            <div className="flex gap-2">
              {["all", "farmer", "market", "veterinary"].map(type => (
                <Button
                  key={type}
                  size="sm"
                  variant={selectedType === type ? "default" : "outline"}
                  className={selectedType === type ? "bg-green-600" : ""}
                  onClick={() => setSelectedType(type)}
                >
                  {type === "all" && t.all}
                  {type === "farmer" && t.farmers}
                  {type === "market" && t.markets}
                  {type === "veterinary" && "Vétérinaires"}
                </Button>
              ))}
            </div>
          </div>

          {/* Liste des lieux */}
          {filteredPlaces.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">{t.noResults}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPlaces.map(place => (
                <Card key={place.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedPlace(place)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-gray-100">
                          {getTypeIcon(place.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{place.name}</p>
                            <div className="flex items-center gap-0.5">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs">{place.rating}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <span>{getTypeLabel(place.type)}</span>
                            <span>•</span>
                            <span>{place.distance} km</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{place.address}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Onglet Météo */}
        <TabsContent value="weather" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Cloud className="h-5 w-5 text-blue-600" />
                {t.weather}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <div className="text-center">
                  <span className="text-6xl">{weatherData.icon}</span>
                  <div className="text-3xl font-bold mt-2">{weatherData.temperature}°C</div>
                  <p className="text-sm text-gray-500 mt-1">{weatherData.condition}</p>
                </div>
                <div className="space-y-2 text-right">
                  <div className="flex items-center gap-2 justify-end"><Droplets className="h-4 w-4 text-blue-500" /><span>{weatherData.humidity}%</span></div>
                  <div className="flex items-center gap-2 justify-end"><Wind className="h-4 w-4 text-gray-500" /><span>{weatherData.windSpeed} km/h</span></div>
                  <div className="flex items-center gap-2 justify-end"><Thermometer className="h-4 w-4 text-red-500" /><span>{weatherData.pressure} hPa</span></div>
                  {weatherData.uvIndex && (
                    <div className="flex items-center gap-2 justify-end"><Sun className="h-4 w-4 text-yellow-500" /><span>UV {weatherData.uvIndex}</span></div>
                  )}
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3">{t.forecast}</p>
                <div className="flex justify-between gap-2">
                  {weatherData.forecast.map((day, i) => (
                    <div key={i} className="text-center flex-1 p-2 bg-gray-50 rounded-lg">
                      <p className="text-[10px] text-gray-500">{day.day}</p>
                      <div className="text-xl my-1">{day.icon}</div>
                      <p className="text-xs font-semibold">{day.temp}°</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal détails lieu */}
      {selectedPlace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in" onClick={() => setSelectedPlace(null)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
                  {getTypeIcon(selectedPlace.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedPlace.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="text-sm">{selectedPlace.rating}</span>
                    <span className="text-xs text-gray-400">• {selectedPlace.distance} km</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedPlace(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            {selectedPlace.description && <p className="text-sm text-gray-600 mb-3">{selectedPlace.description}</p>}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-500"><MapPin className="h-4 w-4" />{selectedPlace.address}</div>
              {selectedPlace.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-500"><PhoneIcon className="h-4 w-4" />{selectedPlace.phone}</div>
              )}
            </div>
            <div className="flex gap-3">
              {selectedPlace.phone && (
                <Button asChild className="flex-1 gap-2" variant="outline">
                  <a href={`tel:${selectedPlace.phone}`}>
                    <PhoneIcon className="h-4 w-4" />
                    {t.call}
                  </a>
                </Button>
              )}
              <Button className="flex-1 gap-2 bg-green-600 hover:bg-green-700" onClick={() => setSelectedPlace(null)}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Composant PhoneIcon
const PhoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)