// components/aviculture/ServicesTab.tsx

"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { MapPin, Clock, Star, Loader2, Calendar, Phone } from "lucide-react"
import { useAviculture } from "@/contexts/AvicultureContext"
import { usePiPayment } from "@/hooks/usePiPayment"
import { addVetBooking } from "@/lib/aviculture/storage"
import { showToast } from "@/lib/utils"

export function ServicesTab() {
  const { vetServices, addVetBooking, refreshData } = useAviculture()
  const { processPayment, isProcessing } = usePiPayment()
  const [selectedService, setSelectedService] = useState<any>(null)
  const [bookingDate, setBookingDate] = useState("")
  const [bookingTime, setBookingTime] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")

  const handleBooking = async () => {
    if (!selectedService) return
    if (!bookingDate || !bookingTime) {
      showToast("Veuillez sélectionner une date et une heure", "error")
      return
    }

    const success = await processPayment({
      amount: selectedService.price,
      memo: `Service vétérinaire: ${selectedService.name}`,
      onSuccess: async (paymentId) => {
        const booking = {
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          provider: selectedService.provider,
          clientName: clientName || "Agriculteur",
          clientPhone: clientPhone || "",
          date: bookingDate,
          time: bookingTime,
          price: selectedService.price,
          paymentId,
          status: "confirmed" as const,
        }
        addVetBooking(booking)
        refreshData()
        setSelectedService(null)
        setBookingDate("")
        setBookingTime("")
        setClientName("")
        setClientPhone("")
        showToast(`✅ Rendez-vous confirmé pour le ${bookingDate} à ${bookingTime}`, "success")
      },
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vetServices.map(service => (
          <Card key={service.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{service.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{service.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{service.duration}</span>
                    <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500 fill-current" />{service.rating}</span>
                  </div>
                </div>
                <Badge className="bg-purple-100 text-purple-700">{service.price} π</Badge>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t">
                <div className="text-xs text-gray-400">
                  <Phone className="h-3 w-3 inline mr-1" />
                  {service.providerContact || service.provider}
                </div>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => setSelectedService(service)}>
                  Réserver
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialogue de réservation */}
      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Réserver : {selectedService?.name}</DialogTitle></DialogHeader>
          {selectedService && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{selectedService.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span>👨‍⚕️ {selectedService.provider}</span>
                  <span>📍 {selectedService.location}</span>
                  <span>⭐ {selectedService.rating}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Votre nom</Label>
                  <Input 
                    placeholder="Nom complet" 
                    value={clientName} 
                    onChange={e => setClientName(e.target.value)} 
                  />
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <Input 
                    placeholder="+226 XX XX XX XX" 
                    value={clientPhone} 
                    onChange={e => setClientPhone(e.target.value)} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date *</Label>
                  <Input 
                    type="date" 
                    value={bookingDate} 
                    onChange={e => setBookingDate(e.target.value)} 
                    min={new Date().toISOString().split("T")[0]} 
                  />
                </div>
                <div>
                  <Label>Heure *</Label>
                  <Input 
                    type="time" 
                    value={bookingTime} 
                    onChange={e => setBookingTime(e.target.value)} 
                  />
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg flex justify-between">
                <span className="font-medium">Total à payer :</span>
                <span className="font-bold text-purple-600">{selectedService.price} π</span>
              </div>
              <Button 
                onClick={handleBooking} 
                disabled={isProcessing || !bookingDate || !bookingTime} 
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Confirmer et payer avec Pi
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}