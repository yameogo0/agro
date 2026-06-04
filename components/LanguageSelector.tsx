"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Globe, Check, ChevronDown, Languages, Sparkles } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { showToast } from "@/lib/utils"

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
  direction?: "ltr" | "rtl"
}

const languages: Language[] = [
  { code: "fr", name: "Français", nativeName: "Français", flag: "🇫🇷", direction: "ltr" },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", direction: "ltr" },
  { code: "pt", name: "Português", nativeName: "Português", flag: "🇵🇹", direction: "ltr" },
  { code: "es", name: "Español", nativeName: "Español", flag: "🇪🇸", direction: "ltr" },
  { code: "dyu", name: "Dioula", nativeName: "Jula", flag: "🇨🇮", direction: "ltr" },
  { code: "mos", name: "Mooré", nativeName: "Mòoré", flag: "🇧🇫", direction: "ltr" },
  { code: "ha", name: "Haoussa", nativeName: "Harshen Hausa", flag: "🇳🇬", direction: "ltr" },
]

// Grouper les langues par région
const languageGroups = {
  "🌍 Mondial": ["fr", "en", "pt", "es"],
  "🌍 Afrique de l'Ouest": ["dyu", "mos", "ha"],
}

interface LanguageSelectorProps {
  currentLanguage: string
  onLanguageChange: (code: string) => void
  variant?: "default" | "minimal" | "full"
  showLabel?: boolean
}

export function LanguageSelector({ 
  currentLanguage, 
  onLanguageChange, 
  variant = "default",
  showLabel = false 
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [recentLanguages, setRecentLanguages] = useLocalStorage<string[]>("recentLanguages", [])
  
  const current = languages.find(l => l.code === currentLanguage) || languages[0]

  // Ajouter la langue aux récentes quand elle change
  useEffect(() => {
    if (currentLanguage) {
      setRecentLanguages(prev => {
        const filtered = prev.filter(code => code !== currentLanguage)
        return [currentLanguage, ...filtered].slice(0, 3)
      })
    }
  }, [currentLanguage, setRecentLanguages])

  const handleLanguageChange = (code: string) => {
    onLanguageChange(code)
    setIsOpen(false)
    
    // Afficher un toast de confirmation
    const lang = languages.find(l => l.code === code)
    if (lang) {
      showToast(`Langue changée : ${lang.name}`, "success")
    }
  }

  const getLanguageItem = (lang: Language, isActive: boolean) => (
    <DropdownMenuItem
      key={lang.code}
      onClick={() => handleLanguageChange(lang.code)}
      className={`flex items-center justify-between cursor-pointer py-2.5 px-3 ${
        isActive ? "bg-green-50 text-green-700" : "hover:bg-gray-50"
      }`}
    >
      <span className="flex items-center gap-3">
        <span className="text-xl">{lang.flag}</span>
        <div className="flex flex-col">
          <span className={`text-sm font-medium ${isActive ? "text-green-700" : "text-gray-700"}`}>
            {lang.name}
          </span>
          <span className="text-[10px] text-gray-400">{lang.nativeName}</span>
        </div>
      </span>
      {isActive && <Check className="h-4 w-4 text-green-600" />}
    </DropdownMenuItem>
  )

  // Variante minimale (juste le drapeau)
  if (variant === "minimal") {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
            aria-label="Changer de langue"
          >
            <span className="text-lg">{current.flag}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs font-normal text-gray-500">
            Changer de langue
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {languages.map(lang => getLanguageItem(lang, currentLanguage === lang.code))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Variante complète avec groupes
  if (variant === "full") {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 rounded-xl border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all"
          >
            <Globe className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">{current.name}</span>
            <ChevronDown className="h-3 w-3 text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Languages className="h-3 w-3" />
            Choisissez votre langue
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Langues récentes */}
          {recentLanguages.length > 0 && (
            <>
              <div className="px-2 py-1">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Récentes</p>
              </div>
              {recentLanguages.map(code => {
                const lang = languages.find(l => l.code === code)
                if (!lang) return null
                return getLanguageItem(lang, currentLanguage === code)
              })}
              <DropdownMenuSeparator />
            </>
          )}
          
          {/* Langues par groupe */}
          {Object.entries(languageGroups).map(([groupName, codes]) => (
            <div key={groupName}>
              <div className="px-2 py-1">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{groupName}</p>
              </div>
              {codes.map(code => {
                const lang = languages.find(l => l.code === code)
                if (!lang) return null
                return getLanguageItem(lang, currentLanguage === code)
              })}
              <DropdownMenuSeparator />
            </div>
          ))}
          
          <div className="px-3 py-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-b-lg">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-500">🌾 Agro MC Hinos</span>
              <span className="flex items-center gap-1 text-green-600">
                <Sparkles className="h-3 w-3" />
                {languages.length} langues
              </span>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Variante par défaut (équilibrée)
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`gap-1.5 px-2.5 rounded-full border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all ${
            showLabel ? "min-w-[100px]" : ""
          }`}
        >
          <Globe className="h-3.5 w-3.5 text-gray-500" />
          <span className="text-sm">{current.flag}</span>
          {showLabel && (
            <span className="text-xs text-gray-600 hidden sm:inline">{current.name}</span>
          )}
          <ChevronDown className="h-3 w-3 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2 border-b border-gray-100">
          <p className="text-xs font-medium text-gray-700">Changer la langue</p>
          <p className="text-[10px] text-gray-400">Interface et contenu</p>
        </div>
        {languages.map(lang => getLanguageItem(lang, currentLanguage === lang.code))}
        <DropdownMenuSeparator />
        <div className="px-3 py-2 text-[10px] text-gray-400 text-center">
          Traductions participatives
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}