"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Camera,
  Edit,
  Star,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Globe,
  Award,
  TrendingUp,
  MessageSquare,
  Settings,
  Shield,
  Heart,
  Share2,
  Users,
  Wallet,
  Pi,
  CheckCircle,
  Clock,
  Copy,
  QrCode,
  Lock,
  Bell,
  Moon,
  Sun,
  LogOut,
  AlertTriangle,
  X,
  Wifi,
  WifiOff,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { showToast } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function UserProfile({ currentLanguage, userRegion }: { currentLanguage: string; userRegion: string }) {
  const { userData, isAuthenticated, isLoading, logout, refreshUserData } = usePiAuth()
  const isOnline = useOnlineStatus()
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // État local pour l'édition
  const [editData, setEditData] = useState({
    username: "",
    bio: "",
    phone: "",
    email: "",
    region: "",
  })

  // Synchroniser avec les données Pi
  useEffect(() => {
    if (userData) {
      setEditData({
        username: userData.username || "",
        bio: (userData as any).bio || "",
        phone: (userData as any).phone || "",
        email: (userData as any).email || "",
        region: (userData as any).region || userRegion,
      })
    }
  }, [userData, userRegion])

  const handleSave = async () => {
    if (!isOnline) {
      showToast("Connexion internet requise", "error")
      return
    }
    setIsRefreshing(true)
    try {
      await refreshUserData()
      showToast("Profil mis à jour", "success")
      setIsEditing(false)
    } catch {
      showToast("Erreur lors de la mise à jour", "error")
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    showToast("Déconnexion réussie", "success")
  }

  // Écran de chargement
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  // Vérification que userData existe
  if (!isAuthenticated || !userData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Veuillez vous connecter avec Pi Network</p>
      </div>
    )
  }

  // Données par défaut si certaines propriétés sont manquantes
  const username = userData.username || "Agriculteur"
  const region = (userData as any).region || userRegion
  const bio = (userData as any).bio || "Expert en agriculture connectée"
  const phone = (userData as any).phone || "Non renseigné"
  const email = (userData as any).email || "Non renseigné"
  const walletAddress = (userData as any).walletAddress || userData.walletAddress || "Non disponible"
  const creditsBalance = userData.credits_balance || 0

  // Statistiques (à connecter à une API plus tard)
  const userStats = {
    followers: 1247,
    following: 89,
    rating: 4.9,
    reviews: 234,
    piEarned: creditsBalance,
    servicesOffered: 5,
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white/30 shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-3xl">
                  {username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button size="sm" className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 bg-white/20">
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <h1 className="text-2xl font-bold">{username}</h1>
                    <Badge className="bg-white/20 text-white border-0 gap-1">
                      <CheckCircle className="h-3 w-3" /> Vérifié Pi
                    </Badge>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm text-green-100 mt-1">
                    <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{region}</div>
                    <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />Membre Pi Network</div>
                    {isOnline && <div className="flex items-center gap-1"><Wifi className="h-3 w-3 text-green-300" />En ligne</div>}
                  </div>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button variant="secondary" size="sm" onClick={() => setIsEditing(!isEditing)} disabled={isRefreshing}>
                    <Edit className="h-4 w-4 mr-2" /> {isEditing ? "Annuler" : "Modifier"}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleLogout} className="bg-red-600/80 hover:bg-red-700">
                    <LogOut className="h-4 w-4 mr-2" /> Déconnexion
                  </Button>
                </div>
              </div>
              {isEditing ? (
                <div className="mt-3 space-y-2">
                  <Input value={editData.username} onChange={e => setEditData({ ...editData, username: e.target.value })} placeholder="Nom" className="bg-white/10 text-white" />
                  <Textarea value={editData.bio} onChange={e => setEditData({ ...editData, bio: e.target.value })} placeholder="Bio" rows={2} className="bg-white/10 text-white" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} placeholder="Téléphone" className="bg-white/10 text-white" />
                    <Input value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} placeholder="Email" className="bg-white/10 text-white" />
                  </div>
                  <Button onClick={handleSave} className="w-full bg-white text-green-700 hover:bg-gray-100" disabled={isRefreshing}>
                    {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    Enregistrer
                  </Button>
                </div>
              ) : (
                <p className="text-green-100 text-sm mt-2">{bio}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                <Badge className="bg-white/20 text-white">Aviculture</Badge>
                <Badge className="bg-white/20 text-white">Gestion sanitaire</Badge>
                <Badge className="bg-white/20 text-white">Formation</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><Users className="h-5 w-5 text-blue-600 mx-auto mb-1" /><p className="text-xl font-bold">{userStats.followers.toLocaleString()}</p><p className="text-xs text-gray-500">Abonnés</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><UserIcon className="h-5 w-5 text-green-600 mx-auto mb-1" /><p className="text-xl font-bold">{userStats.following}</p><p className="text-xs text-gray-500">Abonnements</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Star className="h-5 w-5 text-yellow-500 mx-auto mb-1 fill-current" /><p className="text-xl font-bold">{userStats.rating}</p><p className="text-xs text-gray-500">Note</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><MessageSquare className="h-5 w-5 text-purple-600 mx-auto mb-1" /><p className="text-xl font-bold">{userStats.reviews}</p><p className="text-xs text-gray-500">Avis</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Pi className="h-5 w-5 text-purple-600 mx-auto mb-1" /><p className="text-xl font-bold">{userStats.piEarned.toFixed(4)} π</p><p className="text-xs text-gray-500">Gains</p></CardContent></Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="activities">Activités</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Phone className="h-5 w-5" />Contact</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-gray-500" />{phone}</div>
              <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-gray-500" />{email}</div>
              <div className="flex items-center gap-3"><Wallet className="h-4 w-4 text-gray-500" />Adresse Pi: {walletAddress.substring(0, 10)}...</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Award className="h-5 w-5" />Certifications</CardTitle></CardHeader>
            <CardContent><div className="flex flex-wrap gap-2"><Badge className="bg-yellow-100 text-yellow-800">Vétérinaire certifié</Badge><Badge className="bg-purple-100 text-purple-800">Expert Pi Network</Badge><Badge className="bg-blue-100 text-blue-800">Formateur agréé</Badge></div></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="mt-4">
          <Card><CardContent className="p-4 text-center text-gray-500">Aucune activité récente</CardContent></Card>
        </TabsContent>

        <TabsContent value="badges" className="mt-4">
          <Card><CardContent className="p-4 text-center text-gray-500">Badges à venir</CardContent></Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center"><span>Notifications</span><Badge>Activées</Badge></div>
              <div className="flex justify-between items-center"><span>Thème</span><Badge>Clair</Badge></div>
              <div className="flex justify-between items-center"><span>Mode hors ligne</span><Badge>Activé</Badge></div>
              <Button variant="destructive" className="w-full mt-4" onClick={() => setShowDeleteConfirm(true)}>
                <AlertTriangle className="h-4 w-4 mr-2" /> Supprimer mon compte
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent><DialogHeader><DialogTitle>Confirmer la suppression</DialogTitle></DialogHeader><p>Cette action est irréversible.</p><div className="flex gap-3 mt-4"><Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Annuler</Button><Button variant="destructive">Supprimer</Button></div></DialogContent>
      </Dialog>
    </div>
  )
}

// Composant UserIcon manquant
const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)