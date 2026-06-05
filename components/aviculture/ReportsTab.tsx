/// components/aviculture/ReportsTab.tsx

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FileText, Thermometer, Droplets, Activity, Egg, Download, Calendar, Package } from "lucide-react"
import { useAviculture } from "@/contexts/AvicultureContext"
import { showToast } from "@/lib/utils"
import { formatDate } from "@/lib/aviculture/helpers"

export function ReportsTab() {
  const { batches, dailyReports, addDailyReport, refreshData } = useAviculture()
  const [showDialog, setShowDialog] = useState(false)
  const [activeBatchFilter, setActiveBatchFilter] = useState("all")
  const [formData, setFormData] = useState({
    batchId: "",
    temperature: 0,
    humidity: 0,
    mortality: 0,
    feedConsumed: 0,
    waterConsumed: 0,
    eggCount: 0,
    observations: "",
  })

  const handleSubmit = () => {
    if (!formData.batchId) {
      showToast("Veuillez sélectionner un lot", "error")
      return
    }

    addDailyReport({
      date: new Date().toISOString().split("T")[0],
      batchId: formData.batchId,
      temperature: formData.temperature,
      humidity: formData.humidity,
      mortality: formData.mortality,
      feedConsumed: formData.feedConsumed,
      waterConsumed: formData.waterConsumed,
      eggCount: formData.eggCount || 0,
      observations: formData.observations,
      createdBy: "Agriculteur",
    })
    
    setShowDialog(false)
    setFormData({
      batchId: "",
      temperature: 0,
      humidity: 0,
      mortality: 0,
      feedConsumed: 0,
      waterConsumed: 0,
      eggCount: 0,
      observations: "",
    })
    showToast("Rapport quotidien ajouté", "success")
    refreshData()
  }

  const exportToCSV = () => {
    const filteredReports = activeBatchFilter === "all" 
      ? dailyReports 
      : dailyReports.filter(r => r.batchId === activeBatchFilter)
    
    if (filteredReports.length === 0) {
      showToast("Aucun rapport à exporter", "error")
      return
    }

    const headers = ["Date", "Lot", "Température (°C)", "Humidité (%)", "Mortalité", "Aliment (kg)", "Eau (L)", "Œufs", "Observations"]
    const csvRows = [headers.join(",")]
    
    filteredReports.forEach(report => {
      const batch = batches.find(b => b.id === report.batchId)
      const row = [
        report.date,
        batch?.name || report.batchId,
        report.temperature,
        report.humidity,
        report.mortality,
        report.feedConsumed,
        report.waterConsumed,
        report.eggCount || 0,
        `"${(report.observations || "").replace(/"/g, '""')}"`,
      ]
      csvRows.push(row.join(","))
    })

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `rapports_aviculture_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showToast("Export CSV réussi", "success")
  }

  const filteredReports = activeBatchFilter === "all" 
    ? dailyReports 
    : dailyReports.filter(r => r.batchId === activeBatchFilter)

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Rapports quotidiens
          </h3>
          <p className="text-sm text-gray-500">Suivez l'évolution de vos lots jour par jour</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau rapport
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Ajouter un rapport quotidien</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <Label>Lot *</Label>
                  <Select value={formData.batchId} onValueChange={v => setFormData({...formData, batchId: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un lot" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Température (°C)</Label>
                    <Input 
                      type="number" 
                      step="0.5" 
                      value={formData.temperature || ""} 
                      onChange={e => setFormData({...formData, temperature: Number(e.target.value)})} 
                      placeholder="28"
                    />
                  </div>
                  <div>
                    <Label>Humidité (%)</Label>
                    <Input 
                      type="number" 
                      step="5" 
                      value={formData.humidity || ""} 
                      onChange={e => setFormData({...formData, humidity: Number(e.target.value)})} 
                      placeholder="65"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Mortalité</Label>
                    <Input 
                      type="number" 
                      value={formData.mortality || ""} 
                      onChange={e => setFormData({...formData, mortality: Number(e.target.value)})} 
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Nombre d'œufs</Label>
                    <Input 
                      type="number" 
                      value={formData.eggCount || ""} 
                      onChange={e => setFormData({...formData, eggCount: Number(e.target.value)})} 
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Aliment consommé (kg)</Label>
                    <Input 
                      type="number" 
                      step="5" 
                      value={formData.feedConsumed || ""} 
                      onChange={e => setFormData({...formData, feedConsumed: Number(e.target.value)})} 
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Eau consommée (L)</Label>
                    <Input 
                      type="number" 
                      step="10" 
                      value={formData.waterConsumed || ""} 
                      onChange={e => setFormData({...formData, waterConsumed: Number(e.target.value)})} 
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label>Observations</Label>
                  <Textarea 
                    value={formData.observations} 
                    onChange={e => setFormData({...formData, observations: e.target.value})} 
                    rows={3} 
                    placeholder="Santé des oiseaux, comportement, anomalies..."
                  />
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  Enregistrer le rapport
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtre par lot */}
      {dailyReports.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button 
            variant={activeBatchFilter === "all" ? "default" : "outline"} 
            size="sm"
            onClick={() => setActiveBatchFilter("all")}
            className={activeBatchFilter === "all" ? "bg-green-600" : ""}
          >
            Tous les lots
          </Button>
          {batches.filter(b => b.status === "active").map(batch => (
            <Button 
              key={batch.id}
              variant={activeBatchFilter === batch.id ? "default" : "outline"} 
              size="sm"
              onClick={() => setActiveBatchFilter(batch.id)}
              className={activeBatchFilter === batch.id ? "bg-green-600" : ""}
            >
              {batch.name}
            </Button>
          ))}
        </div>
      )}

      {/* Liste des rapports */}
      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucun rapport disponible</p>
            <p className="text-sm mt-1">Cliquez sur "Nouveau rapport" pour commencer</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReports.map(report => {
            const batch = batches.find(b => b.id === report.batchId)
            return (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-blue-50">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(report.date)}
                        </Badge>
                        <Badge className="bg-green-100 text-green-700">
                          {batch?.name || report.batchId}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Thermometer className="h-4 w-4 text-red-500" />
                          <span>{report.temperature}°C</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Droplets className="h-4 w-4 text-blue-500" />
                          <span>{report.humidity}%</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Activity className="h-4 w-4 text-red-500" />
                          <span>Mortalité: {report.mortality}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Package className="h-4 w-4 text-orange-500" />
                          <span>{report.feedConsumed} kg</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Droplets className="h-4 w-4 text-cyan-500" />
                          <span>{report.waterConsumed} L</span>
                        </div>
                        {report.eggCount !== undefined && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Egg className="h-4 w-4 text-yellow-500" />
                            <span>{report.eggCount} œufs</span>
                          </div>
                        )}
                      </div>
                      
                      {report.observations && (
                        <p className="text-sm text-gray-500 mt-3 border-t pt-2">
                          📝 {report.observations}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Statistiques des rapports */}
      {dailyReports.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">📊 Statistiques des rapports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{dailyReports.length}</p>
                <p className="text-xs text-gray-500">Rapports totaux</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {dailyReports.reduce((sum, r) => sum + (r.mortality || 0), 0)}
                </p>
                <p className="text-xs text-gray-500">Mortalité totale</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {dailyReports.reduce((sum, r) => sum + (r.eggCount || 0), 0)}
                </p>
                <p className="text-xs text-gray-500">Œufs totaux</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {dailyReports.length > 0 
                    ? Math.round(dailyReports.reduce((sum, r) => sum + (r.temperature || 0), 0) / dailyReports.length) 
                    : 0}°C
                </p>
                <p className="text-xs text-gray-500">Temp. moyenne</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}