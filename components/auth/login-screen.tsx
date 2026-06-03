"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface LoginScreenProps {
  onLoginClick: () => void
  onRegisterClick: () => void
}

export default function LoginScreen({ onLoginClick, onRegisterClick }: LoginScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold">🌾</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">AGRO MULTICENTER HINOS</CardTitle>
          <p className="text-gray-600">Plateforme agricole mondiale</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={onLoginClick}>
            Se connecter avec Pi Network
          </Button>
          <Button variant="outline" className="w-full bg-transparent" onClick={onRegisterClick}>
            Créer un compte
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
