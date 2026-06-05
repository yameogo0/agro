'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Package, ShoppingCart, Loader2 } from 'lucide-react'
import { useAvicultureData } from '@/hooks/useAvicultureData'
import { usePiPayment } from '@/hooks/usePiPayment'
import { addFeedOrder } from '@/lib/aviculture/storage'
import { showToast } from '@/lib/utils'

export function FeedingTab() {
  const { feedStock, updateFeedStock } = useAvicultureData()
  const { processPayment, isProcessing } = usePiPayment()
  const [selectedFeedId, setSelectedFeedId] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)

  const handleOrder = async () => {
    const feed = feedStock.find(f => f.id === selectedFeedId)
    if (!feed || quantity <= 0) {
      showToast('Sélectionnez un aliment et une quantité valide', 'error')
      return
    }
    const total = feed.pricePerUnit * quantity
    const success = await processPayment(
      total,
      `Achat aliment: ${feed.name} x${quantity}kg`,
      async (paymentId) => {
        // Mise à jour du stock local
        const updatedStock = feedStock.map(f =>
          f.id === feed.id ? { ...f, currentStock: f.currentStock + quantity } : f
        )
        updateFeedStock(updatedStock)
        // Sauvegarde de la commande
        addFeedOrder({
          id: Date.now().toString(),
          feedId: feed.id,
          quantity,
          totalPrice: total,
          date: new Date().toISOString(),
          paymentId,
          status: 'completed',
        })
        setIsOrderDialogOpen(false)
        setQuantity(0)
        setSelectedFeedId('')
      }
    )
    if (!success) {
      // L'erreur est déjà affichée par le hook
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {feedStock.map(feed => (
          <Card key={feed.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{feed.name}</h3>
                  <p className="text-xs text-gray-500">{feed.supplier}</p>
                </div>
                <Badge variant={feed.currentStock <= feed.threshold ? 'destructive' : 'default'}>
                  {feed.currentStock} kg
                </Badge>
              </div>
              <Progress value={(feed.currentStock / 2000) * 100} className="my-2" />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm">{feed.pricePerUnit} π/kg</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedFeedId(feed.id)
                    setIsOrderDialogOpen(true)
                  }}
                >
                  <ShoppingCart className="h-3 w-3 mr-1" /> Commander
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Commander un aliment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Aliment</Label>
              <Select value={selectedFeedId} onValueChange={setSelectedFeedId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un aliment" />
                </SelectTrigger>
                <SelectContent>
                  {feedStock.map(f => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name} ({f.pricePerUnit} π/kg)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantité (kg)</Label>
              <Input
                type="number"
                step="10"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
              />
            </div>
            <Button onClick={handleOrder} disabled={isProcessing} className="w-full">
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Payer avec Pi'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}