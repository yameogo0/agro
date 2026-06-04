"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Globe, Check, ChevronDown } from "lucide-react"
import { showToast } from "@/lib/utils"

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}

const languages: Language[] = [
  { code: "fr", name: "Français", nativeName: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "pt", name: "Português", nativeName: "Português", flag: "🇵🇹" },
  { code: "es", name: "Español", nativeName: "Español", flag: "🇪🇸" },
  { code: "dyu", name: "Dioula", nativeName: "Jula", flag: "🇨🇮" },
  { code: "mos", name: "Mooré", nativeName: "Mòoré", flag: "🇧🇫" },
  { code: "ha", name: "Haoussa", nativeName: "Harshen Hausa", flag: "🇳🇬" },
]

interface LanguageSelectorProps {
  currentLanguage: string
  onLanguageChange: (code: string) => void
  variant?: "default" | "minimal"
  showLabel?: boolean
}

export function LanguageSelector({ 
  currentLanguage, 
  onLanguageChange, 
  variant = "default",
  showLabel = false 
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const current = languages.find(l => l.code === currentLanguage) || languages[0]

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLanguageChange = (code: string) => {
    onLanguageChange(code)
    setIsOpen(false)
    const lang = languages.find(l => l.code === code)
    if (lang && mounted) {
      showToast(`Langue changée : ${lang.name}`, "success")
    }
  }

  const getLanguageItem = (lang: Language, isActive: boolean) => (
    <DropdownMenuItem
      key={lang.code}
      onClick={() => handleLanguageChange(lang.code)}
      className={`flex items-center justify-between cursor-pointer py-2 px-3 ${
        isActive ? "bg-green-50 text-green-700" : "hover:bg-gray-50"
      }`}
    >
      <span className="flex items-center gap-2">
        <span className="text-lg">{lang.flag}</span>
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
          {languages.map(lang => getLanguageItem(lang, currentLanguage === lang.code))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Variante par défaut
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
          {languages.length} langues disponibles
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}