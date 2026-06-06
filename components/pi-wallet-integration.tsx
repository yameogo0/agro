"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
  X,
  Download,
  Calendar,
  PieChart,
  LineChart,
  Repeat,
  Bell,
  Settings,
  Crown,
} from "lucide-react"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useSubscription } from "@/contexts/SubscriptionContext"
import { showToast, formatDate, formatRelativeTime } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { calculateTransactionTax } from "@/lib/subscription/tax-utils"
import { createDirectPayment, isPiReady } from "@/lib/pi-sdk"

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
  category?: "service" | "transfer" | "subscription" | "product"
  tax?: number
  netAmount?: number
}

interface RecurringPayment {
  id: string
  to: string
  toName: string
  amount: number
  description: string
  frequency: "daily" | "weekly" | "monthly"
  nextDate: string
  active: boolean
}

export default function PiWalletIntegration({ currentLanguage, userRegion }: PiWalletIntegrationProps) {
  const isOnline = useOnlineStatus()
  const { isVif } = useSubscription()
  const [activeTab, setActiveTab] = useState("wallet")
  const [showBalance, setShowBalance] = useState(true)
  const [sendAmount, setSendAmount] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [sendDescription, setSendDescription] = useState("")
  const [showSendConfirm, setShowSendConfirm] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [filterType, setFilterType] = useState<"all" | "sent" | "received">("all")
  const [dateRange, setDateRange] = useState<"all" | "week" | "month" | "year">("all")
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  const [walletData, setWalletData] = useLocalStorage("piWalletData", {
    balance: 15.7834,
    lockedBalance: 2.1567,
    pendingTransactions: 1,
    totalEarned: 45.2341,
    totalSpent: 29.4507,
    totalTaxCollected: 0.0,
    address: "GCKFBEIYTKQTIQ7VIN54JHKOQ2QZSMH6APPQPLZX2BG4O6JJZWRBTPI7",
  })

  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("piTransactions", [
    { id: "tx001", type: "received", amount: 0.008, from: "Dr. Moussa Koné", description: "Consultation vétérinaire", date: new Date(Date.now() - 86400000).toISOString(), status: "completed", txHash: "abc123def456", category: "service" },
    { id: "tx002", type: "sent", amount: 0.015, to: "Formation Aviculture", description: "Cours en ligne aviculture", date: new Date(Date.now() - 172800000).toISOString(), status: "completed", txHash: "def456ghi789", category: "service" },
    { id: "tx003", type: "received", amount: 0.012, from: "Ibrahim Sawadogo", description: "Service de conseil", date: new Date(Date.now() - 259200000).toISOString(), status: "pending", txHash: "ghi789jkl012", category: "service" },
    { id: "tx004", type: "sent", amount: 0.005, to: "Marché Local", description: "Achat d'aliments", date: new Date(Date.now() - 604800000).toISOString(), status: "completed", txHash: "jkl012mno345", category: "product" },
    { id: "tx005", type: "received", amount: 0.025, from: "Coopérative YELEN", description: "Vente poulets", date: new Date(Date.now() - 1209600000).toISOString(), status: "completed", txHash: "mno345pqr678", category: "product" },
  ])

  const [recurringPayments, setRecurringPayments] = useLocalStorage<RecurringPayment[]>("piRecurringPayments", [
    { id: "rec1", to: "GCKF...TPI7", toName: "Dr. Moussa Koné", amount: 0.008, description: "Abonnement conseil", frequency: "monthly", nextDate: "2024-03-01", active: true },
  ])

  const [balanceHistory, setBalanceHistory] = useLocalStorage("piBalanceHistory", [
    { date: "Sem 1", balance: 12.5 },
    { date: "Sem 2", balance: 13.8 },
    { date: "Sem 3", balance: 14.2 },
    { date: "Sem 4", balance: 15.8 },
    { date: "Sem 5", balance: 15.2 },
    { date: "Sem 6", balance: 15.8 },
  ])

  const [newRecurring, setNewRecurring] = useState({
    to: "",
    toName: "",
    amount: "",
    description: "",
    frequency: "monthly",
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showToast("Adresse copiée", "success")
  }

  const refreshWallet = useCallback(async () => {
    if (!isOnline) {
      showToast("Connexion internet requise", "error")
      return
    }
    setIsRefreshing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      const newBalance = walletData.balance + (Math.random() * 0.1 - 0.05)
      setWalletData(prev => ({ ...prev, balance: newBalance }))
      setBalanceHistory(prev => [...prev.slice(1), { date: `Sem ${prev.length + 1}`, balance: newBalance }])
      showToast("Portefeuille actualisé", "success")
    } catch {
      showToast("Erreur lors de l'actualisation", "error")
    } finally {
      setIsRefreshing(false)
    }
  }, [isOnline, setWalletData, walletData.balance])

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

  // ✅ VERSION CORRIGÉE : Envoi réel avec SDK Pi
  const confirmSend = async () => {
    if (!isOnline) {
      showToast("Connexion internet requise", "error")
      return
    }
    
    if (!isPiReady()) {
      showToast("Veuillez ouvrir cette application dans Pi Browser", "error")
      return
    }
    
    setIsSending(true)
    const amount = parseFloat(sendAmount)
    
    try {
      const payment = await createDirectPayment(amount, sendDescription || `Envoi à ${recipientName || recipientAddress}`)
      
      if (payment?.identifier) {
        const newTransaction: Transaction = {
          id: `tx${Date.now()}`,
          type: "sent",
          amount: amount,
          to: recipientAddress,
          description: sendDescription || "Envoi Pi",
          date: new Date().toISOString(),
          status: "completed",
          txHash: payment.identifier,
          category: "transfer",
        }
        
        setTransactions([newTransaction, ...transactions])
        setWalletData(prev => ({
          ...prev,
          balance: prev.balance - amount,
          totalSpent: prev.totalSpent + amount,
        }))
        
        setShowSendConfirm(false)
        setSendAmount("")
        setRecipientAddress("")
        setRecipientName("")
        setSendDescription("")
        showToast(`✅ Envoi de ${amount} π réussi`, "success")
      } else {
        throw new Error("Paiement non confirmé")
      }
    } catch (error: any) {
      console.error("Erreur envoi:", error)
      showToast(error.message || "Erreur lors de l'envoi", "error")
    } finally {
      setIsSending(false)
    }
  }

  const processSaleWithTax = useCallback((amount: number, sellerIsVif: boolean, description: string) => {
    const { tax, netAmount } = calculateTransactionTax(amount, sellerIsVif)
    
    const saleTransaction: Transaction = {
      id: `sale_${Date.now()}`,
      type: "received",
      amount: netAmount,
      from: "Client",
      description: `${description}${tax > 0 ? ` (taxe: ${tax.toFixed(4)} π)` : ""}`,
      date: new Date().toISOString(),
      status: "completed",
      txHash: Math.random().toString(36).substring(2, 15),
      category: "service",
      tax: tax,
      netAmount: netAmount,
    }
    
    setTransactions([saleTransaction, ...transactions])
    setWalletData(prev => ({
      ...prev,
      balance: prev.balance + netAmount,
      totalEarned: prev.totalEarned + netAmount,
      totalTaxCollected: prev.totalTaxCollected + tax,
    }))
    
    if (tax > 0) {
      showToast(`Vente de ${amount} π - Taxe: ${tax.toFixed(4)} π`, "info")
    }
  }, [setTransactions, setWalletData, transactions])

  const addRecurringPayment = () => {
    if (!newRecurring.to || !newRecurring.amount) {
      showToast("Veuillez remplir tous les champs", "error")
      return
    }
    const payment: RecurringPayment = {
      id: `rec${Date.now()}`,
      to: newRecurring.to,
      toName: newRecurring.toName || "Destinataire",
      amount: parseFloat(newRecurring.amount),
      description: newRecurring.description,
      frequency: newRecurring.frequency as any,
      nextDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      active: true,
    }
    setRecurringPayments([...recurringPayments, payment])
    setShowRecurringModal(false)
    setNewRecurring({ to: "", toName: "", amount: "", description: "", frequency: "monthly" })
    showToast("Paiement récurrent ajouté", "success")
  }

  const exportTransactions = () => {
    const csv = [["Date", "Type", "Montant", "Taxe", "Description", "Statut"].join(",")]
    transactions.forEach(tx => {
      csv.push([formatDate(tx.date), tx.type, tx.amount.toString(), (tx.tax || 0).toString(), tx.description, tx.status].join(","))
    })
    const blob = new Blob([csv.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast("Export CSV réussi", "success")
  }

  const filteredTransactions = useMemo(() => {
    let filtered = transactions
    if (filterType !== "all") {
      filtered = filtered.filter(tx => tx.type === filterType)
    }
    if (dateRange !== "all") {
      const now = Date.now()
      const limits = { week: 7 * 86400000, month: 30 * 86400000, year: 365 * 86400000 }
      filtered = filtered.filter(tx => now - new Date(tx.date).getTime() < limits[dateRange])
    }
    return filtered
  }, [transactions, filterType, dateRange])

  const stats = {
    totalEarned: transactions.filter(t => t.type === "received" && t.status === "completed").reduce((s, t) => s + t.amount, 0),
    totalSpent: transactions.filter(t => t.type === "sent" && t.status === "completed").reduce((s, t) => s + t.amount, 0),
    totalTaxCollected: walletData.totalTaxCollected,
    pending: transactions.filter(t => t.status === "pending").length,
    byCategory: {
      service: transactions.filter(t => t.category === "service").reduce((s, t) => s + t.amount, 0),
      product: transactions.filter(t => t.category === "product").reduce((s, t) => s + t.amount, 0),
      transfer: transactions.filter(t => t.category === "transfer").reduce((s, t) => s + t.amount, 0),
    },
  }

  const quickContacts = [
    { name: "Dr. Moussa Koné", address: "GCKF...TPI7", avatar: "M" },
    { name: "Marie Ouédraogo", address: "ABCD...XYZ9", avatar: "M" },
    { name: "Ibrahim Sawadogo", address: "EFGH...UVW2", avatar: "I" },
    { name: "Coopérative YELEN", address: "IJKL...RST5", avatar: "C" },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Bandeau Membre Vif */}
      {isVif && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-300 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Membre Vif - Taxe de vente 0.99%</span>
          </div>
          <Badge className="bg-yellow-100 text-yellow-700">Premium</Badge>
        </div>
      )}

      {/* Wallet Overview */}
      <Card className="bg-gradient-to-r from-purple-700 via-purple-600 to-blue-600 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
        <CardContent className="p-6 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Portefeuille Pi Network</h2>
                <p className="text-purple-100 text-sm">Connecté et sécurisé - {userRegion}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={refreshWallet} disabled={isRefreshing} className="bg-white/20 hover:bg-white/30 text-white border-0">
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setShowQRModal(true)} className="bg-white/20 hover:bg-white/30 text-white border-0">
                <QrCode className="h-4 w-4 mr-2" />QR
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setShowSettingsModal(true)} className="bg-white/20 hover:bg-white/30 text-white border-0">
                <Settings className="h-4 w-4" />
              </Button>
              {!isOnline && <Badge className="bg-yellow-500/20 text-yellow-200 border-yellow-500/30"><WifiOff className="h-3 w-3 mr-1" />Hors ligne</Badge>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-purple-200 text-sm">Solde disponible</span>
                <button onClick={() => setShowBalance(!showBalance)} className="text-white/70 hover:text-white">
                  {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-3xl font-bold mt-1">{showBalance ? `${walletData.balance.toFixed(4)} π` : "•••• π"}</p>
              <p className="text-xs text-purple-200 mt-1">≈ ${(walletData.balance * 45).toFixed(2)} USD</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-purple-200 text-sm">Solde bloqué</p>
              <p className="text-2xl font-bold mt-1">{walletData.lockedBalance.toFixed(4)} π</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-purple-200 text-sm">Taxes collectées</p>
              <p className="text-2xl font-bold mt-1">{walletData.totalTaxCollected.toFixed(4)} π</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-purple-200 text-sm">En attente</p>
              <p className="text-2xl font-bold mt-1">{walletData.pendingTransactions}</p>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <span className="text-sm text-purple-200">Adresse:</span>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-7" onClick={() => copyToClipboard(walletData.address)}>
                <Copy className="h-3 w-3 mr-1" /> Copier
              </Button>
            </div>
            <p className="text-xs font-mono mt-1 break-all opacity-80">
              {walletData.address.substring(0, 20)}...{walletData.address.substring(walletData.address.length - 10)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Graphique d'évolution */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><LineChart className="h-5 w-5" />Évolution du solde</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-32">
            {balanceHistory.map((point, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-purple-500 rounded-t-lg hover:bg-purple-600 transition-all" style={{ height: `${(point.balance / 20) * 100}px` }} />
                <span className="text-xs text-gray-500">{point.date}</span>
                <span className="text-[10px] font-medium">{point.balance.toFixed(1)} π</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="wallet" className="gap-2"><Wallet className="h-4 w-4" />Portefeuille</TabsTrigger>
          <TabsTrigger value="send" className="gap-2"><Send className="h-4 w-4" />Envoyer</TabsTrigger>
          <TabsTrigger value="history" className="gap-2"><History className="h-4 w-4" />Historique</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2"><PieChart className="h-4 w-4" />Analyses</TabsTrigger>
        </TabsList>

        {/* Onglet Portefeuille */}
        <TabsContent value="wallet" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5" />Actions rapides</CardTitle></CardHeader><CardContent className="space-y-3"><Button className="w-full gap-2" onClick={() => setActiveTab("send")}><Send className="h-4 w-4" />Envoyer π</Button><Button variant="outline" className="w-full gap-2" onClick={() => setShowQRModal(true)}><QrCode className="h-4 w-4" />Recevoir (QR Code)</Button><Button variant="outline" className="w-full gap-2" onClick={() => setShowRecurringModal(true)}><Repeat className="h-4 w-4" />Paiement récurrent</Button><Button variant="outline" className="w-full gap-2"><Shield className="h-4 w-4" />Sécurité</Button></CardContent></Card>

            <Card><CardHeader className="flex-row justify-between items-center"><CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />Transactions récentes</CardTitle><Button variant="ghost" size="sm" onClick={() => setActiveTab("history")}>Voir tout</Button></CardHeader><CardContent><div className="space-y-3">{transactions.slice(0, 3).map(tx => (<div key={tx.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"><div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === "received" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>{tx.type === "received" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}</div><div><p className="font-medium text-sm">{tx.type === "received" ? tx.from : tx.to}</p><p className="text-xs text-gray-500">{tx.description}</p>{tx.tax && tx.tax > 0 && <p className="text-[10px] text-gray-400">Taxe: {tx.tax.toFixed(4)} π</p>}</div></div><div className="text-right"><p className={`font-bold ${tx.type === "received" ? "text-green-600" : "text-red-600"}`}>{tx.type === "received" ? "+" : "-"}{tx.amount} π</p><div className="flex items-center gap-1">{tx.status === "completed" ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Clock className="h-3 w-3 text-orange-500" />}<span className="text-xs text-gray-500">{tx.status === "completed" ? "Terminé" : "En attente"}</span></div></div></div>))}</div></CardContent></Card>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <Card><CardContent className="p-4 text-center"><p className="text-xl font-bold text-green-600">{stats.totalEarned.toFixed(4)} π</p><p className="text-xs text-gray-500">Total reçu</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-xl font-bold text-red-600">{stats.totalSpent.toFixed(4)} π</p><p className="text-xs text-gray-500">Total envoyé</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-xl font-bold text-purple-600">{stats.totalTaxCollected.toFixed(4)} π</p><p className="text-xs text-gray-500">Taxes collectées</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-xl font-bold text-blue-600">{(stats.totalEarned - stats.totalSpent).toFixed(4)} π</p><p className="text-xs text-gray-500">Bénéfice net</p></CardContent></Card>
          </div>

          {recurringPayments.filter(p => p.active).length > 0 && (
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Repeat className="h-5 w-5" />Paiements récurrents</CardTitle></CardHeader><CardContent><div className="space-y-3">{recurringPayments.filter(p => p.active).map(p => (<div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><div><p className="font-medium">{p.toName}</p><p className="text-xs text-gray-500">{p.description} • {p.frequency}</p><p className="text-xs text-purple-600">Prochain: {p.nextDate}</p></div><div className="text-right"><p className="font-bold text-purple-600">{p.amount} π</p><Badge className="bg-blue-100 text-blue-700">Actif</Badge></div></div>))}</div></CardContent></Card>
          )}
        </TabsContent>

        {/* Onglet Envoyer */}
        <TabsContent value="send" className="mt-6 space-y-4">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Send className="h-5 w-5" />Envoyer des Pi</CardTitle></CardHeader><CardContent className="space-y-4">
            <div><label className="text-sm font-medium">Adresse du destinataire</label><Input placeholder="Adresse Pi" value={recipientAddress} onChange={e => setRecipientAddress(e.target.value)} /></div>
            <div><label className="text-sm font-medium">Nom (optionnel)</label><Input placeholder="Nom du destinataire" value={recipientName} onChange={e => setRecipientName(e.target.value)} /></div>
            <div><label className="text-sm font-medium">Montant (π)</label><div className="relative"><Input type="number" step="0.001" placeholder="0.000" value={sendAmount} onChange={e => setSendAmount(e.target.value)} className="pr-12" /><div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">π</div></div><p className="text-xs text-gray-500 mt-1">Solde: {walletData.balance.toFixed(4)} π</p></div>
            <div><label className="text-sm font-medium">Description</label><Input placeholder="Motif du paiement" value={sendDescription} onChange={e => setSendDescription(e.target.value)} /></div>
            <div className="bg-yellow-50 p-3 rounded-lg flex items-start gap-2"><AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" /><p className="text-sm text-yellow-800">Les transactions Pi sont irréversibles. Vérifiez bien l'adresse.</p></div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleSendPi} disabled={!sendAmount || !recipientAddress}><Send className="h-4 w-4 mr-2" />Envoyer {sendAmount || "0"} π</Button>
          </CardContent></Card>

          <Card><CardHeader><CardTitle>Envoi rapide</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{quickContacts.map((c, i) => (<div key={i} className="text-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-all" onClick={() => { setRecipientAddress(c.address); setRecipientName(c.name); }}><div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-blue-600 text-lg">{c.avatar}</div><p className="text-sm font-medium">{c.name}</p><p className="text-xs text-gray-500">{c.address}</p></div>))}</div></CardContent></Card>
        </TabsContent>

        {/* Onglet Historique */}
        <TabsContent value="history" className="mt-6 space-y-4">
          <Card>
            <CardHeader className="flex-row flex-wrap justify-between items-center gap-2">
              <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />Historique</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <select className="text-sm border rounded-lg px-2 py-1" value={filterType} onChange={e => setFilterType(e.target.value as any)}><option value="all">Toutes</option><option value="sent">Envoyées</option><option value="received">Reçues</option></select>
                <select className="text-sm border rounded-lg px-2 py-1" value={dateRange} onChange={e => setDateRange(e.target.value as any)}><option value="all">Toutes dates</option><option value="week">7 jours</option><option value="month">30 jours</option><option value="year">12 mois</option></select>
                <Button variant="outline" size="sm" onClick={exportTransactions}><Download className="h-4 w-4 mr-1" />CSV</Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (<div className="text-center py-8 text-gray-400"><History className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>Aucune transaction</p></div>) : (<div className="space-y-3">{filteredTransactions.map(tx => (<div key={tx.id} className="flex flex-col sm:flex-row justify-between p-4 border rounded-lg hover:shadow-md transition-all"><div className="flex items-center gap-4 mb-3 sm:mb-0"><div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "received" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>{tx.type === "received" ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}</div><div><p className="font-medium">{tx.type === "received" ? `Reçu de ${tx.from}` : `Envoyé à ${tx.to}`}</p><p className="text-sm text-gray-500">{tx.description}</p>{tx.tax && tx.tax > 0 && <p className="text-xs text-purple-600">Taxe: {tx.tax.toFixed(4)} π</p>}<p className="text-xs text-gray-400">{formatRelativeTime(tx.date)}</p></div></div><div className="text-right"><p className={`text-lg font-bold ${tx.type === "received" ? "text-green-600" : "text-red-600"}`}>{tx.type === "received" ? "+" : "-"}{tx.amount} π</p><div className="flex justify-end gap-2"><Badge variant={tx.status === "completed" ? "default" : "secondary"}>{tx.status === "completed" ? "Terminé" : "En attente"}</Badge><Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToClipboard(tx.txHash)}><Copy className="h-3 w-3" /></Button></div><p className="text-xs text-gray-400 font-mono mt-1">{tx.txHash.substring(0, 10)}...</p></div></div>))}</div>)}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Analyses */}
        <TabsContent value="analytics" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5" />Dépenses par catégorie</CardTitle></CardHeader><CardContent><div className="space-y-3"><div><div className="flex justify-between text-sm mb-1"><span>Services</span><span className="font-medium">{stats.byCategory.service.toFixed(4)} π</span></div><Progress value={(stats.byCategory.service / stats.totalSpent) * 100 || 0} className="h-2" /></div><div><div className="flex justify-between text-sm mb-1"><span>Produits</span><span className="font-medium">{stats.byCategory.product.toFixed(4)} π</span></div><Progress value={(stats.byCategory.product / stats.totalSpent) * 100 || 0} className="h-2" /></div><div><div className="flex justify-between text-sm mb-1"><span>Transferts</span><span className="font-medium">{stats.byCategory.transfer.toFixed(4)} π</span></div><Progress value={(stats.byCategory.transfer / stats.totalSpent) * 100 || 0} className="h-2" /></div></div></CardContent></Card>

            <Card><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Statistiques</CardTitle></CardHeader><CardContent><div className="space-y-3"><div className="flex justify-between"><span className="text-gray-500">Total transactions</span><span className="font-bold">{transactions.length}</span></div><div className="flex justify-between"><span className="text-gray-500">Taux de succès</span><span className="font-bold text-green-600">{((transactions.filter(t => t.status === "completed").length / transactions.length) * 100).toFixed(1)}%</span></div><div className="flex justify-between"><span className="text-gray-500">Montant moyen reçu</span><span className="font-bold">{(stats.totalEarned / transactions.filter(t => t.type === "received").length || 0).toFixed(4)} π</span></div><div className="flex justify-between"><span className="text-gray-500">Montant moyen envoyé</span><span className="font-bold">{(stats.totalSpent / transactions.filter(t => t.type === "sent").length || 0).toFixed(4)} π</span></div><div className="flex justify-between"><span className="text-gray-500">Taxes collectées</span><span className="font-bold text-purple-600">{stats.totalTaxCollected.toFixed(4)} π</span></div></div></CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de confirmation d'envoi */}
      {showSendConfirm && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-xl p-6 max-w-md w-full mx-4"><div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold flex items-center gap-2"><AlertCircle className="h-5 w-5 text-yellow-500" />Confirmer l'envoi</h3><button onClick={() => setShowSendConfirm(false)}><X className="h-5 w-5" /></button></div><div className="space-y-3 mb-4"><div className="flex justify-between p-2 bg-gray-50 rounded"><span>Destinataire:</span><span className="font-mono text-sm">{recipientAddress.substring(0, 15)}...</span></div>{recipientName && <div className="flex justify-between p-2 bg-gray-50 rounded"><span>Nom:</span><span>{recipientName}</span></div>}<div className="flex justify-between p-2 bg-gray-50 rounded"><span>Montant:</span><span className="font-bold text-purple-600">{sendAmount} π</span></div>{sendDescription && <div className="flex justify-between p-2 bg-gray-50 rounded"><span>Description:</span><span>{sendDescription}</span></div>}<div className="flex justify-between p-2 bg-yellow-50 rounded"><span>Frais réseau:</span><span className="text-yellow-600">~0.001 π</span></div></div><div className="flex gap-3"><Button variant="outline" className="flex-1" onClick={() => setShowSendConfirm(false)}>Annuler</Button><Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={confirmSend} disabled={isSending}>{isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer"}</Button></div></div></div>)}

      {/* Modal QR Code */}
      {showQRModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 text-center"><div className="flex justify-end"><button onClick={() => setShowQRModal(false)} className="text-gray-400"><X className="h-5 w-5" /></button></div><div className="w-48 h-48 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto my-4"><QrCode className="h-32 w-32 text-white" /></div><p className="font-mono text-xs break-all bg-gray-100 p-2 rounded-lg">{walletData.address}</p><Button className="mt-4 w-full gap-2" onClick={() => copyToClipboard(walletData.address)}><Copy className="h-4 w-4" />Copier l'adresse</Button><p className="text-xs text-gray-500 mt-3">Scannez pour recevoir des Pi</p></div></div>)}

      {/* Modal paiement récurrent */}
      {showRecurringModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-xl p-6 max-w-md w-full mx-4"><div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold flex items-center gap-2"><Repeat className="h-5 w-5" />Paiement récurrent</h3><button onClick={() => setShowRecurringModal(false)}><X className="h-5 w-5" /></button></div><div className="space-y-4"><div><label className="text-sm font-medium">Adresse destinataire</label><Input placeholder="Adresse Pi" value={newRecurring.to} onChange={e => setNewRecurring({ ...newRecurring, to: e.target.value })} /></div><div><label className="text-sm font-medium">Nom</label><Input placeholder="Nom" value={newRecurring.toName} onChange={e => setNewRecurring({ ...newRecurring, toName: e.target.value })} /></div><div><label className="text-sm font-medium">Montant (π)</label><Input type="number" step="0.001" placeholder="0.000" value={newRecurring.amount} onChange={e => setNewRecurring({ ...newRecurring, amount: e.target.value })} /></div><div><label className="text-sm font-medium">Description</label><Input placeholder="Motif" value={newRecurring.description} onChange={e => setNewRecurring({ ...newRecurring, description: e.target.value })} /></div><div><label className="text-sm font-medium">Fréquence</label><select className="w-full p-2 border rounded" value={newRecurring.frequency} onChange={e => setNewRecurring({ ...newRecurring, frequency: e.target.value })}><option value="weekly">Hebdomadaire</option><option value="monthly">Mensuel</option></select></div><Button className="w-full bg-purple-600" onClick={addRecurringPayment}>Ajouter</Button></div></div></div>)}

      {/* Modal paramètres */}
      {showSettingsModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-xl p-6 max-w-md w-full mx-4"><div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold flex items-center gap-2"><Settings className="h-5 w-5" />Paramètres</h3><button onClick={() => setShowSettingsModal(false)}><X className="h-5 w-5" /></button></div><div className="space-y-4"><div className="flex justify-between items-center"><div><p className="font-medium">Notifications</p><p className="text-xs text-gray-500">Alertes de transactions</p></div><Badge className="bg-green-100 text-green-700">Activées</Badge></div><div className="flex justify-between items-center"><div><p className="font-medium">Authentification 2FA</p><p className="text-xs text-gray-500">Sécurité renforcée</p></div><Badge className="bg-green-100 text-green-700">Activée</Badge></div><div className="flex justify-between items-center"><div><p className="font-medium">Mode hors ligne</p><p className="text-xs text-gray-500">Données en cache</p></div><Badge className="bg-blue-100 text-blue-700">Actif</Badge></div><div className="pt-4 border-t"><Button variant="destructive" className="w-full">Déconnecter le portefeuille</Button></div></div></div></div>)}
    </div>
  )
}