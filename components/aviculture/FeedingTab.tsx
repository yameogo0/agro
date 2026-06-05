"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, ShoppingCart, Loader2, AlertTriangle } from "lucide-react";
import { useAviculture } from "@/contexts/AvicultureContext";
import { usePiPayment } from "@/hooks/usePiPayment";
import { addFeedOrder, updateFeedStockQuantity } from "@/lib/aviculture/storage";
import { showToast } from "@/lib/utils";

export function FeedingTab() {
  const { feedStock, updateFeedStock, refreshData } = useAviculture();
  const { processPayment, isProcessing } = usePiPayment();
  const [selectedFeedId, setSelectedFeedId] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  const lowStockItems = feedStock.filter(f => f.currentStock <= f.threshold);

  const selectedFeed = feedStock.find(f => f.id === selectedFeedId);
  const totalPrice = selectedFeed && quantity > 0 ? selectedFeed.pricePerUnit * quantity : 0;

  const handleOrder = async () => {
    if (!selectedFeed || quantity <= 0) {
      showToast("Sélectionnez un aliment et une quantité valide", "error");
      return;
    }

    const memo = `Achat aliment: ${selectedFeed.name} x${quantity}kg`;
    const success = await processPayment(totalPrice, memo, async (paymentId) => {
      // Mettre à jour le stock
      updateFeedStockQuantity(selectedFeed.id, quantity);
      addFeedOrder({
        feedId: selectedFeed.id,
        quantity,
        totalPrice,
        date: new Date().toISOString(),
        paymentId,
        status: "completed",
      });
      refreshData();
      setIsOrderDialogOpen(false);
      setQuantity(0);
      setSelectedFeedId("");
    });
  };

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><Package className="h-5 w-5 text-orange-500 mx-auto mb-1" /><p className="text-xl font-bold">{feedStock.reduce((s, f) => s + f.currentStock, 0)} kg</p><p className="text-xs text-gray-500">Stock total</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><AlertTriangle className="h-5 w-5 text-red-500 mx-auto mb-1" /><p className="text-xl font-bold">{lowStockItems.length}</p><p className="text-xs text-gray-500">Alertes stock</p></CardContent></Card>
      </div>

      {/* Alertes stock faible */}
      {lowStockItems.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-700 mb-2"><AlertTriangle className="h-5 w-5" />Stocks faibles</div>
            <div className="space-y-2">
              {lowStockItems.map(f => (
                <div key={f.id} className="flex justify-between items-center">
                  <span>{f.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-red-600">{f.currentStock} kg</span>
                    <Button size="sm" variant="outline" onClick={() => { setSelectedFeedId(f.id); setIsOrderDialogOpen(true); }}>Commander</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des aliments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {feedStock.map(feed => (
          <Card key={feed.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{feed.name}</h3>
                  <p className="text-xs text-gray-500">{feed.supplier}</p>
                </div>
                <Badge variant={feed.currentStock <= feed.threshold ? "destructive" : "default"}>
                  {feed.currentStock} kg
                </Badge>
              </div>
              <Progress value={(feed.currentStock / 2000) * 100} className="my-2" />
              <div className="flex justify-between items-center text-sm mb-3">
                <span>Seuil: {feed.threshold} kg</span>
                <span className="font-semibold text-purple-600">{feed.pricePerUnit} π/kg</span>
              </div>
              <Button variant="outline" className="w-full" onClick={() => { setSelectedFeedId(feed.id); setIsOrderDialogOpen(true); }}>
                <ShoppingCart className="h-4 w-4 mr-2" /> Commander
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialogue de commande */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Commander un aliment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Aliment</Label>
              <Select value={selectedFeedId} onValueChange={setSelectedFeedId}>
                <SelectTrigger><SelectValue placeholder="Choisir un aliment" /></SelectTrigger>
                <SelectContent>
                  {feedStock.map(f => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name} ({f.pricePerUnit} π/kg) - Stock: {f.currentStock} kg
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantité (kg)</Label>
              <Input
                type="number"
                step="1"
                min="1"
                value={quantity || ""}
                onChange={e => setQuantity(Number(e.target.value))}
              />
              {selectedFeed && quantity > 0 && (
                <p className="text-sm text-purple-600 mt-1">
                  Total: {totalPrice.toFixed(4)} π
                </p>
              )}
            </div>
            <Button
              onClick={handleOrder}
              disabled={isProcessing || !selectedFeedId || quantity <= 0}
              className="w-full"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShoppingCart className="h-4 w-4 mr-2" />}
              Payer avec Pi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}