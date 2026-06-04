"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import {
  Search,
  Users,
  CheckCircle,
  Settings,
  Volume2,
  Download,
  Smartphone,
  Globe,
  Languages,
  Trophy,
  Star,
  TrendingUp,
  Clock,
  Award,
  Heart,
  BookOpen,
  Mic,
  Zap,
  Target,
  MapPin,
  X,
  ChevronRight,
  Loader2,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { showToast, formatNumber } from "@/lib/utils"

interface LanguageManagerProps {
  currentLanguage: string
  onLanguageChange: (language: string) => void
}

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
  speakers: number
  region: string
  status: "available" | "beta" | "coming-soon"
  completeness: number
  contributors: number
  fileSize?: string
}

interface DownloadedLanguage {
  code: string
  downloadedAt: number
  fileSize: string
}

// Traductions du gestionnaire
const managerTranslations: Record<string, any> = {
  fr: {
    title: "Gestionnaire de Langues",
    subtitle: "Agro Multicenter Hinos disponible en",
    languages: "langues",
    supportedLanguages: "Langues supportées",
    totalSpeakers: "Locuteurs totaux",
    activeLanguages: "Langues actives",
    inBeta: "En bêta",
    averageCompleteness: "Complétude moyenne",
    searchPlaceholder: "Rechercher une langue...",
    currentLanguage: "Langue actuelle",
    speakers: "locuteurs",
    complete: "complet",
    contributors: "contributeurs",
    current: "Actuelle",
    languageSettings: "Paramètres de langue",
    autoDetection: "Détection automatique",
    autoDetectionDesc: "Détecter automatiquement la langue du système",
    autoTranslation: "Traduction automatique",
    autoTranslationDesc: "Traduire automatiquement les messages",
    textToSpeech: "Synthèse vocale",
    textToSpeechDesc: "Lire les textes à haute voix",
    dateFormat: "Format de date",
    numberFormat: "Format numérique",
    enabled: "Activé",
    disabled: "Désactivé",
    configure: "Configurer",
    contribute: "Contribuer aux traductions",
    contributeDesc: "Aidez-nous à améliorer Agro Multicenter Hinos en contribuant aux traductions",
    volunteerTranslator: "Traducteur bénévole",
    volunteerTranslatorDesc: "Rejoignez notre équipe de traducteurs",
    becomeTranslator: "Devenir traducteur",
    languageReviewer: "Réviseur linguistique",
    languageReviewerDesc: "Relisez et validez les traductions existantes",
    becomeReviewer: "Devenir réviseur",
    priorityLanguages: "Langues prioritaires",
    offlinePacks: "Packs de langues hors ligne",
    offlinePacksDesc: "Téléchargez les packs de langues pour utiliser l'application sans connexion internet",
    download: "Télécharger",
    downloaded: "Téléchargé",
    remove: "Retirer",
    offlineInfo: "Les packs de langues permettent d'utiliser l'application même sans connexion internet",
    popular: "Populaire",
    translationProgress: "Progression des traductions",
    leaderboard: "Classement des traducteurs",
    online: "En ligne",
    offline: "Hors ligne",
    refresh: "Actualiser",
    loading: "Chargement...",
    downloadComplete: "Téléchargement terminé",
    downloadError: "Erreur de téléchargement",
    languageChanged: "Langue changée",
    comingSoon: "Bientôt disponible",
  },
  en: {
    title: "Language Manager",
    subtitle: "Agro Multicenter Hinos available in",
    languages: "languages",
    supportedLanguages: "Supported languages",
    totalSpeakers: "Total speakers",
    activeLanguages: "Active languages",
    inBeta: "In beta",
    averageCompleteness: "Average completeness",
    searchPlaceholder: "Search for a language...",
    currentLanguage: "Current language",
    speakers: "speakers",
    complete: "complete",
    contributors: "contributors",
    current: "Current",
    languageSettings: "Language settings",
    autoDetection: "Auto detection",
    autoDetectionDesc: "Automatically detect system language",
    autoTranslation: "Auto translation",
    autoTranslationDesc: "Automatically translate messages",
    textToSpeech: "Text to speech",
    textToSpeechDesc: "Read texts aloud",
    dateFormat: "Date format",
    numberFormat: "Number format",
    enabled: "Enabled",
    disabled: "Disabled",
    configure: "Configure",
    contribute: "Contribute to translations",
    contributeDesc: "Help us improve Agro Multicenter Hinos by contributing translations",
    volunteerTranslator: "Volunteer translator",
    volunteerTranslatorDesc: "Join our team of translators",
    becomeTranslator: "Become a translator",
    languageReviewer: "Language reviewer",
    languageReviewerDesc: "Review and validate existing translations",
    becomeReviewer: "Become a reviewer",
    priorityLanguages: "Priority languages",
    offlinePacks: "Offline language packs",
    offlinePacksDesc: "Download language packs to use the app without internet connection",
    download: "Download",
    downloaded: "Downloaded",
    remove: "Remove",
    offlineInfo: "Language packs allow you to use the app even without internet connection",
    popular: "Popular",
    translationProgress: "Translation progress",
    leaderboard: "Translator leaderboard",
    online: "Online",
    offline: "Offline",
    refresh: "Refresh",
    loading: "Loading...",
    downloadComplete: "Download complete",
    downloadError: "Download error",
    languageChanged: "Language changed",
    comingSoon: "Coming soon",
  },
}

export default function LanguageManager({ currentLanguage, onLanguageChange }: LanguageManagerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [activeTab, setActiveTab] = useState("languages")
  const [uiLanguage, setUiLanguage] = useState(currentLanguage)
  const [downloadingLang, setDownloadingLang] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Hooks
  const isOnline = useOnlineStatus()
  const [autoDetection, setAutoDetection] = useLocalStorage("autoLanguageDetection", true)
  const [autoTranslation, setAutoTranslation] = useLocalStorage("autoTranslation", true)
  const [textToSpeech, setTextToSpeech] = useLocalStorage("textToSpeech", false)
  const [downloadedLanguages, setDownloadedLanguages] = useLocalStorage<DownloadedLanguage[]>("downloadedLanguages", [])

  const t = managerTranslations[uiLanguage as keyof typeof managerTranslations] || managerTranslations.fr

  const languages: Language[] = [
    { code: "fr", name: "Français", nativeName: "Français", flag: "🇫🇷", speakers: 280000000, region: "Global", status: "available", completeness: 100, contributors: 89, fileSize: "12.5 MB" },
    { code: "en", name: "English", nativeName: "English", flag: "🇺🇸", speakers: 1500000000, region: "Global", status: "available", completeness: 100, contributors: 120, fileSize: "12.5 MB" },
    { code: "pt", name: "Português", nativeName: "Português", flag: "🇵🇹", speakers: 260000000, region: "Global", status: "available", completeness: 100, contributors: 67, fileSize: "12.5 MB" },
    { code: "es", name: "Español", nativeName: "Español", flag: "🇪🇸", speakers: 550000000, region: "Global", status: "beta", completeness: 85, contributors: 45, fileSize: "11.2 MB" },
    { code: "dyu", name: "Dioula", nativeName: "Jula", flag: "🇨🇮", speakers: 12000000, region: "West Africa", status: "available", completeness: 95, contributors: 25, fileSize: "8.5 MB" },
    { code: "mos", name: "Mooré", nativeName: "Mòoré", flag: "🇧🇫", speakers: 7000000, region: "West Africa", status: "available", completeness: 92, contributors: 18, fileSize: "7.8 MB" },
    { code: "ha", name: "Haoussa", nativeName: "Harshen Hausa", flag: "🇳🇬", speakers: 70000000, region: "West Africa", status: "available", completeness: 88, contributors: 22, fileSize: "9.2 MB" },
  ]

  const regions = [
    { id: "all", name: "Toutes les régions", icon: Globe, count: languages.length },
    { id: "Global", name: "Mondial", icon: Languages, count: languages.filter((l) => l.region === "Global").length },
    { id: "West Africa", name: "Afrique de l'Ouest", icon: MapPin, count: languages.filter((l) => l.region === "West Africa").length },
  ]

  const topContributors = [
    { name: "Dr. Amadou Diallo", languages: 5, translations: 1250, rank: 1, avatar: "👨‍🏫" },
    { name: "Fatoumata Sy", languages: 4, translations: 890, rank: 2, avatar: "👩‍🌾" },
    { name: "Ibrahim Traoré", languages: 3, translations: 720, rank: 3, avatar: "👨‍💻" },
  ]

  const filteredLanguages = languages.filter((lang) => {
    const matchesSearch = lang.name.toLowerCase().includes(searchQuery.toLowerCase()) || lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRegion = selectedRegion === "all" || lang.region === selectedRegion
    return matchesSearch && matchesRegion
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800 border-green-200"
      case "beta": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "coming-soon": return "bg-gray-100 text-gray-800 border-gray-200"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    const texts = { available: "Disponible", beta: "Bêta", "coming-soon": "Bientôt" }
    return texts[status as keyof typeof texts] || status
  }

  const isLanguageDownloaded = (code: string) => downloadedLanguages.some(lang => lang.code === code)

  const handleDownloadLanguage = async (language: Language) => {
    if (!isOnline) { showToast("Connexion internet requise", "error"); return }
    if (language.status !== "available" && language.status !== "beta") { showToast(t.comingSoon, "info"); return }

    setDownloadingLang(language.code)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setDownloadedLanguages(prev => {
        if (prev.some(l => l.code === language.code)) return prev
        return [...prev, { code: language.code, downloadedAt: Date.now(), fileSize: language.fileSize || "0 MB" }]
      })
      showToast(`${language.name} ${t.downloadComplete}`, "success")
    } catch { showToast(t.downloadError, "error") }
    finally { setDownloadingLang(null) }
  }

  const handleRemoveLanguage = (code: string) => {
    setDownloadedLanguages(prev => prev.filter(l => l.code !== code))
    showToast("Langue retirée", "success")
  }

  const handleLanguageChange = (code: string) => {
    onLanguageChange(code)
    setUiLanguage(code)
    showToast(`${t.languageChanged} : ${languages.find(l => l.code === code)?.name}`, "success")
  }

  const refreshData = async () => {
    if (!isOnline) { showToast("Connexion internet requise", "error"); return }
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
    showToast("Données actualisées", "success")
  }

  useEffect(() => { setUiLanguage(currentLanguage) }, [currentLanguage])

  const currentLang = languages.find((l) => l.code === uiLanguage) || languages[0]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-700 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
        <CardContent className="p-6 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Languages className="h-6 w-6" />
                <h2 className="text-2xl font-bold">{t.title}</h2>
                {!isOnline && <Badge className="bg-yellow-500 text-white text-xs gap-1"><WifiOff className="h-3 w-3" />{t.offline}</Badge>}
              </div>
              <p className="text-blue-100">{t.subtitle} {languages.filter(l => l.status === "available").length} {t.languages}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0" onClick={refreshData} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                {t.refresh}
              </Button>
              <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
                <Globe className="h-5 w-5" />
                <div className="text-right"><div className="text-2xl font-bold">{languages.length}</div><div className="text-xs text-blue-100">{t.supportedLanguages}</div></div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center bg-white/10 rounded-lg p-3"><div className="text-lg font-bold">{languages.reduce((sum, lang) => sum + lang.speakers, 0).toLocaleString()}</div><div className="text-xs text-blue-100">{t.totalSpeakers}</div></div>
            <div className="text-center bg-white/10 rounded-lg p-3"><div className="text-lg font-bold">{languages.filter(l => l.status === "available").length}</div><div className="text-xs text-blue-100">{t.activeLanguages}</div></div>
            <div className="text-center bg-white/10 rounded-lg p-3"><div className="text-lg font-bold">{languages.filter(l => l.status === "beta").length}</div><div className="text-xs text-blue-100">{t.inBeta}</div></div>
            <div className="text-center bg-white/10 rounded-lg p-3"><div className="text-lg font-bold">{Math.round(languages.reduce((sum, lang) => sum + lang.completeness, 0) / languages.length)}%</div><div className="text-xs text-blue-100">{t.averageCompleteness}</div></div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="languages" className="gap-2"><Globe className="h-4 w-4" />Langues</TabsTrigger>
          <TabsTrigger value="settings" className="gap-2"><Settings className="h-4 w-4" />Paramètres</TabsTrigger>
          <TabsTrigger value="contribute" className="gap-2"><Heart className="h-4 w-4" />Contribuer</TabsTrigger>
          <TabsTrigger value="download" className="gap-2"><Download className="h-4 w-4" />Hors ligne</TabsTrigger>
        </TabsList>

        {/* Onglet Langues */}
        <TabsContent value="languages" className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" /><Input placeholder={t.searchPlaceholder} className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}><SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger><SelectContent>{regions.map((region) => (<SelectItem key={region.id} value={region.id}><div className="flex items-center gap-2"><region.icon className="h-4 w-4" /><span>{region.name}</span><Badge variant="secondary" className="ml-auto">{region.count}</Badge></div></SelectItem>))}</SelectContent></Select>
          </div>

          {/* Langue actuelle */}
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-blue-700"><CheckCircle className="h-5 w-5" />{t.currentLanguage}</CardTitle></CardHeader>
            <CardContent><div className="flex items-center justify-between flex-wrap gap-4"><div className="flex items-center gap-4"><span className="text-4xl">{currentLang.flag}</span><div><h3 className="font-bold text-xl">{currentLang.name}</h3><p className="text-gray-600">{currentLang.nativeName}</p><div className="flex items-center gap-3 text-sm text-gray-500 mt-1"><span>👥 {currentLang.speakers.toLocaleString()} {t.speakers}</span><span>📊 {currentLang.completeness}% {t.complete}</span></div></div></div><div className="text-right"><Badge className={getStatusColor(currentLang.status)}>{getStatusText(currentLang.status)}</Badge><div className="flex items-center gap-1 text-sm text-gray-500 mt-2"><Users className="h-3 w-3" /><span>{currentLang.contributors} {t.contributors}</span></div></div></div></CardContent>
          </Card>

          {/* Liste des langues */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLanguages.map((language) => (
              <Card key={language.code} className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${language.code === uiLanguage ? "ring-2 ring-blue-500 bg-blue-50" : ""}`} onClick={() => handleLanguageChange(language.code)}>
                <CardContent className="p-4"><div className="flex items-start justify-between mb-3"><div className="flex items-center gap-3"><span className="text-3xl">{language.flag}</span><div><div className="flex items-center gap-1"><h3 className="font-semibold">{language.name}</h3>{language.completeness >= 95 && <Star className="h-3 w-3 text-yellow-500 fill-current" />}</div><p className="text-xs text-gray-500">{language.nativeName}</p></div></div><Badge className={getStatusColor(language.status)}>{getStatusText(language.status)}</Badge></div>
                  <div className="space-y-2"><div className="flex justify-between text-sm"><span className="text-gray-500">👥 Locuteurs:</span><span className="font-medium">{language.speakers.toLocaleString()}</span></div><div className="flex justify-between text-sm"><span className="text-gray-500">📍 Région:</span><span className="font-medium">{language.region === "West Africa" ? "🌍 Afrique de l'Ouest" : language.region}</span></div><div className="flex justify-between text-sm"><span className="text-gray-500">📊 Complétude:</span><span className="font-medium">{language.completeness}%</span></div><Progress value={language.completeness} className="h-2" /><div className="flex justify-between text-xs text-gray-400 pt-1"><div className="flex items-center gap-1"><Users className="h-3 w-3" /><span>{language.contributors} contributeurs</span></div>{language.code === uiLanguage && <div className="flex items-center gap-1 text-blue-600"><CheckCircle className="h-3 w-3" /><span>{t.current}</span></div>}</div></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Onglet Paramètres */}
        <TabsContent value="settings" className="mt-6 space-y-4">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />{t.languageSettings}</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3 p-3 border rounded-lg"><div><h4 className="font-medium">{t.autoDetection}</h4><p className="text-sm text-gray-500">{t.autoDetectionDesc}</p></div><Switch checked={autoDetection} onCheckedChange={setAutoDetection} /></div>
              <div className="flex items-center justify-between flex-wrap gap-3 p-3 border rounded-lg"><div><h4 className="font-medium">{t.autoTranslation}</h4><p className="text-sm text-gray-500">{t.autoTranslationDesc}</p></div><Switch checked={autoTranslation} onCheckedChange={setAutoTranslation} /></div>
              <div className="flex items-center justify-between flex-wrap gap-3 p-3 border rounded-lg"><div><h4 className="font-medium">{t.textToSpeech}</h4><p className="text-sm text-gray-500">{t.textToSpeechDesc}</p></div><Switch checked={textToSpeech} onCheckedChange={setTextToSpeech} /></div>
              <div className="flex items-center justify-between flex-wrap gap-3 p-3 border rounded-lg"><div><h4 className="font-medium">{t.dateFormat}</h4><p className="text-sm text-gray-500">DD/MM/YYYY</p></div><Select defaultValue="dd/mm/yyyy"><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem><SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem><SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem></SelectContent></Select></div>
              <div className="flex items-center justify-between flex-wrap gap-3 p-3 border rounded-lg"><div><h4 className="font-medium">{t.numberFormat}</h4><p className="text-sm text-gray-500">1 234,56</p></div><Select defaultValue="comma"><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="comma">1 234,56</SelectItem><SelectItem value="dot">1,234.56</SelectItem><SelectItem value="space">1 234.56</SelectItem></SelectContent></Select></div>
            </CardContent>
          </Card>

          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-500" />Classement des traducteurs</CardTitle></CardHeader>
            <CardContent><div className="space-y-3">{topContributors.map((c) => (<div key={c.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${c.rank === 1 ? "bg-yellow-500" : c.rank === 2 ? "bg-gray-400" : "bg-orange-500"} text-white font-bold`}>{c.rank}</div><div><p className="font-medium">{c.name}</p><p className="text-xs text-gray-500">{c.translations} traductions • {c.languages} langues</p></div></div><div className="text-2xl">{c.avatar}</div></div>))}</div></CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Contribuer */}
        <TabsContent value="contribute" className="mt-6 space-y-4">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-red-500" />{t.contribute}</CardTitle></CardHeader>
            <CardContent className="space-y-4"><p className="text-gray-600">{t.contributeDesc}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg hover:shadow-md transition-all"><div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><BookOpen className="h-5 w-5 text-green-600" /></div><h4 className="font-semibold">{t.volunteerTranslator}</h4></div><p className="text-sm text-gray-600 mb-3">{t.volunteerTranslatorDesc}</p><Button size="sm" className="w-full gap-2"><Heart className="h-4 w-4" />{t.becomeTranslator}</Button></div>
                <div className="p-4 border rounded-lg hover:shadow-md transition-all"><div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><Award className="h-5 w-5 text-blue-600" /></div><h4 className="font-semibold">{t.languageReviewer}</h4></div><p className="text-sm text-gray-600 mb-3">{t.languageReviewerDesc}</p><Button size="sm" variant="outline" className="w-full gap-2"><CheckCircle className="h-4 w-4" />{t.becomeReviewer}</Button></div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg"><h4 className="font-semibold mb-3 flex items-center gap-2"><Target className="h-4 w-4 text-yellow-600" />{t.priorityLanguages}</h4><div className="flex flex-wrap gap-2">{languages.filter(l => l.status === "coming-soon" || l.completeness < 80).map(lang => (<Badge key={lang.code} variant="outline" className="gap-1 py-1.5"><span>{lang.flag}</span><span>{lang.name}</span><span className="text-gray-400">({lang.completeness}%)</span></Badge>))}</div></div>
              <div><h4 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4" />{t.translationProgress}</h4><div className="space-y-2">{languages.slice(0, 5).map(lang => (<div key={lang.code} className="flex items-center gap-3"><span className="text-xl">{lang.flag}</span><span className="text-sm w-20">{lang.name}</span><div className="flex-1"><Progress value={lang.completeness} className="h-2" /></div><span className="text-sm text-gray-500 w-12">{lang.completeness}%</span></div>))}</div></div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Téléchargement */}
        <TabsContent value="download" className="mt-6 space-y-4">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Download className="h-5 w-5 text-blue-600" />{t.offlinePacks}</CardTitle></CardHeader>
            <CardContent className="space-y-4"><p className="text-gray-600">{t.offlinePacksDesc}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {languages.filter(l => l.status === "available" || l.status === "beta").map(language => {
                  const isDownloaded = isLanguageDownloaded(language.code)
                  const isDownloading = downloadingLang === language.code
                  return (<div key={language.code} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-all"><div className="flex items-center gap-3"><span className="text-2xl">{language.flag}</span><div><p className="font-medium text-sm">{language.name}</p><p className="text-xs text-gray-500">{language.fileSize}</p></div></div>{isDownloaded ? <Button size="sm" variant="outline" className="gap-1 text-red-600 hover:text-red-700" onClick={() => handleRemoveLanguage(language.code)}><X className="h-3 w-3" />{t.remove}</Button> : <Button size="sm" variant="outline" className="gap-1" onClick={() => handleDownloadLanguage(language)} disabled={isDownloading || !isOnline}>{isDownloading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}{isDownloading ? t.loading : t.download}</Button>}</div>)
                })}
              </div>
              <div className="bg-blue-50 p-4 rounded-lg"><div className="flex items-start gap-3"><Smartphone className="h-5 w-5 text-blue-600 mt-0.5" /><div><p className="text-sm font-medium text-blue-800">{t.offlineInfo}</p><p className="text-xs text-blue-600 mt-1">Téléchargés: {downloadedLanguages.length}/{languages.filter(l => l.status === "available" || l.status === "beta").length}</p></div></div></div>
              <div className="bg-green-50 p-4 rounded-lg"><div className="flex items-start gap-3"><Zap className="h-5 w-5 text-green-600 mt-0.5" /><div><p className="text-sm font-medium text-green-800">Mode économique</p><p className="text-xs text-green-600 mt-1">Téléchargez uniquement les langues que vous utilisez fréquemment</p></div></div></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}