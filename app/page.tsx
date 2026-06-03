"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Home,
  MessageSquare,
  User,
  Wallet,
  Settings,
  Globe,
  Users,
  Briefcase,
  BarChart3,
  MapPin,
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

import LoginScreen from "@/components/auth/login-screen"
import RegistrationDialog from "@/components/auth/registration-dialog"
import Sidebar from "@/components/layout/sidebar"
import MobileHeader from "@/components/layout/mobile-header"
import MainHeader from "@/components/layout/main-header"

import type { RegistrationData, NavigationItem } from "@/lib/types/user"

export default function AgroMulticenterApp() {
  const [activeTab, setActiveTab] = useState("home")
  const [currentLanguage, setCurrentLanguage] = useState("fr")
  const [userRegion, setUserRegion] = useState("Burkina Faso")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(true)

  const navigationItems = useMemo<NavigationItem[]>(() => [
    { id: "home", label: "Accueil", icon: Home },
    { id: "aviculture", label: "Aviculture", icon: Users },
    { id: "services", label: "Services", icon: Briefcase },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "wallet", label: "Portefeuille π", icon: Wallet },
    { id: "profile", label: "Profil", icon: User },
    { id: "regional", label: "Régions", icon: Globe },
    { id: "geolocation", label: "Géolocalisation", icon: MapPin },
    { id: "analytics", label: "Analyses", icon: BarChart3 },
    { id: "settings", label: "Paramètres", icon: Settings },
  ], [])

  const handleRegistration = (data: RegistrationData) => {
    console.log("[v0] Registration data:", data)
    setIsLoggedIn(true)
    setShowRegistration(false)
    setUserRegion(data.country)
  }

  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen
          onLoginClick={() => setIsLoggedIn(true)}
          onRegisterClick={() => setShowRegistration(true)}
        />
        <RegistrationDialog
          open={showRegistration}
          onOpenChange={setShowRegistration}
          onRegistration={handleRegistration}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader isMenuOpen={isMenuOpen} onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} />

      <div className="flex">
        <Sidebar
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          navigationItems={navigationItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userRegion={userRegion}
        />

        <div className="flex-1 lg:ml-0">
          <div className="p-4 lg:p-6">
            <MainHeader
              activeTab={activeTab}
              navigationItems={navigationItems}
              currentLanguage={currentLanguage}
              onLanguageChange={setCurrentLanguage}
            />

            <div className="space-y-6">
              {activeTab === "home" && (
                <Dashboard currentLanguage={currentLanguage} userRegion={userRegion} onTabChange={setActiveTab} />
              )}

              {activeTab === "aviculture" && (
                <AvicultureManagement currentLanguage={currentLanguage} userRegion={userRegion} />
              )}

              {activeTab === "services" && (
                <ServiceManagement currentLanguage={currentLanguage} userRegion={userRegion} />
              )}

              {activeTab === "messages" && (
                <MessagingSystem currentLanguage={currentLanguage} userRegion={userRegion} />
              )}

              {activeTab === "wallet" && (
                <PiWalletIntegration currentLanguage={currentLanguage} userRegion={userRegion} />
              )}

              {activeTab === "profile" && <UserProfile currentLanguage={currentLanguage} userRegion={userRegion} />}

              {activeTab === "regional" && (
                <RegionalAdaptation
                  currentLanguage={currentLanguage}
                  userRegion={userRegion}
                  onRegionChange={setUserRegion}
                />
              )}

              {activeTab === "geolocation" && (
                <GeolocationManager currentLanguage={currentLanguage} userRegion={userRegion} />
              )}

              {activeTab === "analytics" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Analyses et Données</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-12">
                      <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Module d&apos;Analyses</h3>
                      <p className="text-gray-600 mb-4">
                        Visualisez vos données agricoles, analysez vos performances et optimisez vos rendements.
                      </p>
                      <Button>Accéder aux analyses</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "settings" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Paramètres de l&apos;application</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Notifications push</h4>
                          <p className="text-sm text-gray-500">Recevoir les notifications sur votre appareil</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Activé
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Mode sombre</h4>
                          <p className="text-sm text-gray-500">Utiliser le thème sombre</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Désactivé
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Synchronisation automatique</h4>
                          <p className="text-sm text-gray-500">Synchroniser automatiquement vos données</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Activé
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <MobileNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
      />
    </div>
  )
}
