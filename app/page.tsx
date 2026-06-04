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
  Menu,
  X,
  MapPin,
  Loader2,
  Wifi,
  WifiOff,
  Pi,
  CheckCircle,
  Sparkles,
  Leaf,
  Clock,
  AlertCircle,
  Shield,
  Sun,
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
import { useGeolocation } from "@/hooks/use-geolocation"
import { showToast } from "@/lib/utils"
import { initPiSDK } from "@/lib/pi-payments"

export default function AgroMulticenterApp() {
  const { isAuthenticated, isLoading, login, userData, error } = usePiAuth()
  const isOnline = useOnlineStatus()
  
  // ✅ Géolocalisation GPS réelle
  const { latitude, longitude, accuracy, loading: geoLoading, refresh: refreshGeo } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
  })
  
  const [activeTab, setActiveTab] = useState("home")
  const [currentLanguage, setCurrentLanguage] = useState("fr")
  const [userRegion, setUserRegion] = useState("Burkina Faso")
  const [gpsAddress, setGpsAddress] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [greeting, setGreeting] = useState("")
  const [notificationCount] = useState(3)
  const [unreadMessages] = useState(2)

  // Paramètres utilisateur
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage("notificationsEnabled", true)
  const [darkMode, setDarkMode] = useLocalStorage("darkMode", false)
  const [autoSync, setAutoSync] = useLocalStorage("autoSync", true)

  // ✅ Récupérer l'adresse réelle à partir des coordonnées GPS
  useEffect(() => {
    if (latitude && longitude) {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`)
        .then(res => res.json())
        .then(data => {
          const address = data.address || {}
          const country = address.country || "Position GPS"
          const state = address.state || address.region || ""
          const city = address.city || address.town || address.village || ""
          const regionName = state || country
          setUserRegion(regionName)
          setGpsAddress(`${city ? city + ", " : ""}${regionName}`)
        })
        .catch(() => {
          setUserRegion(`${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`)
          setGpsAddress("Position GPS")
        })
    }
  }, [latitude, longitude])

  // ✅ Initialiser le SDK Pi après connexion
  useEffect(() => {
    if (isAuthenticated && typeof window !== "undefined") {
      initPiSDK(true).catch(console.error)
    }
  }, [isAuthenticated])

  // Mettre à jour l'heure
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Bon matin")
    else if (hour < 18) setGreeting("Bon après-midi")
    else setGreeting("Bonsoir")
    return () => clearInterval(timer)
  }, [])

  // Mode sombre
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const [registrationData, setRegistrationData] = useState({
    firstName: "", lastName: "", email: "", phone: "", country: "", region: "", city: "",
    profession: "", specialties: [] as string[], languages: [] as string[], piWalletAddress: "",
    latitude: null as number | null, longitude: null as number | null,
  })

  const worldCountries = [
    { name: "Burkina Faso", code: "BF", flag: "🇧🇫" }, { name: "Mali", code: "ML", flag: "🇲🇱" },
    { name: "Niger", code: "NE", flag: "🇳🇪" }, { name: "Sénégal", code: "SN", flag: "🇸🇳" },
    { name: "Côte d'Ivoire", code: "CI", flag: "🇨🇮" }, { name: "Ghana", code: "GH", flag: "🇬🇭" },
    { name: "Nigeria", code: "NG", flag: "🇳🇬" }, { name: "France", code: "FR", flag: "🇫🇷" },
  ]

  const professions = ["Agriculteur", "Éleveur", "Vétérinaire", "Agronome", "Transformateur agricole", "Commerçant agricole", "Consultant agricole", "Formateur", "Chercheur", "Coopérative", "ONG", "Autre"]
  const specialties = ["Aviculture", "Bovins", "Ovins/Caprins", "Pisciculture", "Apiculture", "Maraîchage", "Céréales", "Légumineuses", "Fruits", "Transformation", "Marketing", "Finance agricole"]
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
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-500">Chargement...</p>
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
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <span className="text-4xl text-white">🌾</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent mt-4">
              AGRO MULTICENTER HINOS
            </h1>
            <p className="text-gray-500 text-sm mt-1">Plateforme agricole connectée</p>
          </div>

          <Card className="border-0 shadow-xl rounded-2xl">
            <CardContent className="p-6">
              {!isOnline && (
                <div className="mb-4 p-3 bg-yellow-50 rounded-xl flex items-center gap-2 text-sm text-yellow-700">
                  <WifiOff className="h-4 w-4" />
                  <span>Connexion internet requise</span>
                </div>
              )}
              
              <Button className="w-full bg-purple-600 hover:bg-purple-700 py-6 rounded-xl gap-3 text-lg font-semibold" onClick={login} disabled={!isOnline}>
                <Pi className="h-6 w-6" />
                Se connecter avec Pi
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-xs"><span className="px-2 bg-white text-gray-400">ou</span></div>
              </div>

              <Button variant="outline" className="w-full border-2 border-green-200 text-green-600 hover:bg-green-50 py-6 rounded-xl gap-2" onClick={() => setShowRegistration(true)}>
                <Sparkles className="h-5 w-5" />
                Créer un compte
              </Button>

              {error && (
                <div className="mt-4 p-3 bg-red-50 rounded-xl text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialog d'inscription - gardez votre code existant */}
        <Dialog open={showRegistration} onOpenChange={(open) => { if (!open) setRegistrationSuccess(false); setShowRegistration(open) }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Rejoignez la communauté</DialogTitle>
            </DialogHeader>
            {registrationSuccess ? (
              <div className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p>Inscription réussie ! Redirection...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Formulaire d'inscription - gardez votre code existant */}
                <Button onClick={handleRegistration} className="w-full">Créer mon compte</Button>
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
        <div className="lg:hidden sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm">🌾</span>
            </div>
            <div><h1 className="font-bold text-green-800 dark:text-green-400 text-sm">AGRO MC</h1><p className="text-[9px] text-gray-400">HINOS</p></div>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline && <WifiOff className="h-4 w-4 text-yellow-500" />}
            <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
              <Clock className="h-3 w-3" />{formatTime(currentTime)}
            </div>
            <LanguageSelector currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} variant="minimal" />
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)} className="h-8 w-8 p-0 rounded-full">
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className={`${isMenuOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-900 border-r shadow-xl transition-transform duration-300 flex flex-col h-full`}>
            <div className="p-6 border-b bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl">🌾</span>
                </div>
                <div><h1 className="font-bold text-green-800 dark:text-green-400 text-lg">AGRO MULTICENTER</h1><p className="text-xs text-gray-500">HINOS</p></div>
              </div>
              <div className="mt-4 pt-3 border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-100 text-green-700 text-sm font-semibold">
                      {userData?.username?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div><p className="text-sm font-medium">{userData?.username?.split(" ")[0] || "Agriculteur"}</p><p className="text-[10px] text-gray-400">Membre</p></div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
                  <Leaf className="h-3 w-3 text-green-500" /><span>Bio</span>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMenuOpen(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive ? "bg-gradient-to-r from-green-50 to-blue-50 text-green-700 shadow-sm" : "hover:bg-gray-50 text-gray-600"}`}>
                    <div className={`p-1.5 rounded-lg ${isActive ? item.bg : "bg-gray-100"}`}>
                      <Icon className={`h-4 w-4 ${isActive ? item.color : "text-gray-500"}`} />
                    </div>
                    <span className={`text-sm font-medium flex-1 text-left ${isActive ? "text-green-700" : ""}`}>{item.label}</span>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                  </button>
                )
              })}
            </nav>

            {/* Sidebar Footer avec position GPS réelle */}
            <div className="p-4 border-t">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-green-100">📍 Position actuelle</p>
                    <p className="text-sm font-semibold flex items-center gap-1">
                      {geoLoading ? "..." : (gpsAddress || userRegion)}
                      <MapPin className="h-3 w-3" />
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-green-100">
                    {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                    {isOnline ? "En ligne" : "Hors ligne"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:ml-0 pb-20 lg:pb-6 min-h-screen">
            <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b hidden lg:block">
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent">
                    {navigationItems.find((item) => item.id === activeTab)?.label}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">{greeting}, {userData?.username?.split(" ")[0] || "Agriculteur"} 👋</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />{formatTime(currentTime)}
                  </div>
                  <LanguageSelector currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} variant="default" />
                </div>
              </div>
            </div>

            <div className="p-4 lg:p-6">
              <div className="space-y-6">
                {activeTab === "home" && <Dashboard currentLanguage={currentLanguage} userRegion={gpsAddress || userRegion} onTabChange={setActiveTab} />}
                {activeTab === "aviculture" && <AvicultureManagement currentLanguage={currentLanguage} userRegion={gpsAddress || userRegion} />}
                {activeTab === "services" && <ServiceManagement currentLanguage={currentLanguage} userRegion={gpsAddress || userRegion} />}
                {activeTab === "messages" && <MessagingSystem currentLanguage={currentLanguage} userRegion={gpsAddress || userRegion} />}
                {activeTab === "wallet" && <PiWalletIntegration currentLanguage={currentLanguage} userRegion={gpsAddress || userRegion} />}
                {activeTab === "profile" && <UserProfile currentLanguage={currentLanguage} userRegion={gpsAddress || userRegion} />}
                {activeTab === "regional" && <RegionalAdaptation currentLanguage={currentLanguage} userRegion={userRegion} onRegionChange={setUserRegion} />}
                {activeTab === "geolocation" && <GeolocationManager currentLanguage={currentLanguage} userRegion={gpsAddress || userRegion} />}
                {activeTab === "settings" && (
                  <Card>
                    <CardHeader><CardTitle>Paramètres</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center"><div><h4 className="font-medium">Mode sombre</h4><p className="text-sm text-gray-500">Adapter l'affichage</p></div><Switch checked={darkMode} onCheckedChange={setDarkMode} /></div>
                      <div className="flex justify-between items-center"><div><h4 className="font-medium">Notifications push</h4><p className="text-sm text-gray-500">Recevoir les alertes</p></div><Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} /></div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>

        <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} unreadCount={unreadMessages} notificationCount={notificationCount} currentLanguage={currentLanguage} />
      </div>
    </div>
  )
}