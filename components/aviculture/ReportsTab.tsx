// components/aviculture/ReportsTab.tsx

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
import { Plus, FileText, Thermometer, Droplets, Activity, Egg, Download } from "lucide-react"
import { useAviculture } from "@/contexts/AvicultureContext"
import { showToast } from "@/lib/utils"
import { formatDate } from "@/lib/aviculture/helpers"

export function ReportsTab() {
  const { batches, dailyReports, addDailyReport } = useAviculture()
  const [showDialog, setShowDialog] = useState(false)
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
      eggCount: formData.eggCount,
      observations: formData.observations,
      createdBy: "Agriculteur",
    })
    setShowDialog(false)
    setFormData({
      batchId: "", temperature: 0, humidity: 0, mortality: 0,
      feedConsumed: 0, waterConsumed: 0, eggCount: 0, observations: "",
    })
    showToast("Rapport quotidien ajouté", "success")
  }

  const exportReports = () => {
    const csv = [["Date", "Lot", "Température", "Humidité", "Mortalité", "Aliment (kg)", "Eau (L)", "Œufs", "Observations"].join(",")]
    dailyReports.forEach(r => {
      const batch = batches.find(b => b.id === r.batchId)
      csv.push([
        r.date,
        batch?.name || r.batchId,
        r.temperature,
        r.humidity,
        r.mortality,
        r.feedConsumed,
        r.waterConsumed,
        r.eggCount || "",
        `"${r.observations}"`,
      ].join(","))
    })
    const blob = new Blob([csv.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `rapports_aviculture_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast("Export CSV réussi", "success")
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Rapports quotidiens</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportReports}>
            <Download className="h-4 w-4 mr-2" /> Exporter CSV
          </Button>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Ajouter un rapport</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Rapport quotidien</DialogTitle></DialogHeader>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <div><Label>Lot *</Label><Select value={formData.batchId} onValueChange={v => setFormData({...formData, batchId: v})}><SelectTrigger><SelectValue placeholder="Sélectionnez un lot" /></SelectTrigger><SelectContent>{batches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Température (°C)</Label><Input type="number" step="0.5" value={formData.temperature} onChange={e => setFormData({...formData, temperature: Number(e.target.value)})} /></div>
                  <div><Label>Humidité (%)</Label><Input type="number" step="5" value={formData.humidity} onChange={e => setFormData({...formData, humidity: Number(e.target.value)})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Mortalité</Label><Input type="number" value={formData.mortality} onChange={e => setFormData({...formData, mortality: Number(e.target.value)})} /></div>
                  <div><Label>Nombre d'œufs</Label><Input type="number" value={formData.eggCount} onChange={e => setFormData({...formData, eggCount: Number(e.target.value)})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Aliment consommé (kg)</Label><Input type="number" step="5" value={formData.feedConsumed} onChange={e => setFormData({...formData, feedConsumed: Number(e.target.value)})} /></div>
                  <div><Label>Eau consommée (L)</Label><Input type="number" step="10" value={formData.waterConsumed} onChange={e => setFormData({...formData, waterConsumed: Number(e.target.value)})} /></div>
                </div>
                <div><Label>Observations</Label><Textarea value={formData.observations} onChange={e => setFormData({...formData, observations: e.target.value})} rows={2} /></div>
                <Button onClick={handleSubmit} className="w-full">Enregistrer</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-3">
        {dailyReports.slice(0, 10).map(report => {
          const batch = batches.find(b => b.id === report.batchId)
          return (
            <Card key={report.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{batch?.name || report.batchId}</span>
                      <Badge variant="outline">{formatDate(report.date)}</Badge>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-3 text-sm">
                      <div className="flex items-center gap-1"><Thermometer className="h-3 w-3" />{report.temperature}°C</div>
                      <div className="flex items-center gap-1"><Droplets className="h-3 w-3" />{report.humidity}%</div>
                      <div className="flex items-center gap-1"><Activity className="h-3 w-3" />Mortalité: {report.mortality}</div>
                      <div className="flex items-center gap-1"><Package className="h-3 w-3" />Aliment: {report.feedConsumed} kg</div>
                      <div className="flex items-center gap-1"><Droplets className="h-3 w-3" />Eau: {report.waterConsumed} L</div>
                      {report.eggCount !== undefined && <div className="flex items-center gap-1"><Egg className="h-3 w-3" />Œufs: {report.eggCount}</div>}
                    </div>
                    {report.observations && <p className="text-sm text-gray-600 mt-2">{report.observations}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}