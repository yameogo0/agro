"use client"

import { Button } from "@/components/ui/button"
import { Bell, Search } from "lucide-react"
import type { NavigationItem } from "@/lib/types/user"
import LanguageManager from "@/components/language-manager"

interface MainHeaderProps {
  activeTab: string
  navigationItems: NavigationItem[]
  currentLanguage: string
  onLanguageChange: (language: string) => void
}

export default function MainHeader({
  activeTab,
  navigationItems,
  currentLanguage,
  onLanguageChange,
}: MainHeaderProps) {
  const currentTabLabel = navigationItems.find((item) => item.id === activeTab)?.label || "Accueil"

  return (
    <div className="hidden lg:flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{currentTabLabel}</h2>
        <p className="text-gray-600">Bienvenue sur votre plateforme agricole mondiale</p>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm">
          <Bell className="h-4 w-4 mr-2" />
          Notifications
        </Button>
        <Button variant="outline" size="sm">
          <Search className="h-4 w-4 mr-2" />
          Rechercher
        </Button>
        <LanguageManager currentLanguage={currentLanguage} onLanguageChange={onLanguageChange} />
      </div>
    </div>
  )
}
