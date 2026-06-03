"use client"

import { Button } from "@/components/ui/button"
import type { NavigationItem } from "@/lib/types/user"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  navigationItems: NavigationItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  userRegion: string
}

export default function Sidebar({
  isOpen,
  onClose,
  navigationItems,
  activeTab,
  onTabChange,
  userRegion,
}: SidebarProps) {
  return (
    <div
      className={`${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r transition-transform duration-300 ease-in-out`}
    >
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">🌾</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">AGRO MULTICENTER</h1>
            <p className="text-xs text-gray-500">HINOS</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                onTabChange(item.id)
                onClose()
              }}
            >
              <Icon className="h-4 w-4 mr-3" />
              {item.label}
            </Button>
          )
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-3 rounded-lg text-center">
          <p className="text-sm font-medium">Région actuelle</p>
          <p className="text-xs">{userRegion}</p>
        </div>
      </div>
    </div>
  )
}
