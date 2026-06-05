"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, TrendingDown, Package, Egg, AlertTriangle } from "lucide-react"
import { useAviculture } from "@/contexts/AvicultureContext"

export function OverviewTab() {
  const { batches, feedStock, healthRecords } = useAviculture()
  
  const totalBirds = batches.filter(b => b.status === "active").reduce((sum, b) => sum + b.count, 0)
  const totalMortality = batches.reduce((sum, b) => sum + b.mortality, 0)
  const totalFeedStock = feedStock.reduce((sum, f) => sum + f.currentStock, 0)
  const avgEggs = batches.filter(b => b.eggProduction).reduce((sum, b) => sum + (b.eggProduction || 0), 0)
  const lowStockAlerts = feedStock.filter(f => f.currentStock <= f.threshold)
  const overdueHealth = healthRecords.filter(h => h.status === "overdue")

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 text-blue-600 mx-auto mb-1" /><p className="text-2xl font-bold">{totalBirds}</p><p className="text-xs text-gray-500">Volailles actives</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><TrendingDown className="h-5 w-5 text-red-500 mx-auto mb-1" /><p className="text-2xl font-bold">{totalMortality}</p><p className="text-xs text-gray-500">Mortalité totale</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Package className="h-5 w-5 text-orange-500 mx-auto mb-1" /><p className="text-2xl font-bold">{totalFeedStock} kg</p><p className="text-xs text-gray-500">Stock alimentaire</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Egg className="h-5 w-5 text-yellow-500 mx-auto mb-1" /><p className="text-2xl font-bold">{avgEggs}</p><p className="text-xs text-gray-500">Œufs/jour</p></CardContent></Card>
      </div>

      {(lowStockAlerts.length > 0 || overdueHealth.length > 0) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-700 mb-2"><AlertTriangle className="h-5 w-5" />Alertes importantes</div>
            <div className="space-y-1 text-sm">
              {lowStockAlerts.map(f => <div key={f.id}>⚠️ Stock faible : {f.name} ({f.currentStock} kg)</div>)}
              {overdueHealth.map(h => <div key={h.id}>⚠️ {h.title} en retard</div>)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}