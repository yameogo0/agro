"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useAviculture } from "@/contexts/AvicultureContext"
import { showToast } from "@/lib/utils"

export function BatchesTab() {
  const { batches, addBatch, updateBatch, deleteBatch } = useAviculture()
  const [showDialog, setShowDialog] = useState(false)
  const [editingBatch, setEditingBatch] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "", breed: "", count: 0, startDate: "", expectedEndDate: "", location: "", notes: ""
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.breed || formData.count <= 0) {
      showToast("Veuillez remplir tous les champs obligatoires", "error")
      return
    }
    if (editingBatch) {
      updateBatch({ ...editingBatch, ...formData })
      showToast("Lot modifié", "success")
    } else {
      const newBatch = {
        id: Date.now().toString(),
        ...formData,
        initialCount: formData.count,
        status: "active",
        mortality: 0,
        feedConsumption: 0,
      }
      addBatch(newBatch)
      showToast("Lot ajouté", "success")
    }
    setShowDialog(false)
    setEditingBatch(null)
    setFormData({ name: "", breed: "", count: 0, startDate: "", expectedEndDate: "", location: "", notes: "" })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditingBatch(null); setFormData({ name: "", breed: "", count: 0, startDate: "", expectedEndDate: "", location: "", notes: "" }); setShowDialog(true) }}>
          <Plus className="h-4 w-4 mr-2" /> Nouveau lot
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {batches.map(batch => (
          <Card key={batch.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{batch.name}</h3>
                  <p className="text-xs text-gray-500">{batch.breed} • {batch.location}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditingBatch(batch); setFormData(batch); setShowDialog(true) }}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => deleteBatch(batch.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">Effectif:</span> {batch.count}</div>
                <div><span className="text-gray-500">Début:</span> {batch.startDate}</div>
                <div><span className="text-gray-500">Mortalité:</span> {batch.mortality}</div>
                {batch.weight && <div><span className="text-gray-500">Poids:</span> {batch.weight} kg</div>}
              </div>
              <Progress value={(batch.count / batch.initialCount) * 100} className="mt-3 h-1" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingBatch ? "Modifier le lot" : "Nouveau lot"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nom du lot *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div><Label>Race *</Label><Input value={formData.breed} onChange={e => setFormData({...formData, breed: e.target.value})} /></div>
            <div><Label>Nombre de sujets *</Label><Input type="number" value={formData.count} onChange={e => setFormData({...formData, count: Number(e.target.value)})} /></div>
            <div><Label>Date de début *</Label><Input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} /></div>
            <div><Label>Emplacement</Label><Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
            <div><Label>Notes</Label><Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} /></div>
            <Button onClick={handleSubmit} className="w-full">{editingBatch ? "Mettre à jour" : "Créer"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}