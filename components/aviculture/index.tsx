// components/aviculture/index.tsx

"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Bell, RefreshCw } from "lucide-react"
import { OverviewTab } from "./OverviewTab"
import { BatchesTab } from "./BatchesTab"
import { HealthTab } from "./HealthTab"
import { FeedingTab } from "./FeedingTab"
import { ServicesTab } from "./ServicesTab"
import { ReportsTab } from "./ReportsTab"
import { AlertsPanel } from "./AlertsPanel"
import { AvicultureProvider, useAviculture } from "@/contexts/AvicultureContext"
import { showToast } from "@/lib/utils"

interface AvicultureManagementProps {
  currentLanguage: string
  userRegion: string
}

function AvicultureContent({ userRegion }: { userRegion: string }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [showAlerts, setShowAlerts] = useState(false)
  const { refreshData, alerts, isLoading } = useAviculture()
  const unreadAlerts = alerts.filter(a => !a.read).length

  const handleRefresh = async () => {
    refreshData()
    showToast("Données actualisées", "success")
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent">
            🐔 Gestion Avicole
          </h2>
          <p className="text-gray-500 text-sm">Gérez vos élevages de volailles - {userRegion}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isLoading}
            className="relative"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative"
          >
            <Bell className="h-4 w-4" />
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                {unreadAlerts}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Panneau des alertes */}
      {showAlerts && <AlertsPanel onClose={() => setShowAlerts(false)} />}

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 gap-1">
          <TabsTrigger value="overview" className="text-sm">📊 Aperçu</TabsTrigger>
          <TabsTrigger value="batches" className="text-sm">🐤 Lots</TabsTrigger>
          <TabsTrigger value="health" className="text-sm">💊 Santé</TabsTrigger>
          <TabsTrigger value="feeding" className="text-sm">🌾 Alimentation</TabsTrigger>
          <TabsTrigger value="services" className="text-sm">🏥 Services</TabsTrigger>
          <TabsTrigger value="reports" className="text-sm">📋 Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="batches" className="mt-6">
          <BatchesTab />
        </TabsContent>
        <TabsContent value="health" className="mt-6">
          <HealthTab />
        </TabsContent>
        <TabsContent value="feeding" className="mt-6">
          <FeedingTab />
        </TabsContent>
        <TabsContent value="services" className="mt-6">
          <ServicesTab />
        </TabsContent>
        <TabsContent value="reports" className="mt-6">
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function AvicultureManagement({ currentLanguage, userRegion }: AvicultureManagementProps) {
  return (
    <AvicultureProvider>
      <AvicultureContent userRegion={userRegion} />
    </AvicultureProvider>
  )
}