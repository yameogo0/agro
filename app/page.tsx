"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
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
} from "lucide-react"

import Dashboard from "@/components/dashboard"
import MobileNavigation from "@/components/mobile-navigation"
import AvicultureManagement from "@/components/aviculture-management"
import UserProfile from "@/components/user-profile"
import PiWalletIntegration from "@/components/pi-wallet-integration"
import MessagingSystem from "@/components/messaging-system"
import ServiceManagement from "@/components/service-management"
import RegionalAdaptation from "@/components/regional-adaptation"
import LanguageManager from "@/components/language-manager"
import GeolocationManager from "@/components/geolocation-manager"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { showToast } from "@/lib/utils"

export default function AgroMulticenterApp() {
  const { isAuthenticated, isLoading, login, userData, error } = usePiAuth()
  const isOnline = useOnlineStatus()
  
  const [activeTab, setActiveTab] = useState("home")
  const [currentLanguage, setCurrentLanguage] = useState("fr")
  const [userRegion, setUserRegion] = useState("Burkina Faso")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

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
    { id: "home", label: "Accueil", icon: Home },
    { id: "aviculture", label: "Aviculture", icon: Users },
    { id: "services", label: "Services", icon: Briefcase },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "wallet", label: "Portefeuille π", icon: Wallet },
    { id: "profile", label: "Profil", icon: User },
    { id: "regional", label: "Régions", icon: Globe },
    { id: "geolocation", label: "Géolocalisation", icon: MapPin },
    { id: "settings", label: "Paramètres", icon: Settings },
  ]

  // Écran de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-3xl text-white animate-pulse">🌾</span>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce">
              π
            </div>
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  // Écran de connexion
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl text-white">🌾</span>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent">
              AGRO MULTICENTER HINOS
            </CardTitle>
            <p className="text-gray-500 mt-1">Plateforme agricole connectée</p>
            {!isOnline && (
              <div className="mt-2 text-xs text-yellow-600 bg-yellow-50 rounded-lg p-2">
                ⚠️ Connexion internet requise
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700 gap-2" 
              onClick={login}
              disabled={!isOnline}
            >
              <Pi className="h-4 w-4" />
              Se connecter avec Pi Network
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-green-500 text-green-600 hover:bg-green-50" 
              onClick={() => setShowRegistration(true)}
            >
              ✨ Créer un compte
            </Button>
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          </CardContent>
        </Card>

        {/* Dialog d'inscription */}
        <Dialog open={showRegistration} onOpenChange={(open) => {
          if (!open) setRegistrationSuccess(false)
          setShowRegistration(open)
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">✨ Inscription à Agro Multicenter Hinos</DialogTitle>
              <p className="text-sm text-gray-500">Rejoignez la communauté agricole</p>
            </DialogHeader>
            
            {registrationSuccess ? (
              <div className="py-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-green-700">Inscription réussie !</h3>
                <p className="text-gray-500 mt-1">Redirection en cours...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Prénom *</Label><Input value={registrationData.firstName} onChange={(e) => setRegistrationData({ ...registrationData, firstName: e.target.value })} /></div>
                  <div><Label>Nom</Label><Input value={registrationData.lastName} onChange={(e) => setRegistrationData({ ...registrationData, lastName: e.target.value })} /></div>
                </div>
                <div><Label>Email</Label><Input type="email" value={registrationData.email} onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })} /></div>
                <div><Label>Téléphone</Label><Input value={registrationData.phone} onChange={(e) => setRegistrationData({ ...registrationData, phone: e.target.value })} /></div>
                <div><Label>Pays *</Label><Select value={registrationData.country} onValueChange={(value) => setRegistrationData({ ...registrationData, country: value })}><SelectTrigger><SelectValue placeholder="Sélectionnez votre pays" /></SelectTrigger><SelectContent>{worldCountries.map((c) => (<SelectItem key={c.code} value={c.name}><span className="flex items-center gap-2"><span>{c.flag}</span><span>{c.name}</span></span></SelectItem>))}</SelectContent></Select></div>
                <div className="grid grid-cols-2 gap-4"><div><Label>Région</Label><Input value={registrationData.region} onChange={(e) => setRegistrationData({ ...registrationData, region: e.target.value })} /></div><div><Label>Ville</Label><Input value={registrationData.city} onChange={(e) => setRegistrationData({ ...registrationData, city: e.target.value })} /></div></div>
                <div><Label>Profession</Label><Select value={registrationData.profession} onValueChange={(value) => setRegistrationData({ ...registrationData, profession: value })}><SelectTrigger><SelectValue placeholder="Sélectionnez votre profession" /></SelectTrigger><SelectContent>{professions.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent></Select></div>
                <div><Label>Spécialités</Label><div className="grid grid-cols-2 gap-2 mt-2">{specialties.slice(0, 8).map((s) => (<label key={s} className="flex items-center gap-2"><input type="checkbox" checked={registrationData.specialties.includes(s)} onChange={(e) => { if (e.target.checked) setRegistrationData({ ...registrationData, specialties: [...registrationData.specialties, s] }); else setRegistrationData({ ...registrationData, specialties: registrationData.specialties.filter(sp => sp !== s) }) }} className="rounded border-gray-300" /><span className="text-sm">{s}</span></label>))}</div></div>
                <div><Label>Langues</Label><div className="grid grid-cols-2 gap-2 mt-2">{availableLanguages.map((l) => (<label key={l} className="flex items-center gap-2"><input type="checkbox" checked={registrationData.languages.includes(l)} onChange={(e) => { if (e.target.checked) setRegistrationData({ ...registrationData, languages: [...registrationData.languages, l] }); else setRegistrationData({ ...registrationData, languages: registrationData.languages.filter(lg => lg !== l) }) }} className="rounded border-gray-300" /><span className="text-sm">{l}</span></label>))}</div></div>
                <div><Label>Adresse Portefeuille Pi</Label><Input placeholder="Votre adresse Pi Network" value={registrationData.piWalletAddress} onChange={(e) => setRegistrationData({ ...registrationData, piWalletAddress: e.target.value })} /></div>
                <Button onClick={handleRegistration} className="w-full bg-green-600 hover:bg-green-700">Créer mon compte</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center"><span className="text-white text-sm">🌾</span></div>
          <h1 className="font-bold text-lg text-green-800">AGRO MC HINOS</h1>
        </div>
        <div className="flex items-center gap-2">
          {!isOnline && <WifiOff className="h-4 w-4 text-yellow-500" />}
          <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${isMenuOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-lg transition-transform duration-300`}>
          <div className="p-5 border-b bg-gradient-to-r from-green-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center"><span className="text-white text-xl">🌾</span></div>
              <div><h1 className="font-bold text-green-800">AGRO MULTICENTER</h1><p className="text-xs text-gray-500">HINOS</p></div>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100"><p className="text-xs text-gray-500">👋 {userData?.username || "Agriculteur"}</p></div>
          </div>

          <nav className="p-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id || (item.id === "marketplace" && ["services"].includes(activeTab))
              return (
                <Button key={item.id} variant={isActive ? "default" : "ghost"} className={`w-full justify-start ${isActive ? "bg-green-600 hover:bg-green-700" : "hover:bg-green-50"}`} onClick={() => { setActiveTab(item.id); setIsMenuOpen(false) }}>
                  <Icon className="h-4 w-4 mr-3" /> {item.label}
                </Button>
              )
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-3 rounded-xl shadow-md text-center">
              <p className="text-xs opacity-90">📍 Position</p>
              <p className="text-sm font-semibold">{userRegion}</p>
              {!isOnline && <WifiOff className="h-3 w-3 mx-auto mt-1 opacity-70" />}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0 pb-20 lg:pb-6">
          <div className="p-4 lg:p-6">
            {/* Header */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{navigationItems.find((item) => item.id === activeTab)?.label}</h2>
                <p className="text-gray-500">Bienvenue {userData?.username?.split(" ")[0] || "Agriculteur"} 👋</p>
              </div>
              <div className="flex items-center gap-3">
                {!isOnline && <Badge variant="outline" className="text-yellow-600 border-yellow-300 gap-1"><WifiOff className="h-3 w-3" />Hors ligne</Badge>}
                <Button variant="outline" size="sm" className="gap-2"><Bell className="h-4 w-4" />Notifications</Button>
                <LanguageManager currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} />
              </div>
            </div>

            {/* Tab Content */}
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
                <Card><CardHeader><CardTitle>Paramètres</CardTitle></CardHeader><CardContent className="space-y-4">
                  <div className="flex justify-between items-center"><div><h4 className="font-medium">Notifications push</h4><p className="text-sm text-gray-500">Recevoir les alertes</p></div><Button variant="outline" size="sm">Activé</Button></div>
                  <div className="flex justify-between items-center"><div><h4 className="font-medium">Mode sombre</h4><p className="text-sm text-gray-500">Thème sombre</p></div><Button variant="outline" size="sm">Désactivé</Button></div>
                  <div className="flex justify-between items-center"><div><h4 className="font-medium">Paiements Pi</h4><p className="text-sm text-gray-500">Tous les prix en π</p></div><Badge className="bg-purple-100 text-purple-700">Actif</Badge></div>
                </CardContent></Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} />
    </div>
  )
}