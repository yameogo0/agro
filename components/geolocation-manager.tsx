"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Globe,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Thermometer,
  Cloud,
  Users,
  Droplets,
  Wind,
  Sun,
  Wifi,
  WifiOff,
  Loader2,
  Star,
  Search,
  X,
  ChevronRight,
} from "lucide-react"
import { useGeolocation } from "@/hooks/use-geolocation"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { showToast } from "@/lib/utils"

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
  forecast: { day: string; temp: number; icon: string }[]
}

const translations: Record<string, any> = {
  fr: {
    title: "Géolocalisation",
    subtitle: "Services et informations basés sur votre position réelle",
    online: "En ligne",
    offline: "Hors ligne",
    refresh: "Actualiser",
    locating: "Recherche de votre position GPS...",
    currentPosition: "Position actuelle (GPS)",
    coordinates: "Coordonnées GPS",
    accuracy: "Précision",
    lastUpdate: "Dernière mise à jour",
    weather: "Météo",
    temperature: "Température",
    humidity: "Humidité",
    wind: "Vent",
    pressure: "Pression",
    forecast: "Prévisions",
    nearbyFarmers: "Agriculteurs proches",
    noResults: "Aucun résultat",
    loading: "Chargement...",
    permissionRequired: "Permission GPS requise",
    enableService: "Activer la géolocalisation",
    privacyInfo: "Activez la localisation pour voir votre position réelle.",
    farmers: "Agriculteurs",
    markets: "Marchés",
    all: "Tous",
    searchPlaceholder: "Rechercher...",
    call: "Appeler",
  },
  en: {
    title: "Geolocation",
    subtitle: "Services based on your real GPS position",
    online: "Online",
    offline: "Offline",
    refresh: "Refresh",
    locating: "Searching for your GPS position...",
    currentPosition: "Current position (GPS)",
    coordinates: "GPS coordinates",
    accuracy: "Accuracy",
    lastUpdate: "Last update",
    weather: "Weather",
    temperature: "Temperature",
    humidity: "Humidity",
    wind: "Wind",
    pressure: "Pressure",
    forecast: "Forecast",
    nearbyFarmers: "Nearby farmers",
    noResults: "No results",
    loading: "Loading...",
    permissionRequired: "GPS permission required",
    enableService: "Enable geolocation",
    privacyInfo: "Enable location to see your real position.",
    farmers: "Farmers",
    markets: "Markets",
    all: "All",
    searchPlaceholder: "Search...",
    call: "Call",
  },
}

const demoNearbyPlaces: NearbyPlace[] = [
  { id: "1", name: "Koffi Asante", type: "farmer", distance: 2.3, rating: 4.8, address: "À proximité", phone: "+226 70 12 34 56", description: "Producteur de mangues bio" },
  { id: "2", name: "Dr. Aminata Traoré", type: "veterinary", distance: 5.1, rating: 4.9, address: "À proximité", phone: "+226 70 23 45 67", description: "Vétérinaire spécialiste avicole" },
  { id: "3", name: "Marché Central", type: "market", distance: 1.8, rating: 4.2, address: "À proximité", phone: "+226 70 34 56 78", description: "Marché couvert fruits et légumes" },
]

export default function GeolocationManager({ currentLanguage }: GeolocationManagerProps) {
  const [activeTab, setActiveTab] = useState("location")
  const [showCoordinates, setShowCoordinates] = useState(false)
  const [language, setLanguage] = useState(currentLanguage)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null)
  const [reverseAddress, setReverseAddress] = useState<string>("")

  const isOnline = useOnlineStatus()
  
  // ✅ Utilisation du GPS réel
  const { 
    latitude, 
    longitude, 
    accuracy, 
    error: geoError, 
    loading: geoLoading, 
    refresh: refreshGeolocation 
  } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,  // ← Pas de cache, position réelle à chaque fois
  })
  
  const [locationEnabled, setLocationEnabled] = useLocalStorage("geolocationEnabled", true)

  const t = translations[language as keyof typeof translations] || translations.fr

  // 🌍 Reverse geocoding pour obtenir l'adresse réelle à partir des coordonnées GPS
  useEffect(() => {
    if (latitude && longitude) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`)
        .then(res => res.json())
        .then(data => {
          if (data.display_name) {
            const parts = data.display_name.split(',')
            const city = parts.find((p: string) => p.includes('Burkina') || p.includes('Mali') || p.includes('Côte') || p.includes('Sénégal') || p.includes('Niger')) || parts[0]
            setReverseAddress(`${city.trim()}`)
          } else {
            setReverseAddress(`${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`)
          }
        })
        .catch(() => {
          setReverseAddress(`${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`)
        })
    }
  }, [latitude, longitude])

  // 📍 Construction des données UNIQUEMENT à partir du GPS (pas de userRegion)
  const locationData: LocationData | null = latitude && longitude ? {
    latitude,
    longitude,
    country: "Position réelle GPS",
    region: reverseAddress || "Position GPS",
    city: reverseAddress?.split(',')[0] || "Position actuelle",
    accuracy: accuracy || 0,
    timestamp: Date.now(),
    address: reverseAddress || `${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°`,
  } : null

  useEffect(() => {
    setLanguage(currentLanguage)
  }, [currentLanguage])

  const refreshAllData = useCallback(async () => {
    if (!isOnline) {
      showToast("Connexion internet requise", "error")
      return
    }
    setIsRefreshing(true)
    try {
      await refreshGeolocation()
      showToast("Position GPS actualisée", "success")
    } catch {
      showToast("Erreur lors de l'actualisation", "error")
    } finally {
      setIsRefreshing(false)
    }
  }, [isOnline, refreshGeolocation])

  const formatCoordinates = (lat: number, lng: number) => `${lat.toFixed(6)}°, ${lng.toFixed(6)}°`
  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleString()

  const getAccuracyStatus = (accuracy: number) => {
    if (accuracy <= 10) return { status: "Excellent", color: "text-green-600", bg: "bg-green-100" }
    if (accuracy <= 50) return { status: "Bon", color: "text-blue-600", bg: "bg-blue-100" }
    if (accuracy <= 100) return { status: "Moyen", color: "text-yellow-600", bg: "bg-yellow-100" }
    return { status: "Faible", color: "text-red-600", bg: "bg-red-100" }
  }

  // ⏳ État de chargement
  if (geoLoading && !locationData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-500">{t.locating}</p>
          <p className="text-xs text-gray-400 mt-2">Activez le GPS sur votre téléphone</p>
        </div>
      </div>
    )
  }

  // 🔒 Permission refusée
  if (!locationEnabled) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t.permissionRequired}</h3>
            <p className="text-gray-500 text-sm mb-4">{t.privacyInfo}</p>
            <Button onClick={() => setLocationEnabled(true)} className="gap-2 bg-green-600">
              <Globe className="h-4 w-4" />
              {t.enableService}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <CardContent className="p-5">
          <div className="flex justify-between items-start flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t.title}
              </h2>
              <p className="text-blue-100 text-sm mt-1">{t.subtitle}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white" onClick={refreshAllData} disabled={isRefreshing}>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="location"><MapPin className="h-4 w-4 mr-1" />Position</TabsTrigger>
          <TabsTrigger value="nearby"><Users className="h-4 w-4 mr-1" />À proximité</TabsTrigger>
          <TabsTrigger value="weather"><Cloud className="h-4 w-4 mr-1" />Météo</TabsTrigger>
        </TabsList>

        {/* ✅ Onglet Position - Maintenant avec GPS réel */}
        <TabsContent value="location" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                {t.currentPosition}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {geoError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 inline mr-2" />
                  {geoError}
                </div>
              )}

              {locationData ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{t.coordinates}</span>
                    <Button variant="ghost" size="sm" onClick={() => setShowCoordinates(!showCoordinates)}>
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

                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-800">📍 {t.currentPosition}</p>
                    <p className="text-sm text-gray-700 mt-1">{locationData.address}</p>
                  </div>

                  {/* Carte stylisée avec les vraies coordonnées */}
                  <div className="h-40 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">📍 {locationData.address || "Position GPS"}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {locationData.latitude.toFixed(4)}°, {locationData.longitude.toFixed(4)}°
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Recherche du signal GPS...</p>
                  <p className="text-xs mt-2">Assurez-vous que le GPS est activé</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nearby" className="mt-6">
          <div className="space-y-3">
            {demoNearbyPlaces.map(place => (
              <Card key={place.id} className="cursor-pointer" onClick={() => setSelectedPlace(place)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                        {place.type === "farmer" && "👨‍🌾"}
                        {place.type === "veterinary" && "👩‍⚕️"}
                        {place.type === "market" && "🏪"}
                      </div>
                      <div>
                        <p className="font-semibold">{place.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{place.distance} km</span>
                          <span>•</span>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="ml-0.5">{place.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="weather" className="mt-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Cloud className="h-16 w-16 mx-auto text-blue-500 mb-4" />
              <p className="text-gray-500">Météo basée sur votre position GPS réelle</p>
              <Button variant="outline" className="mt-4" onClick={refreshAllData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser la météo
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal détails */}
      {selectedPlace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedPlace(null)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{selectedPlace.name}</h3>
              <button onClick={() => setSelectedPlace(null)}><X className="h-5 w-5" /></button>
            </div>
            {selectedPlace.description && <p className="text-sm text-gray-600 mb-3">{selectedPlace.description}</p>}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4" />{selectedPlace.address}</div>
              {selectedPlace.phone && (
                <div className="flex items-center gap-2 text-sm"><PhoneIcon className="h-4 w-4" />{selectedPlace.phone}</div>
              )}
            </div>
            {selectedPlace.phone && (
              <Button asChild className="w-full">
                <a href={`tel:${selectedPlace.phone}`}>📞 {t.call}</a>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)