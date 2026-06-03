"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"

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
}

export default function RegionalAdaptation({ currentLanguage, userRegion, onRegionChange }: RegionalAdaptationProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  const regions: Record<string, RegionData> = {
    "Burkina Faso": {
      name: "Burkina Faso",
      flag: "🇧🇫",
      climate: "Sahélien",
      mainCrops: ["Mil", "Sorgho", "Maïs", "Arachide", "Coton"],
      livestock: ["Zébu", "Chèvres Mossi", "Moutons Djallonké", "Volaille locale"],
      challenges: ["Sécheresse", "Désertification", "Accès à l'eau", "Changement climatique"],
      opportunities: ["Agriculture pluviale", "Élevage extensif", "Transformation locale", "Coopératives"],
      languages: ["Français", "Mooré", "Dioula", "Fulfuldé"],
      currency: "CFA",
      cities: ["Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Banfora"],
      population: 22673762,
      gdpAgriculture: 31.2,
    },
    Mali: {
      name: "Mali",
      flag: "🇲🇱",
      climate: "Sahélien/Soudanien",
      mainCrops: ["Riz", "Mil", "Coton", "Arachide", "Fonio"],
      livestock: ["Zébu Peul", "Chèvres du Sahel", "Moutons Touareg", "Dromadaires"],
      challenges: ["Conflit", "Changement climatique", "Accès aux marchés"],
      opportunities: ["Irrigation", "Pêche", "Élevage transhumant"],
      languages: ["Français", "Bambara", "Peul", "Soninké"],
      currency: "CFA",
      cities: ["Bamako", "Sikasso", "Mopti", "Ségou"],
      population: 21904983,
      gdpAgriculture: 38.5,
    },
    Sénégal: {
      name: "Sénégal",
      flag: "🇸🇳",
      climate: "Sahélien/Soudanien",
      mainCrops: ["Arachide", "Riz", "Mil", "Mangue"],
      livestock: ["Zébu Gobra", "Ndama", "Chèvres du Sahel", "Volaille"],
      challenges: ["Salinisation", "Exode rural", "Accès au crédit"],
      opportunities: ["Pêche", "Horticulture", "Tourisme rural"],
      languages: ["Français", "Wolof", "Peul", "Serer"],
      currency: "CFA",
      cities: ["Dakar", "Thiès", "Kaolack", "Saint-Louis"],
      population: 17316449,
      gdpAgriculture: 16.9,
    },
    Niger: {
      name: "Niger",
      flag: "🇳🇪",
      climate: "Sahélien/Saharien",
      mainCrops: ["Mil", "Niébé", "Oignon", "Moringa"],
      livestock: ["Zébu Azawak", "Chèvres rousses", "Dromadaires", "Ânes"],
      challenges: ["Désertification", "Insécurité", "Pauvreté"],
      opportunities: ["Cultures irriguées", "Élevage nomade", "Mines"],
      languages: ["Français", "Haoussa", "Zarma", "Peul"],
      currency: "CFA",
      cities: ["Niamey", "Zinder", "Maradi", "Tahoua"],
      population: 25130817,
      gdpAgriculture: 40.2,
    },
  }

  const currentRegionData = regions[userRegion] || regions["Burkina Faso"]

  const weatherData = {
    temperature: 32,
    humidity: 45,
    rainfall: 12,
    season: "Saison sèche",
    forecast: [
      { day: "Lun", temp: 34, icon: "☀️" },
      { day: "Mar", temp: 31, icon: "⛅" },
      { day: "Mer", temp: 29, icon: "🌧️" },
      { day: "Jeu", temp: 33, icon: "☀️" },
      { day: "Ven", temp: 35, icon: "☀️" },
    ],
  }

  const filteredCountries = Object.keys(regions).filter((country) =>
    country.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Sélecteur de région */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Changer de région</label>
              <select
                value={userRegion}
                onChange={(e) => onRegionChange(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                {Object.keys(regions).map((region) => (
                  <option key={region} value={region}>
                    {regions[region].flag} {region}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une région..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vue d'ensemble de la région */}
      <Card className="bg-gradient-to-r from-green-600 to-blue-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-4xl">{currentRegionData.flag}</span>
              <div>
                <h2 className="text-2xl font-bold">{currentRegionData.name}</h2>
                <p className="text-green-100">Climat: {currentRegionData.climate}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-100">Population</div>
              <div className="text-xl font-bold">{currentRegionData.population?.toLocaleString() || "N/A"}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center bg-white/10 rounded-lg p-2">
              <Thermometer className="h-5 w-5 mx-auto mb-1" />
              <div className="text-lg font-bold">{weatherData.temperature}°C</div>
              <div className="text-xs text-green-100">Température</div>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-2">
              <Droplets className="h-5 w-5 mx-auto mb-1" />
              <div className="text-lg font-bold">{weatherData.humidity}%</div>
              <div className="text-xs text-green-100">Humidité</div>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-2">
              <Cloud className="h-5 w-5 mx-auto mb-1" />
              <div className="text-lg font-bold">{weatherData.rainfall}mm</div>
              <div className="text-xs text-green-100">Précipitations</div>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-2">
              <Sprout className="h-5 w-5 mx-auto mb-1" />
              <div className="text-lg font-bold">{currentRegionData.gdpAgriculture}%</div>
              <div className="text-xs text-green-100">PIB Agricole</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="agriculture">Agriculture</TabsTrigger>
          <TabsTrigger value="info">Informations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="h-5 w-5" />
                  Prévisions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {weatherData.forecast.map((day, i) => (
                    <div key={i} className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-xs font-medium">{day.day}</div>
                      <div className="text-xl my-1">{day.icon}</div>
                      <div className="text-sm font-bold">{day.temp}°</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Défis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentRegionData.challenges.map((challenge, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">{challenge}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Opportunités
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentRegionData.opportunities.map((opp, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{opp}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Villes principales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {currentRegionData.cities.map((city, i) => (
                    <Badge key={i} variant="outline">{city}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agriculture" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sprout className="h-5 w-5" />
                  Cultures principales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {currentRegionData.mainCrops.map((crop, i) => (
                    <Badge key={i} className="bg-green-100 text-green-800">{crop}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Élevage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {currentRegionData.livestock.map((animal, i) => (
                    <Badge key={i} variant="outline">{animal}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="info" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between p-2 border-b">
                <span className="font-medium">Langues parlées:</span>
                <span>{currentRegionData.languages.join(", ")}</span>
              </div>
              <div className="flex justify-between p-2 border-b">
                <span className="font-medium">Monnaie:</span>
                <span>{currentRegionData.currency}</span>
              </div>
              <div className="flex justify-between p-2 border-b">
                <span className="font-medium">Population:</span>
                <span>{currentRegionData.population?.toLocaleString()} habitants</span>
              </div>
              <div className="flex justify-between p-2 border-b">
                <span className="font-medium">PIB Agricole:</span>
                <span>{currentRegionData.gdpAgriculture}% du PIB total</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
