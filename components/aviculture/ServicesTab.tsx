// components/aviculture/ServicesTab.tsx
"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Clock, Loader2 } from "lucide-react"
import { useAviculture } from "@/contexts/AvicultureContext"
import { usePiPayment } from "@/hooks/usePiPayment"
import { showToast } from "@/lib/utils"

export function ServicesTab() {
  const { vetServices } = useAviculture()
  const { processPayment, isProcessing } = usePiPayment()

  const handleBooking = async (service: any) => {
    const success = await processPayment(
      service.price,
      `Service vétérinaire: ${service.name}`,
      async (paymentId) => {
        showToast(`Service réservé ! ${service.price} π débité`, "success")
      }
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {vetServices.map(service => (
        <Card key={service.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{service.name}</h3>
                <p className="text-xs text-gray-500">{service.provider} • {service.location}</p>
                <div className="flex items-center gap-1 mt-1"><Heart className="h-3 w-3 text-red-500" /> {service.rating}</div>
              </div>
              <Badge>{service.price} π</Badge>
            </div>
            <p className="text-sm text-gray-600 mt-2">{service.description}</p>
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-gray-400"><Clock className="h-3 w-3 inline mr-1" />{service.duration}</span>
              <Button size="sm" className="bg-purple-600" disabled={isProcessing} onClick={() => handleBooking(service)}>
                {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : "Réserver"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}