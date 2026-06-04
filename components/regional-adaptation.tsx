"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Globe,
  Thermometer,
  Droplets,
  Sun,
  Cloud,
  Sprout,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  Search,
  MapPin,
  Wifi,
  WifiOff,
  RefreshCw,
  Loader2,
  Calendar,
  Clock,
  Award,
  Leaf,
  Tractor,
  Wheat,
  Apple,
  Carrot,
  Egg,
  Milk,
  Star,
  ChevronRight,
} from "lucide-react"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useDebounce } from "@/hooks/use-debounce"
import { showToast } from "@/lib/utils"

interface RegionalAdaptationProps {
  currentLanguage: string
  userRegion: string
  onRegionChange: (region: string) => void
}

interface RegionData {
  name: string
  flag: string
  climate: string
  mainCrops: string[]
  livestock: string[]
  challenges: string[]
  opportunities: string[]
  languages: string[]
  currency: string
  cities: string[]
  population?: number
  gdpAgriculture?: number
  area?: number
  capital?: string
  season?: string
  tempMin?: number
  tempMax?: number
  rainfall?: number
}

interface WeatherForecast {
  day: string
  temp: number
  icon: string
}

// Traductions
const translations: Record<string, any> = {
  fr: {
    title: "Adaptation Régionale",
    subtitle: "Données agricoles adaptées à votre région",
    online: "En ligne",
    offline: "Hors ligne",
    refresh: "Actualiser",
    climate: "Climat",
    population: "Population",
    area: "Superficie",
    capital: "Capitale",
    temperature: "Température",
    season: "Saison",
    rainfall: "Pluviométrie",
    gdpAgriculture: "PIB Agricole",
    overview: "Aperçu",
    agriculture: "Agriculture",
    challenges: "Défis",
    opportunities: "Opportunités",
    weather: "Météo",
    calendar: "Calendrier agricole",
    mainCrops: "Cultures principales",
    livestock: "Élevage",
    cities: "Villes principales",
    languages: "Langues",
    currency: "Monnaie",
    searchPlaceholder: "Rechercher une région...",
    favoriteRegions: "Régions favorites",
    noFavorites: "Aucune région favorite",
    addToFavorites: "Ajouter aux favoris",
    removeFromFavorites: "Retirer des favoris",
    loading: "Chargement...",
    drySeason: "Saison sèche",
    rainySeason: "Saison des pluies",
    recommendations: "Recommandations",
    jan: "Jan", feb: "Fév", mar: "Mar", apr: "Avr", may: "Mai", jun: "Juin",
    jul: "Juil", aug: "Aoû", sep: "Sep", oct: "Oct", nov: "Nov", dec: "Déc",
  },
  en: {
    title: "Regional Adaptation",
    subtitle: "Agricultural data adapted to your region",
    online: "Online",
    offline: "Offline",
    refresh: "Refresh",
    climate: "Climate",
    population: "Population",
    area: "Area",
    capital: "Capital",
    temperature: "Temperature",
    season: "Season",
    rainfall: "Rainfall",
    gdpAgriculture: "GDP Agriculture",
    overview: "Overview",
    agriculture: "Agriculture",
    challenges: "Challenges",
    opportunities: "Opportunities",
    weather: "Weather",
    calendar: "Agricultural calendar",
    mainCrops: "Main crops",
    livestock: "Livestock",
    cities: "Main cities",
    languages: "Languages",
    currency: "Currency",
    searchPlaceholder: "Search region...",
    favoriteRegions: "Favorite regions",
    noFavorites: "No favorite regions",
    addToFavorites: "Add to favorites",
    removeFromFavorites: "Remove from favorites",
    loading: "Loading...",
    drySeason: "Dry season",
    rainySeason: "Rainy season",
    recommendations: "Recommendations",
    jan: "Jan", feb: "Feb", mar: "Mar", apr: "Apr", may: "May", jun: "Jun",
    jul: "Jul", aug: "Aug", sep: "Sep", oct: "Oct", nov: "Nov", dec: "Dec",
  },
}

// Données des régions
const regions: Record<string, RegionData> = {
  "Burkina Faso": {
    name: "Burkina Faso",
    flag: "🇧🇫",
    climate: "Sahélien",
    mainCrops: ["Mil", "Sorgho", "Maïs", "Arachide", "Coton", "Niébé", "Sésame"],
    livestock: ["Zébu", "Chèvres", "Moutons", "Volaille", "Porcins"],
    challenges: ["Sécheresse", "Désertification", "Accès à l'eau", "Changement climatique"],
    opportunities: ["Agriculture pluviale", "Élevage extensif", "Transformation locale", "Coopératives"],
    languages: ["Français", "Mooré", "Dioula", "Fulfuldé"],
    currency: "CFA",
    cities: ["Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Banfora", "Ouahigouya"],
    population: 22673762,
    gdpAgriculture: 31.2,
    area: 274200,
    capital: "Ouagadougou",
    season: "Saison sèche",
    tempMin: 25,
    tempMax: 38,
    rainfall: 800,
  },
  Mali: {
    name: "Mali",
    flag: "🇲🇱",
    climate: "Sahélien/Soudanien",
    mainCrops: ["Riz", "Mil", "Coton", "Arachide", "Fonio", "Maïs"],
    livestock: ["Zébu", "Chèvres", "Moutons", "Dromadaires"],
    challenges: ["Conflit", "Changement climatique", "Accès aux marchés", "Désertification"],
    opportunities: ["Irrigation", "Pêche", "Élevage transhumant", "Mines"],
    languages: ["Français", "Bambara", "Peul", "Soninké"],
    currency: "CFA",
    cities: ["Bamako", "Sikasso", "Mopti", "Ségou", "Gao"],
    population: 21904983,
    gdpAgriculture: 38.5,
    area: 1241000,
    capital: "Bamako",
    season: "Saison sèche",
    tempMin: 20,
    tempMax: 42,
    rainfall: 600,
  },
  Sénégal: {
    name: "Sénégal",
    flag: "🇸🇳",
    climate: "Sahélien/Soudanien",
    mainCrops: ["Arachide", "Riz", "Mil", "Mangue", "Pastèque", "Tomate"],
    livestock: ["Zébu", "Chèvres", "Moutons", "Volaille"],
    challenges: ["Salinisation", "Exode rural", "Accès au crédit", "Pêche illégale"],
    opportunities: ["Pêche", "Horticulture", "Tourisme rural", "Énergie solaire"],
    languages: ["Français", "Wolof", "Peul", "Serer", "Diola"],
    currency: "CFA",
    cities: ["Dakar", "Thiès", "Kaolack", "Saint-Louis", "Ziguinchor"],
    population: 17316449,
    gdpAgriculture: 16.9,
    area: 196722,
    capital: "Dakar",
    season: "Saison sèche",
    tempMin: 22,
    tempMax: 35,
    rainfall: 500,
  },
  Niger: {
    name: "Niger",
    flag: "🇳🇪",
    climate: "Sahélien/Saharien",
    mainCrops: ["Mil", "Niébé", "Oignon", "Moringa", "Sorgho"],
    livestock: ["Zébu", "Chèvres", "Dromadaires", "Moutons"],
    challenges: ["Désertification", "Insécurité", "Pauvreté", "Accès à l'eau"],
    opportunities: ["Cultures irriguées", "Élevage nomade", "Mines d'uranium", "Artisanat"],
    languages: ["Français", "Haoussa", "Zarma", "Peul"],
    currency: "CFA",
    cities: ["Niamey", "Zinder", "Maradi", "Tahoua", "Agadez"],
    population: 25130817,
    gdpAgriculture: 40.2,
    area: 1267000,
    capital: "Niamey",
    season: "Saison sèche",
    tempMin: 28,
    tempMax: 45,
    rainfall: 200,
  },
  "Côte d'Ivoire": {
    name: "Côte d'Ivoire",
    flag: "🇨🇮",
    climate: "Tropical",
    mainCrops: ["Cacao", "Café", "Huile de palme", "Hévéa", "Ananas", "Banane"],
    livestock: ["Zébu", "Chèvres", "Moutons", "Volaille", "Porcins"],
    challenges: ["Déforestation", "Prix des matières premières", "Conflits fonciers"],
    opportunities: ["Agro-industrie", "Exportation", "Transformation locale", "Bio"],
    languages: ["Français", "Dioula", "Baoulé", "Bété", "Sénoufo"],
    currency: "CFA",
    cities: ["Abidjan", "Bouaké", "Yamoussoukro", "Daloa", "San-Pédro"],
    population: 29389301,
    gdpAgriculture: 22.1,
    area: 322463,
    capital: "Yamoussoukro",
    season: "Saison des pluies",
    tempMin: 22,
    tempMax: 32,
    rainfall: 1500,
  },
}

// Données météo simulées
const getRegionWeather = (region: string): { temp: number; icon: string; humidity: number } => {
  const regionData = regions[region] || regions["Burkina Faso"]
  return {
    temp: Math.floor((regionData.tempMin + regionData.tempMax) / 2),
    icon: regionData.season === "Saison des pluies" ? "🌧️" : "☀️",
    humidity: regionData.season === "Saison des pluies" ? 70 : 40,
  }
}

export default function RegionalAdaptation({ currentLanguage, userRegion, onRegionChange }: RegionalAdaptationProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [language, setLanguage] = useState(currentLanguage)
  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [regionWeather, setRegionWeather] = useState({ temp: 32, icon: "☀️", humidity: 45 })

  const isOnline = useOnlineStatus()
  const debouncedSearch = useDebounce(searchQuery, 300)
  const [favoriteRegions, setFavoriteRegions] = useLocalStorage<string[]>("favoriteRegions", [])
  const [lastViewedRegion, setLastViewedRegion] = useLocalStorage("lastViewedRegion", userRegion)

  const t = translations[language as keyof typeof translations] || translations.fr
  const currentRegionData = regions[userRegion] || regions["Burkina Faso"]

  // Mettre à jour la météo quand la région change
  useEffect(() => {
    if (isOnline) {
      setRegionWeather(getRegionWeather(userRegion))
    }
  }, [userRegion, isOnline])

  useEffect(() => {
    setLanguage(currentLanguage)
    setLastViewedRegion(userRegion)
  }, [currentLanguage, userRegion, setLastViewedRegion])

  const handleAddToFavorites = (regionName: string) => {
    if (favoriteRegions.includes(regionName)) {
      setFavoriteRegions(favoriteRegions.filter(r => r !== regionName))
      showToast(`${regionName} retiré des favoris`, "info")
    } else {
      setFavoriteRegions([...favoriteRegions, regionName])
      showToast(`${regionName} ajouté aux favoris`, "success")
    }
  }

  const refreshData = useCallback(async () => {
    if (!isOnline) {
      showToast("Connexion internet requise", "error")
      return
    }
    setRefreshing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setRegionWeather(getRegionWeather(userRegion))
      showToast("Données actualisées", "success")
    } catch {
      showToast("Erreur lors de l'actualisation", "error")
    } finally {
      setRefreshing(false)
    }
  }, [isOnline, userRegion])

  const filteredCountries = Object.keys(regions).filter((country) =>
    country.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  // Prévisions météo
  const forecast: WeatherForecast[] = [
    { day: t.jan, temp: currentRegionData.tempMin || 25, icon: "☀️" },
    { day: t.feb, temp: (currentRegionData.tempMin || 25) + 2, icon: "☀️" },
    { day: t.mar, temp: (currentRegionData.tempMin || 25) + 5, icon: "☀️" },
    { day: t.apr, temp: (currentRegionData.tempMin || 25) + 8, icon: "⛅" },
    { day: t.may, temp: (currentRegionData.tempMin || 25) + 10, icon: "⛅" },
    { day: t.jun, temp: (currentRegionData.tempMin || 25) + 8, icon: "🌧️" },
    { day: t.jul, temp: (currentRegionData.tempMin || 25) + 6, icon: "🌧️" },
    { day: t.aug, temp: (currentRegionData.tempMin || 25) + 5, icon: "🌧️" },
    { day: t.sep, temp: (currentRegionData.tempMin || 25) + 5, icon: "🌧️" },
    { day: t.oct, temp: (currentRegionData.tempMin || 25) + 7, icon: "⛅" },
    { day: t.nov, temp: (currentRegionData.tempMin || 25) + 4, icon: "☀️" },
    { day: t.dec, temp: currentRegionData.tempMin || 25, icon: "☀️" },
  ]

  const recommendations = [
    "🌱 Plantez du niébé après les céréales pour fixer l'azote dans le sol",
    "💧 Utilisez le paillage pour réduire l'évaporation et conserver l'humidité",
    "🐔 Vaccinez vos volailles contre Newcastle à 4 semaines",
    "🌾 Stockez vos récoltes à l'abri de l'humidité pour éviter les moisissures",
    "🚜 Pratiquez la rotation des cultures pour préserver la fertilité des sols",
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Barre de statut */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-bold">{t.title}</h2>
          {isOnline ? (
            <Badge variant="outline" className="text-green-600 border-green-200 gap-1">
              <Wifi className="h-3 w-3" /> {t.online}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-yellow-600 border-yellow-200 gap-1">
              <WifiOff className="h-3 w-3" /> {t.offline}
            </Badge>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={refreshData} disabled={refreshing} className="gap-1">
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {t.refresh}
        </Button>
      </div>

      {/* Sélecteur de région */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className="w-full sm:w-64 p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          value={userRegion}
          onChange={(e) => onRegionChange(e.target.value)}
        >
          {filteredCountries.map((country) => (
            <option key={country} value={country}>
              {regions[country].flag} {country}
            </option>
          ))}
        </select>
      </div>

      {/* Régions favorites */}
      {favoriteRegions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500">{t.favoriteRegions}:</span>
          {favoriteRegions.map(region => (
            <button
              key={region}
              onClick={() => onRegionChange(region)}
              className="text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-2 py-0.5 transition-colors"
            >
              {regions[region]?.flag} {region}
            </button>
          ))}
        </div>
      )}

      {/* Vue d'ensemble de la région */}
      <Card className="bg-gradient-to-r from-green-600 to-blue-700 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
        <CardContent className="p-5 relative z-10">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{currentRegionData.flag}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-bold">{currentRegionData.name}</h2>
                  <button
                    onClick={() => handleAddToFavorites(currentRegionData.name)}
                    className="text-white/70 hover:text-yellow-400 transition-colors"
                  >
                    <Star className={`h-4 w-4 ${favoriteRegions.includes(currentRegionData.name) ? "fill-yellow-400 text-yellow-400" : ""}`} />
                  </button>
                </div>
                <p className="text-green-100 text-sm">{t.climate}: {currentRegionData.climate}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-100">{t.population}</div>
              <div className="text-lg md:text-xl font-bold">{currentRegionData.population?.toLocaleString() || "N/A"}</div>
              <div className="text-xs text-green-100">{t.capital}: {currentRegionData.capital}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center bg-white/10 rounded-lg p-2 backdrop-blur-sm">
              <Thermometer className="h-5 w-5 mx-auto mb-1" />
              <div className="text-lg md:text-xl font-bold">{regionWeather.temp}°C</div>
              <div className="text-xs text-green-100">{t.temperature}</div>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-2 backdrop-blur-sm">
              <Droplets className="h-5 w-5 mx-auto mb-1" />
              <div className="text-lg md:text-xl font-bold">{regionWeather.humidity}%</div>
              <div className="text-xs text-green-100">Humidité</div>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-2 backdrop-blur-sm">
              <Cloud className="h-5 w-5 mx-auto mb-1" />
              <div className="text-lg md:text-xl font-bold">{currentRegionData.rainfall}mm</div>
              <div className="text-xs text-green-100">{t.rainfall}</div>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-2 backdrop-blur-sm">
              <Leaf className="h-5 w-5 mx-auto mb-1" />
              <div className="text-lg md:text-xl font-bold">{currentRegionData.gdpAgriculture}%</div>
              <div className="text-xs text-green-100">{t.gdpAgriculture}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2"><Info className="h-4 w-4" /><span className="hidden sm:inline">{t.overview}</span></TabsTrigger>
          <TabsTrigger value="agriculture" className="gap-2"><Sprout className="h-4 w-4" /><span className="hidden sm:inline">{t.agriculture}</span></TabsTrigger>
          <TabsTrigger value="weather" className="gap-2"><Sun className="h-4 w-4" /><span className="hidden sm:inline">{t.weather}</span></TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2"><Calendar className="h-4 w-4" /><span className="hidden sm:inline">{t.calendar}</span></TabsTrigger>
        </TabsList>

        {/* Onglet Aperçu */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5 text-blue-600" />{t.cities}</CardTitle></CardHeader>
              <CardContent><div className="flex flex-wrap gap-2">{currentRegionData.cities.map(city => (<Badge key={city} variant="secondary">{city}</Badge>))}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5 text-green-600" />{t.languages}</CardTitle></CardHeader>
              <CardContent><div className="flex flex-wrap gap-2">{currentRegionData.languages.map(lang => (<Badge key={lang} variant="outline">{lang}</Badge>))}</div><p className="mt-3 text-sm text-gray-600">💱 {t.currency}: {currentRegionData.currency}</p><p className="text-sm text-gray-600">📐 {t.area}: {currentRegionData.area?.toLocaleString()} km²</p></CardContent>
            </Card>
          </div>

          {/* Défis et opportunités */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-600" />{t.challenges}</CardTitle></CardHeader>
              <CardContent><div className="space-y-2">{currentRegionData.challenges.map((challenge, i) => (<div key={i} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg"><AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" /><span className="text-sm">{challenge}</span></div>))}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-600" />{t.opportunities}</CardTitle></CardHeader>
              <CardContent><div className="space-y-2">{currentRegionData.opportunities.map((opp, i) => (<div key={i} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg"><CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" /><span className="text-sm">{opp}</span></div>))}</div></CardContent>
            </Card>
          </div>

          {/* Recommandations */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Award className="h-5 w-5 text-blue-600" />{t.recommendations}</CardTitle></CardHeader>
            <CardContent><div className="space-y-2">{recommendations.slice(0, 3).map((rec, i) => (<p key={i} className="text-sm text-blue-800">• {rec}</p>))}</div></CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Agriculture */}
        <TabsContent value="agriculture" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Sprout className="h-5 w-5 text-green-600" />{t.mainCrops}</CardTitle></CardHeader>
              <CardContent><div className="flex flex-wrap gap-2">{currentRegionData.mainCrops.map(crop => (<Badge key={crop} className="bg-green-100 text-green-800">{crop}</Badge>))}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5 text-blue-600" />{t.livestock}</CardTitle></CardHeader>
              <CardContent><div className="flex flex-wrap gap-2">{currentRegionData.livestock.map(animal => (<Badge key={animal} variant="outline">{animal}</Badge>))}</div></CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Météo */}
        <TabsContent value="weather" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Sun className="h-5 w-5" />Prévisions annuelles</CardTitle></CardHeader>
            <CardContent>
              <div className="flex overflow-x-auto pb-2 gap-2">
                {forecast.map((day, i) => (
                  <div key={i} className="text-center min-w-[60px] p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium">{day.day}</p>
                    <div className="text-xl my-1">{day.icon}</div>
                    <p className="text-xs font-bold">{day.temp}°</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-800">{currentRegionData.season === "Saison des pluies" ? "Période favorable pour les semis" : "Période idéale pour les récoltes"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Calendrier agricole */}
        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Calendar className="h-5 w-5" />Calendrier des activités</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { month: "Jan-Fév", activity: "Préparation des sols", icon: "🚜" },
                { month: "Mar-Avr", activity: "Semis du maïs et sorgho", icon: "🌱" },
                { month: "Mai-Juin", activity: "Entretien des cultures", icon: "🧑‍🌾" },
                { month: "Juil-Aoû", activity: "Sarclage et fertilisation", icon: "🌿" },
                { month: "Sep-Oct", activity: "Début des récoltes", icon: "🌾" },
                { month: "Nov-Déc", activity: "Stockage et commercialisation", icon: "🏪" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{item.month}</p>
                      <p className="text-xs text-gray-500">{item.activity}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}