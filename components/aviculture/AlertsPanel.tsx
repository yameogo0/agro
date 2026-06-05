// components/aviculture/AlertsPanel.tsx

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, AlertCircle, Package, Syringe, Thermometer, TrendingDown } from "lucide-react"
import { useAviculture } from "@/contexts/AvicultureContext"
import { formatRelativeDate } from "@/lib/aviculture/helpers"

interface AlertsPanelProps {
  onClose: () => void
}

const alertIcons = {
  stock: <Package className="h-4 w-4" />,
  health: <AlertCircle className="h-4 w-4" />,
  vaccination: <Syringe className="h-4 w-4" />,
  temperature: <Thermometer className="h-4 w-4" />,
  mortality: <TrendingDown className="h-4 w-4" />,
}

export function AlertsPanel({ onClose }: AlertsPanelProps) {
  const { alerts, markAlertRead, deleteAlert } = useAviculture()

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleMarkRead = (id: string) => {
    markAlertRead(id)
  }

  return (
    <Card className="border shadow-lg">
      <CardHeader className="flex flex-row justify-between items-center pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          Alertes et notifications
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto space-y-2">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>Aucune alerte</p>
            <p className="text-sm">Tout est sous contrôle !</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div 
              key={alert.id} 
              className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)} ${!alert.read ? 'opacity-100' : 'opacity-60'}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2">
                  {alertIcons[alert.type] || <AlertCircle className="h-4 w-4 mt-0.5" />}
                  <div>
                    <p className="font-medium text-sm">{alert.title}</p>
                    <p className="text-xs mt-1">{alert.message}</p>
                    <p className="text-[10px] mt-1 text-gray-500">{formatRelativeDate(alert.createdAt)}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {!alert.read && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 px-2 text-xs"
                      onClick={() => handleMarkRead(alert.id)}
                    >
                      Marquer lu
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0 text-red-500"
                    onClick={() => deleteAlert(alert.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

// Composant CheckCircle pour l'absence d'alertes
const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)