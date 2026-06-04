"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  Home,
  MessageSquare,
  User,
  Wallet,
  Settings,
  Globe,
  Users,
  Briefcase,
  Bell,
  Search,
  Menu,
  X,
  MapPin,
  BarChart3,
  Loader2,
  Wifi,
  WifiOff,
  Pi,
  CheckCircle,
  Sparkles,
  Leaf,
  TrendingUp,
  Calendar,
  Clock,
  Star,
  ChevronRight,
  Flower2,
  Sun,
  Moon,
  Cloud,
  Droplets,
  Wind,
  AlertCircle,
  Shield,
} from "lucide-react"

import Dashboard from "@/components/dashboard"
import MobileNavigation from "@/components/mobile-navigation"
import AvicultureManagement from "@/components/aviculture-management"
import UserProfile from "@/components/user-profile"
import PiWalletIntegration from "@/components/pi-wallet-integration"
import MessagingSystem from "@/components/messaging-system"
import ServiceManagement from "@/components/service-management"
import RegionalAdaptation from "@/components/regional-adaptation"
import GeolocationManager from "@/components/geolocation-manager"
import { LanguageSelector } from "@/components/LanguageSelector"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { showToast } from "@/lib/utils"

// Composant UserIcon pour les statistiques
const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

export default function AgroMulticenterApp() {
  const { isAuthenticated, isLoading, login, userData, error } = usePiAuth()
  const isOnline = useOnlineStatus()
  
  const [activeTab, setActiveTab] = useState("home")
  const [currentLanguage, setCurrentLanguage] = useState("fr")
  const [userRegion, setUserRegion] = useState("Burkina Faso")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [greeting, setGreeting] = useState("")
  const [notificationCount] = useState(3)
  const [unreadMessages] = useState(2)

  // Paramètres utilisateur avec persistance localStorage
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage("notificationsEnabled", true)
  const [darkMode, setDarkMode] = useLocalStorage("darkMode", false)
  const [autoSync, setAutoSync] = useLocalStorage("autoSync", true)

  const [registrationData, setRegistrationData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    region: "",
    city: "",
    profession: "",
    specialties: [] as string[],
    languages: [] as string[],
    piWalletAddress: "",
    latitude: null as number | null,
    longitude: null as number | null,
  })

  // Mettre à jour l'heure et le message de bienvenue
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Bon matin")
    else if (hour < 18) setGreeting("Bon après-midi")
    else setGreeting("Bonsoir")
    return () => clearInterval(timer)
  }, [])

  // Appliquer le mode sombre
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const worldCountries = [
    { name: "Burkina Faso", code: "BF", flag: "🇧🇫", continent: "Africa" },
    { name: "Mali", code: "ML", flag: "🇲🇱", continent: "Africa" },
    { name: "Niger", code: "NE", flag: "🇳🇪", continent: "Africa" },
    { name: "Sénégal", code: "SN", flag: "🇸🇳", continent: "Africa" },
    { name: "Côte d'Ivoire", code: "CI", flag: "🇨🇮", continent: "Africa" },
    { name: "Ghana", code: "GH", flag: "🇬🇭", continent: "Africa" },
    { name: "Nigeria", code: "NG", flag: "🇳🇬", continent: "Africa" },
    { name: "France", code: "FR", flag: "🇫🇷", continent: "Europe" },
  ]

  const professions = [
    "Agriculteur", "Éleveur", "Vétérinaire", "Agronome",
    "Transformateur agricole", "Commerçant agricole", "Consultant agricole",
    "Formateur", "Chercheur", "Coopérative", "ONG", "Autre",
  ]

  const specialties = [
    "Aviculture", "Bovins", "Ovins/Caprins", "Pisciculture", "Apiculture",
    "Maraîchage", "Céréales", "Légumineuses", "Fruits", "Transformation",
    "Marketing", "Finance agricole",
  ]

  const availableLanguages = ["Français", "English", "Português", "Dioula", "Mooré", "Haoussa"]

  const handleRegistration = async () => {
    if (!registrationData.firstName || !registrationData.country) {
      showToast("Veuillez remplir les champs obligatoires", "error")
      return
    }
    
    setRegistrationSuccess(true)
    setTimeout(async () => {
      setShowRegistration(false)
      setRegistrationSuccess(false)
      setUserRegion(registrationData.country)
      await login()
    }, 1500)
  }

  const navigationItems = [
    { id: "home", label: "Accueil", icon: Home, color: "text-green-500", bg: "bg-green-50" },
    { id: "aviculture", label: "Aviculture", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "services", label: "Services", icon: Briefcase, color: "text-purple-500", bg: "bg-purple-50" },
    { id: "messages", label: "Messages", icon: MessageSquare, color: "text-cyan-500", bg: "bg-cyan-50" },
    { id: "wallet", label: "Portefeuille", icon: Wallet, color: "text-yellow-500", bg: "bg-yellow-50" },
    { id: "profile", label: "Profil", icon: User, color: "text-orange-500", bg: "bg-orange-50" },
    { id: "regional", label: "Régions", icon: Globe, color: "text-emerald-500", bg: "bg-emerald-50" },
    { id: "geolocation", label: "Géolocalisation", icon: MapPin, color: "text-indigo-500", bg: "bg-indigo-50" },
    { id: "settings", label: "Paramètres", icon: Settings, color: "text-gray-500", bg: "bg-gray-50" },
  ]

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  // Écran de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
              <span className="text-4xl text-white">🌾</span>
            </div>
            <div className="absolute -top-2 -right-2 w-7 h-7 bg-yellow-500 rounded-full flex items-center justify-center text-sm font-bold text-white animate-bounce">
              π
            </div>
            <div className="absolute -bottom-2 -left-2 w-5 h-5 bg-green-400 rounded-full animate-ping" />
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Chargement de votre espace agricole...</p>
          <div className="flex justify-center gap-1 mt-4">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Écran de connexion
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <span className="text-4xl text-white">🌾</span>
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-yellow-500 rounded-full flex items-center justify-center text-sm font-bold text-white animate-bounce">
                π
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent mt-4">
              AGRO MULTICENTER HINOS
            </h1>
            <p className="text-gray-500 text-sm mt-1">Plateforme agricole connectée</p>
          </div>

          <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardContent className="p-6 relative z-10">
              {!isOnline && (
                <div className="mb-4 p-3 bg-yellow-50 rounded-xl flex items-center gap-2 text-sm text-yellow-700">
                  <WifiOff className="h-4 w-4" />
                  <span>Connexion internet requise</span>
                </div>
              )}
              
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-6 rounded-xl gap-3 text-lg font-semibold shadow-lg"
                onClick={login}
                disabled={!isOnline}
              >
                <Pi className="h-6 w-6" />
                S'inscrire / Se connecter avec Pi
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-400">ou</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full border-2 border-green-200 text-green-600 hover:bg-green-50 py-6 rounded-xl gap-2 text-base font-medium"
                onClick={() => setShowRegistration(true)}
              >
                <Sparkles className="h-5 w-5" />
                Créer un compte gratuit
              </Button>

              {error && (
                <div className="mt-4 p-3 bg-red-50 rounded-xl flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex justify-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Shield className="h-3 w-3" />Sécurisé</span>
                  <span className="flex items-center gap-1"><Leaf className="h-3 w-3" />Agricole</span>
                  <span className="flex items-center gap-1"><Globe className="h-3 w-3" />Multilingue</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-[10px] text-gray-400 mt-6">
            En continuant, vous acceptez nos conditions d'utilisation
          </p>
        </div>

        {/* Dialog d'inscription */}
        <Dialog open={showRegistration} onOpenChange={(open) => {
          if (!open) setRegistrationSuccess(false)
          setShowRegistration(open)
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-green-500" />
                Rejoignez la communauté
              </DialogTitle>
              <p className="text-sm text-gray-500">Remplissez ces informations pour commencer</p>
            </DialogHeader>
            
            {registrationSuccess ? (
              <div className="py-12 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-700">Inscription réussie !</h3>
                <p className="text-gray-500 mt-2">Redirection vers votre espace...</p>
                <Loader2 className="h-6 w-6 animate-spin text-green-600 mx-auto mt-4" />
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Prénom *</Label><Input placeholder="Votre prénom" value={registrationData.firstName} onChange={(e) => setRegistrationData({ ...registrationData, firstName: e.target.value })} /></div>
                  <div><Label>Nom</Label><Input placeholder="Votre nom" value={registrationData.lastName} onChange={(e) => setRegistrationData({ ...registrationData, lastName: e.target.value })} /></div>
                </div>
                <div><Label>Email</Label><Input type="email" placeholder="votre@email.com" value={registrationData.email} onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })} /></div>
                <div><Label>Téléphone</Label><Input placeholder="+226 XX XX XX XX" value={registrationData.phone} onChange={(e) => setRegistrationData({ ...registrationData, phone: e.target.value })} /></div>
                <div><Label>Pays *</Label><Select value={registrationData.country} onValueChange={(value) => setRegistrationData({ ...registrationData, country: value })}><SelectTrigger><SelectValue placeholder="Sélectionnez votre pays" /></SelectTrigger><SelectContent>{worldCountries.map((c) => (<SelectItem key={c.code} value={c.name}><span className="flex items-center gap-2"><span>{c.flag}</span><span>{c.name}</span></span></SelectItem>))}</SelectContent></Select></div>
                <div className="grid grid-cols-2 gap-4"><div><Label>Région</Label><Input placeholder="Votre région" value={registrationData.region} onChange={(e) => setRegistrationData({ ...registrationData, region: e.target.value })} /></div><div><Label>Ville</Label><Input placeholder="Votre ville" value={registrationData.city} onChange={(e) => setRegistrationData({ ...registrationData, city: e.target.value })} /></div></div>
                <div><Label>Profession</Label><Select value={registrationData.profession} onValueChange={(value) => setRegistrationData({ ...registrationData, profession: value })}><SelectTrigger><SelectValue placeholder="Sélectionnez votre profession" /></SelectTrigger><SelectContent>{professions.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent></Select></div>
                <div><Label>Spécialités</Label><div className="grid grid-cols-2 gap-2 mt-2">{specialties.slice(0, 8).map((s) => (<label key={s} className="flex items-center gap-2 p-2 rounded-lg border hover:bg-gray-50 cursor-pointer"><input type="checkbox" checked={registrationData.specialties.includes(s)} onChange={(e) => { if (e.target.checked) setRegistrationData({ ...registrationData, specialties: [...registrationData.specialties, s] }); else setRegistrationData({ ...registrationData, specialties: registrationData.specialties.filter(sp => sp !== s) }) }} className="rounded border-gray-300" /><span className="text-sm">{s}</span></label>))}</div></div>
                <div><Label>Langues</Label><div className="grid grid-cols-2 gap-2 mt-2">{availableLanguages.map((l) => (<label key={l} className="flex items-center gap-2 p-2 rounded-lg border hover:bg-gray-50 cursor-pointer"><input type="checkbox" checked={registrationData.languages.includes(l)} onChange={(e) => { if (e.target.checked) setRegistrationData({ ...registrationData, languages: [...registrationData.languages, l] }); else setRegistrationData({ ...registrationData, languages: registrationData.languages.filter(lg => lg !== l) }) }} className="rounded border-gray-300" /><span className="text-sm">{l}</span></label>))}</div></div>
                <div><Label>Adresse Portefeuille Pi</Label><Input placeholder="Votre adresse Pi Network" value={registrationData.piWalletAddress} onChange={(e) => setRegistrationData({ ...registrationData, piWalletAddress: e.target.value })} /></div>
                <Button onClick={handleRegistration} className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 py-6 rounded-xl text-lg font-semibold">Créer mon compte</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b dark:border-gray-700 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white text-sm">🌾</span>
            </div>
            <div>
              <h1 className="font-bold text-green-800 dark:text-green-400 text-sm">AGRO MC</h1>
              <p className="text-[9px] text-gray-400">HINOS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline && <WifiOff className="h-4 w-4 text-yellow-500" />}
            <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
              <Clock className="h-3 w-3" />
              {formatTime(currentTime)}
            </div>
            {unreadMessages > 0 && (
              <div className="relative">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-[7px] text-white flex items-center justify-center">
                  {unreadMessages}
                </span>
              </div>
            )}
            <LanguageSelector 
              currentLanguage={currentLanguage} 
              onLanguageChange={setCurrentLanguage} 
              variant="minimal"
            />
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)} className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className={`${isMenuOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-900 border-r dark:border-gray-800 shadow-xl transition-transform duration-300 flex flex-col h-full`}>
            {/* Sidebar Header */}
            <div className="p-6 border-b bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white text-2xl">🌾</span>
                </div>
                <div>
                  <h1 className="font-bold text-green-800 dark:text-green-400 text-lg">AGRO MULTICENTER</h1>
                  <p className="text-xs text-gray-500">HINOS</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm font-semibold">
                      {userData?.username?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{userData?.username?.split(" ")[0] || "Agriculteur"}</p>
                    <p className="text-[10px] text-gray-400">Membre</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow-sm">
                  <Leaf className="h-3 w-3 text-green-500" />
                  <span>Bio</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsMenuOpen(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                      isActive 
                        ? "bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 text-green-700 dark:text-green-400 shadow-sm" 
                        : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg transition-all ${isActive ? item.bg : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"}`}>
                      <Icon className={`h-4 w-4 ${isActive ? item.color : "text-gray-500 dark:text-gray-500"}`} />
                    </div>
                    <span className={`text-sm font-medium flex-1 text-left ${isActive ? "text-green-700 dark:text-green-400" : ""}`}>{item.label}</span>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                  </button>
                )
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t dark:border-gray-800">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-green-100">📍 Position actuelle</p>
                      <p className="text-sm font-semibold flex items-center gap-1">{userRegion} <MapPin className="h-3 w-3" /></p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-green-100">
                      {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                      {isOnline ? "En ligne" : "Hors ligne"}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-green-100">
                    <Sun className="h-3 w-3" />
                    <span>32°C • Ensoleillé</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:ml-0 pb-20 lg:pb-6 min-h-screen">
            {/* Header Desktop */}
            <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b dark:border-gray-800 hidden lg:block">
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-blue-700 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent">
                    {navigationItems.find((item) => item.id === activeTab)?.label}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {greeting}, {userData?.username?.split(" ")[0] || "Agriculteur"} 👋
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {!isOnline && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-300 gap-1">
                      <WifiOff className="h-3 w-3" /> Hors ligne
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" className="gap-2 rounded-xl relative">
                    <Bell className="h-4 w-4" />
                    <span className="hidden sm:inline">Notifications</span>
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center">
                        {notificationCount}
                      </span>
                    )}
                  </Button>
                  <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    {formatTime(currentTime)}
                  </div>
                  <LanguageSelector 
                    currentLanguage={currentLanguage} 
                    onLanguageChange={setCurrentLanguage} 
                    variant="default"
                  />
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4 lg:p-6">
              <div className="space-y-6">
                {activeTab === "home" && <Dashboard currentLanguage={currentLanguage} userRegion={userRegion} onTabChange={setActiveTab} />}
                {activeTab === "aviculture" && <AvicultureManagement currentLanguage={currentLanguage} userRegion={userRegion} />}
                {activeTab === "services" && <ServiceManagement currentLanguage={currentLanguage} userRegion={userRegion} />}
                {activeTab === "messages" && <MessagingSystem currentLanguage={currentLanguage} userRegion={userRegion} />}
                {activeTab === "wallet" && <PiWalletIntegration currentLanguage={currentLanguage} userRegion={userRegion} />}
                {activeTab === "profile" && <UserProfile currentLanguage={currentLanguage} userRegion={userRegion} />}
                {activeTab === "regional" && <RegionalAdaptation currentLanguage={currentLanguage} userRegion={userRegion} onRegionChange={setUserRegion} />}
                {activeTab === "geolocation" && <GeolocationManager currentLanguage={currentLanguage} userRegion={userRegion} />}
                {activeTab === "settings" && (
                  <Card className="border-0 shadow-sm dark:bg-gray-900">
                    <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                      <CardTitle className="flex items-center gap-2 text-xl dark:text-gray-100">
                        <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        Paramètres
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      {/* Notifications push */}
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                        <div>
                          <h4 className="font-medium dark:text-gray-200">Notifications push</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Recevoir les alertes et rappels</p>
                        </div>
                        <Switch
                          checked={notificationsEnabled}
                          onCheckedChange={setNotificationsEnabled}
                        />
                      </div>

                      {/* Mode sombre */}
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                        <div>
                          <h4 className="font-medium dark:text-gray-200">Mode sombre</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Adapter l'affichage à vos préférences</p>
                        </div>
                        <Switch
                          checked={darkMode}
                          onCheckedChange={setDarkMode}
                        />
                      </div>

                      {/* Synchronisation automatique */}
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                        <div>
                          <h4 className="font-medium dark:text-gray-200">Synchronisation automatique</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Synchroniser vos données en arrière-plan</p>
                        </div>
                        <Switch
                          checked={autoSync}
                          onCheckedChange={setAutoSync}
                        />
                      </div>

                      {/* Paiements Pi Network */}
                      <div className="flex items-center justify-between p-4 rounded-xl bg-purple-50 dark:bg-purple-900/30">
                        <div>
                          <h4 className="font-medium dark:text-gray-200">Paiements Pi Network</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Toutes les transactions en Pi</p>
                        </div>
                        <Badge className="bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300">Actif</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobileNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
          unreadCount={unreadMessages}
          notificationCount={notificationCount}
          currentLanguage={currentLanguage}
        />
      </div>
    </div>
  )
}