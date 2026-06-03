"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Wallet,
  Send,
  QrCode,
  History,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Loader2,
  Wifi,
  WifiOff,
  Info,
} from "lucide-react"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { showToast } from "@/lib/utils"

interface PiWalletIntegrationProps {
  currentLanguage: string
  userRegion: string
}

interface Transaction {
  id: string
  type: "received" | "sent"
  amount: number
  from?: string
  to?: string
  description: string
  date: string
  status: "completed" | "pending" | "failed"
  txHash: string
}

export default function PiWalletIntegration({ currentLanguage, userRegion }: PiWalletIntegrationProps) {
  const [activeTab, setActiveTab] = useState("wallet")
  const [showBalance, setShowBalance] = useState(true)
  const [sendAmount, setSendAmount] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [sendDescription, setSendDescription] = useState("")
  const [showSendConfirm, setShowSendConfirm] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [walletData, setWalletData] = useState({
    balance: 15.7834,
    lockedBalance: 2.1567,
    pendingTransactions: 1,
    totalEarned: 45.2341,
    totalSpent: 29.4507,
    address: "GCKFBEIYTKQTIQ7VIN54JHKOQ2QZSMH6APPQPLZX2BG4O6JJZWRBTPI7",
  })

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "tx001",
      type: "received",
      amount: 0.008,
      from: "Dr. Moussa Koné",
      description: "Consultation vétérinaire",
      date: "2024-02-01T10:30:00Z",
      status: "completed",
      txHash: "abc123def456",
    },
    {
      id: "tx002",
      type: "sent",
      amount: 0.015,
      to: "Formation Aviculture",
      description: "Cours en ligne aviculture",
      date: "2024-01-30T14:20:00Z",
      status: "completed",
      txHash: "def456ghi789",
    },
    {
      id: "tx003",
      type: "received",
      amount: 0.012,
      from: "Ibrahim Sawadogo",
      description: "Service de conseil",
      date: "2024-01-28T09:15:00Z",
      status: "pending",
      txHash: "ghi789jkl012",
    },
    {
      id: "tx004",
      type: "sent",
      amount: 0.005,
      to: "Marché Local",
      description: "Achat d'aliments",
      date: "2024-01-25T16:45:00Z",
      status: "completed",
      txHash: "jkl012mno345",
    },
  ])

  const { isAuthenticated, userData } = usePiAuth()
  const isOnline = useOnlineStatus()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
    if (diffDays === 1) return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showToast("Adresse copiée", "success")
  }

  const refreshWallet = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      setWalletData(prev => ({
        ...prev,
        balance: prev.balance + Math.random() * 0.1 - 0.05,
      }))
      showToast("Portefeuille actualisé", "success")
    } catch (error) {
      showToast("Erreur lors de l'actualisation", "error")
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const handleSendPi = () => {
    if (!sendAmount || !recipientAddress) {
      showToast("Veuillez remplir tous les champs", "error")
      return
    }
    if (parseFloat(sendAmount) > walletData.balance) {
      showToast("Solde insuffisant", "error")
      return
    }
    setShowSendConfirm(true)
  }

  const confirmSend = async () => {
    const amount = parseFloat(sendAmount)
    
    const newTransaction: Transaction = {
      id: `tx${Date.now()}`,
      type: "sent",
      amount: amount,
      to: recipientAddress,
      description: sendDescription || "Envoi Pi",
      date: new Date().toISOString(),
      status: "pending",
      txHash: Math.random().toString(36).substring(2, 15),
    }
    
    setTransactions([newTransaction, ...transactions])
    setWalletData(prev => ({
      ...prev,
      balance: prev.balance - amount,
      totalSpent: prev.totalSpent + amount,
      pendingTransactions: prev.pendingTransactions + 1,
    }))
    
    setShowSendConfirm(false)
    setSendAmount("")
    setRecipientAddress("")
    setSendDescription("")
    showToast(`Envoi de ${amount} π en cours`, "success")
  }

  const analytics = {
    monthlyEarnings: [
      { month: "Jan", amount: 12.5 },
      { month: "Fév", amount: 15.8 },
      { month: "Mar", amount: 18.2 },
      { month: "Avr", amount: 14.7 },
      { month: "Mai", amount: 22.1 },
      { month: "Juin", amount: 19.6 },
    ],
    topServices: [
      { service: "Consultation vétérinaire", earnings: 8.45, transactions: 23 },
      { service: "Formation aviculture", earnings: 6.78, transactions: 15 },
      { service: "Conseil technique", earnings: 4.32, transactions: 18 },
    ],
  }

  const recentContacts = [
    { name: "Dr. Moussa Koné", address: "GCKF...TPI7", avatar: "M" },
    { name: "Marie Ouédraogo", address: "ABCD...XYZ9", avatar: "M" },
    { name: "Ibrahim Sawadogo", address: "EFGH...UVW2", avatar: "I" },
    { name: "Coopérative YELEN", address: "IJKL...RST5", avatar: "C" },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Wallet Overview */}
      <Card className="bg-gradient-to-r from-purple-700 via-purple-600 to-blue-600 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
        <CardContent className="p-6 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">π</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">Portefeuille Pi Network</h2>
                <p className="text-purple-100 text-sm">Connecté et sécurisé</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={refreshWallet}
                disabled={isRefreshing}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
              {!isOnline && (
                <Badge variant="outline" className="bg-yellow-500/20 text-yellow-200 border-yellow-500/30">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Hors ligne
                </Badge>
              )}
              {isOnline && (
                <Badge variant="outline" className="bg-green-500/20 text-green-200 border-green-500/30">
                  <Wifi className="h-3 w-3 mr-1" />
                  En ligne
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-purple-200 text-sm">Solde disponible</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 h-6 w-6 p-0"
                  onClick={() => setShowBalance(!showBalance)}
                >
                  {showBalance ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
              <p className="text-2xl md:text-3xl font-bold mt-1">
                {showBalance ? `${walletData.balance.toFixed(4)} π` : "•••• π"}
              </p>
              <p className="text-xs text-purple-200 mt-1">≈ ${(walletData.balance * 45).toFixed(2)} USD</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-purple-200 text-sm">Solde bloqué</p>
              <p className="text-xl md:text-2xl font-bold mt-1">{walletData.lockedBalance.toFixed(4)} π</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-purple-200 text-sm">Transactions en attente</p>
              <p className="text-xl md:text-2xl font-bold mt-1">{walletData.pendingTransactions}</p>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm text-purple-200">Adresse du portefeuille:</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-7 text-xs"
                onClick={() => copyToClipboard(walletData.address)}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copier
              </Button>
            </div>
            <p className="text-xs font-mono mt-1 break-all opacity-80">
              {walletData.address.substring(0, 20)}...{walletData.address.substring(walletData.address.length - 10)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="wallet" className="gap-2">
            <Wallet className="h-4 w-4" />
            Portefeuille
          </TabsTrigger>
          <TabsTrigger value="send" className="gap-2">
            <Send className="h-4 w-4" />
            Envoyer
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Historique
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Analyses
          </TabsTrigger>
        </TabsList>

        {/* Onglet Portefeuille */}
        <TabsContent value="wallet" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full gap-2" onClick={() => setActiveTab("send")}>
                  <Send className="h-4 w-4" />
                  Envoyer π
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <QrCode className="h-4 w-4" />
                  Recevoir π (QR Code)
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Demander un paiement
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Shield className="h-4 w-4" />
                  Sécurité du portefeuille
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Transactions récentes
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("history")}>
                    Voir tout
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.slice(0, 3).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.type === "received" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}>
                          {tx.type === "received" ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{tx.type === "received" ? tx.from : tx.to}</p>
                          <p className="text-xs text-gray-500">{tx.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${tx.type === "received" ? "text-green-600" : "text-red-600"}`}>
                          {tx.type === "received" ? "+" : "-"}{tx.amount} π
                        </p>
                        <div className="flex items-center gap-1">
                          {tx.status === "completed" ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <Clock className="h-3 w-3 text-orange-500" />
                          )}
                          <span className="text-xs text-gray-500">{tx.status === "completed" ? "Terminé" : "En attente"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{walletData.totalEarned.toFixed(4)} π</p>
                <p className="text-sm text-gray-500">Total gagné</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{walletData.totalSpent.toFixed(4)} π</p>
                <p className="text-sm text-gray-500">Total dépensé</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{(walletData.totalEarned - walletData.totalSpent).toFixed(4)} π</p>
                <p className="text-sm text-gray-500">Bénéfice net</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Envoyer */}
        <TabsContent value="send" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Envoyer des Pi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Adresse du destinataire</label>
                <Input
                  placeholder="Adresse Pi Network ou nom d'utilisateur"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Montant (π)</label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.001"
                    min="0.001"
                    placeholder="0.000"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    className="pr-12"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">π</div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Solde disponible: {walletData.balance.toFixed(4)} π</p>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description (optionnel)</label>
                <Input
                  placeholder="Motif du paiement"
                  value={sendDescription}
                  onChange={(e) => setSendDescription(e.target.value)}
                />
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    Vérifiez bien l'adresse du destinataire. Les transactions Pi sont irréversibles.
                  </p>
                </div>
              </div>
              <Button 
                className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
                onClick={handleSendPi}
                disabled={!sendAmount || !recipientAddress}
              >
                <Send className="h-4 w-4" />
                Envoyer {sendAmount || "0"} π
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Envoi rapide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {recentContacts.map((contact, index) => (
                  <div
                    key={index}
                    className="text-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-all"
                    onClick={() => setRecipientAddress(contact.address)}
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="font-semibold text-blue-600 text-lg">{contact.avatar}</span>
                    </div>
                    <p className="text-sm font-medium truncate">{contact.name}</p>
                    <p className="text-xs text-gray-500">{contact.address}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Historique */}
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Historique des transactions
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Filtrer</Button>
                  <Button variant="outline" size="sm">Exporter</Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Aucune transaction</p>
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-center gap-4 mb-3 sm:mb-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === "received" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}>
                          {tx.type === "received" ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium">
                            {tx.type === "received" ? `Reçu de ${tx.from}` : `Envoyé à ${tx.to}`}
                          </p>
                          <p className="text-sm text-gray-500">{tx.description}</p>
                          <p className="text-xs text-gray-400">{formatDate(tx.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${tx.type === "received" ? "text-green-600" : "text-red-600"}`}>
                          {tx.type === "received" ? "+" : "-"}{tx.amount} π
                        </p>
                        <div className="flex items-center justify-end gap-2">
                          <Badge variant={tx.status === "completed" ? "default" : "secondary"}>
                            {tx.status === "completed" ? "Terminé" : "En attente"}
                          </Badge>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToClipboard(tx.txHash)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-400 font-mono mt-1">{tx.txHash.substring(0, 10)}...</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Analyses */}
        <TabsContent value="analytics" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Gains mensuels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.monthlyEarnings.map((month, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm font-medium w-10">{month.month}</span>
                      <div className="flex-1 mx-3">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all"
                            style={{ width: `${(month.amount / 25) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-purple-600">{month.amount} π</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Services les plus rentables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topServices.map((service, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{service.service}</h4>
                        <span className="font-bold text-purple-600">{service.earnings} π</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{service.transactions} transactions</span>
                        <span>Moy: {(service.earnings / service.transactions).toFixed(3)} π</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Résumé financier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">+{walletData.totalEarned.toFixed(2)} π</p>
                  <p className="text-sm text-green-700">Revenus totaux</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">-{walletData.totalSpent.toFixed(2)} π</p>
                  <p className="text-sm text-red-700">Dépenses totales</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {walletData.totalSpent > 0 
                      ? ((walletData.totalEarned / walletData.totalSpent - 1) * 100).toFixed(1)
                      : "0"}%
                  </p>
                  <p className="text-sm text-blue-700">ROI</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{transactions.length}</p>
                  <p className="text-sm text-purple-700">Transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de confirmation d'envoi */}
      {showSendConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Confirmer l'envoi
              </h3>
              <button onClick={() => setShowSendConfirm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Destinataire:</span>
                <span className="font-mono text-sm">{recipientAddress.substring(0, 15)}...</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Montant:</span>
                <span className="font-bold text-purple-600">{sendAmount} π</span>
              </div>
              {sendDescription && (
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Description:</span>
                  <span>{sendDescription}</span>
                </div>
              )}
              <div className="flex justify-between p-2 bg-yellow-50 rounded">
                <span className="text-yellow-600">Frais de réseau:</span>
                <span className="text-yellow-600">~0.001 π</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowSendConfirm(false)}>
                Annuler
              </Button>
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={confirmSend}>
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}