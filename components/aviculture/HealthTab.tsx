// components/aviculture/HealthTab.tsx
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAviculture } from "@/contexts/AvicultureContext"

export function HealthTab() {
  const { healthRecords } = useAviculture()
  return (
    <div className="space-y-3">
      {healthRecords.map(rec => (
        <Card key={rec.id}>
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div><p className="font-medium">{rec.title}</p><p className="text-xs text-gray-500">{rec.type} • {rec.date}</p></div>
              <Badge variant={rec.status === "done" ? "default" : rec.status === "scheduled" ? "secondary" : "destructive"}>
                {rec.status === "done" ? "Effectué" : rec.status === "scheduled" ? "Planifié" : "En retard"}
              </Badge>
            </div>
            {rec.description && <p className="text-sm mt-1">{rec.description}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}