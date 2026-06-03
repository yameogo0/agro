"use client"

import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

interface MobileHeaderProps {
  isMenuOpen: boolean
  onMenuToggle: () => void
}

export default function MobileHeader({ isMenuOpen, onMenuToggle }: MobileHeaderProps) {
  return (
    <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">🌾</span>
        </div>
        <h1 className="font-bold text-lg">AGRO MC HINOS</h1>
      </div>
      <Button variant="ghost" size="sm" onClick={onMenuToggle}>
        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
    </div>
  )
}
