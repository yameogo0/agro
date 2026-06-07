import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-xl rounded-2xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-green-500 to-blue-600" />
        <CardContent className="p-8 text-center">
          {/* Logo animé */}
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
            <span className="text-3xl text-white">🌾</span>
          </div>
          
          <h2 className="text-xl font-bold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent mb-2">
            AGRO MULTICENTER HINOS
          </h2>
          <p className="text-gray-500 text-sm mb-6">Chargement de votre plateforme agricole...</p>

          {/* Points de chargement */}
          <div className="flex justify-center gap-2 mb-4">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce" />
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
            <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
          </div>

          {/* Messages de chargement */}
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              <span>Connexion au réseau Pi...</span>
            </div>
            <p className="text-xs">🔒 Sécurisé • 🌍 Multilingue • 💰 Paiements Pi</p>
          </div>

          {/* Barre de progression */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-6">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-600 h-1.5 rounded-full animate-pulse"
              style={{ width: "75%" }}
            />
          </div>

          <p className="mt-4 text-[10px] text-gray-400">
            v2.0 • Plateforme agricole connectée
          </p>
        </CardContent>
      </Card>
    </div>
  )
}