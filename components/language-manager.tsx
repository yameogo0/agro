"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Search,
  CheckCircle,
  Settings,
  Download,
  Globe,
  Languages,
  Heart,
  Wifi,
  WifiOff,
  RefreshCw,
  X,
  Loader2,
} from "lucide-react"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { showToast } from "@/lib/utils"

interface LanguageManagerProps {
  currentLanguage: string
  onLanguageChange: (language: string) => void
}

interface Language {
  code: string
  name: string
  flag: string
  status: "available" | "beta"
}

interface DownloadedLanguage {
  code: string
  downloadedAt: number
}

export default function LanguageManager({ currentLanguage, onLanguageChange }: LanguageManagerProps) {
  const isOnline = useOnlineStatus()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("languages")
  const [downloadingLang, setDownloadingLang] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Paramètres
  const [autoDetection, setAutoDetection] = useLocalStorage("autoLanguageDetection", true)
  const [autoTranslation, setAutoTranslation] = useLocalStorage("autoTranslation", true)
  const [textToSpeech, setTextToSpeech] = useLocalStorage("textToSpeech", false)
  const [downloadedLanguages, setDownloadedLanguages] = useLocalStorage<DownloadedLanguage[]>("downloadedLanguages", [])

  // Liste compacte des langues
  const languages: Language[] = [
    { code: "fr", name: "Français", flag: "🇫🇷", status: "available" },
    { code: "en", name: "English", flag: "🇺🇸", status: "available" },
    { code: "pt", name: "Português", flag: "🇵🇹", status: "available" },
    { code: "es", name: "Español", flag: "🇪🇸", status: "beta" },
    { code: "dyu", name: "Dioula", flag: "🇨🇮", status: "available" },
    { code: "mos", name: "Mooré", flag: "🇧🇫", status: "available" },
    { code: "ha", name: "Haoussa", flag: "🇳🇬", status: "available" },
  ]

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    if (status === "beta") return <Badge className="bg-yellow-100 text-yellow-700 text-[10px]">Bêta</Badge>
    return <Badge className="bg-green-100 text-green-700 text-[10px]">Disponible</Badge>
  }

  const isLanguageDownloaded = (code: string) => downloadedLanguages.some(lang => lang.code === code)

  const handleDownloadLanguage = async (language: Language) => {
    if (!isOnline) { showToast("Connexion internet requise", "error"); return }
    setDownloadingLang(language.code)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setDownloadedLanguages(prev => {
        if (prev.some(l => l.code === language.code)) return prev
        return [...prev, { code: language.code, downloadedAt: Date.now() }]
      })
      showToast(`${language.name} téléchargé`, "success")
    } catch { showToast("Erreur de téléchargement", "error") }
    finally { setDownloadingLang(null) }
  }

  const handleRemoveLanguage = (code: string) => {
    setDownloadedLanguages(prev => prev.filter(l => l.code !== code))
    showToast("Langue retirée", "success")
  }

  const refreshData = async () => {
    if (!isOnline) { showToast("Connexion internet requise", "error"); return }
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsRefreshing(false)
    showToast("Données actualisées", "success")
  }

  return (
    <div className="space-y-4">
      {/* En-tête compact */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Languages className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold">Langues</h2>
          {!isOnline && <Badge variant="outline" className="text-yellow-600 text-[10px]"><WifiOff className="h-3 w-3 mr-1" />Hors ligne</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={refreshData} disabled={isRefreshing} className="h-8 w-8 p-0">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Tabs compactes */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-9">
          <TabsTrigger value="languages" className="text-xs">Langues</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">Paramètres</TabsTrigger>
          <TabsTrigger value="download" className="text-xs">Hors ligne</TabsTrigger>
        </TabsList>

        {/* Onglet Langues */}
        <TabsContent value="languages" className="mt-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 h-8 text-sm"
            />
          </div>

          {/* Liste compacte des langues */}
          <div className="space-y-1.5">
            {filteredLanguages.map(lang => (
              <div
                key={lang.code}
                onClick={() => {
                  onLanguageChange(lang.code)
                  showToast(`Langue : ${lang.name}`, "success")
                }}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 border ${
                  currentLanguage === lang.code ? "border-green-500 bg-green-50" : "border-gray-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-sm">{lang.name}</span>
                    {getStatusBadge(lang.status)}
                  </div>
                </div>
                {currentLanguage === lang.code && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
            ))}
          </div>

          {/* Petit résumé */}
          <div className="flex justify-between text-[10px] text-gray-400 pt-1">
            <span>{languages.length} langues</span>
            <span>{languages.filter(l => l.status === "available").length} disponibles</span>
            <span>{languages.filter(l => l.status === "beta").length} en bêta</span>
          </div>
        </TabsContent>

        {/* Onglet Paramètres */}
        <TabsContent value="settings" className="mt-3 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Détection auto</p>
                <p className="text-[10px] text-gray-500">Langue du système</p>
              </div>
              <Switch checked={autoDetection} onCheckedChange={setAutoDetection} />
            </div>
            <div className="flex items-center justify-between p-2 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Traduction auto</p>
                <p className="text-[10px] text-gray-500">Messages traduits</p>
              </div>
              <Switch checked={autoTranslation} onCheckedChange={setAutoTranslation} />
            </div>
            <div className="flex items-center justify-between p-2 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Synthèse vocale</p>
                <p className="text-[10px] text-gray-500">Lecture audio</p>
              </div>
              <Switch checked={textToSpeech} onCheckedChange={setTextToSpeech} />
            </div>
          </div>
        </TabsContent>

        {/* Onglet Téléchargement */}
        <TabsContent value="download" className="mt-3 space-y-3">
          <div className="space-y-1.5">
            {languages.filter(l => l.status === "available").map(lang => {
              const isDownloaded = isLanguageDownloaded(lang.code)
              const isDownloading = downloadingLang === lang.code
              return (
                <div key={lang.code} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-sm font-medium">{lang.name}</span>
                  </div>
                  {isDownloaded ? (
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500" onClick={() => handleRemoveLanguage(lang.code)}>
                      <X className="h-3 w-3 mr-1" /> Retirer
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleDownloadLanguage(lang)} disabled={isDownloading || !isOnline}>
                      {isDownloading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Download className="h-3 w-3 mr-1" />}
                      {isDownloading ? "..." : "Télécharger"}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
          <div className="bg-blue-50 p-2 rounded-lg text-center text-[10px] text-blue-700">
            📱 Utilisation hors ligne
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}