"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  MessageSquare,
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  UserPlus,
  Star,
  Circle,
  CheckCircle2,
  MapPin,
  Users,
  Bell,
  Settings,
  Filter,
  ImageIcon,
  File,
  Mic,
  Pi,
  Wallet,
  Check,
  Clock,
  Reply,
  Copy,
  Trash2,
  Pin,
  Archive,
  Flag,
  Volume2,
  VolumeX,
  Download,
  Share2,
  ExternalLink,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff,
} from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useDebounce } from "@/hooks/use-debounce"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { showToast, formatRelativeTime } from "@/lib/utils"

interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  read: boolean
  delivered: boolean
  type: "text" | "image" | "file" | "audio" | "payment"
  amount?: number
  replyTo?: Message
}

interface Conversation {
  id: string
  participants: {
    id: string
    name: string
    avatar: string
    online: boolean
    lastSeen?: string
    location?: string
    profession?: string
    rating?: number
    verified?: boolean
  }[]
  lastMessage: Message
  unreadCount: number
  pinned: boolean
  archived: boolean
  isGroup?: boolean
  groupName?: string
  groupAvatar?: string
  groupMembers?: number
}

interface MessagingSystemProps {
  currentLanguage: string
  userRegion: string
}

// Traductions
const translations: Record<string, any> = {
  fr: {
    messages: "Messages",
    search: "Rechercher une conversation...",
    noConversations: "Aucune conversation",
    noMessages: "Aucun message",
    typeMessage: "Écrivez votre message...",
    online: "En ligne",
    offline: "Hors ligne",
    yesterday: "Hier",
    copied: "Copié",
    paymentRequest: "Demande de paiement",
    amount: "Montant",
    send: "Envoyer",
    pay: "Payer",
    cancel: "Annuler",
    reply: "Répondre",
    delete: "Supprimer",
    copy: "Copier",
    pin: "Épingler",
    archive: "Archiver",
    unarchive: "Désarchiver",
    loading: "Chargement...",
    today: "Aujourd'hui",
    thisWeek: "Cette semaine",
    thisMonth: "Ce mois-ci",
    older: "Plus ancien",
    typing: "est en train d'écrire...",
    selectConversation: "Sélectionnez une conversation",
    selectConversationDesc: "Choisissez un contact pour commencer à discuter",
    discoverUsers: "Découvrir des utilisateurs",
    archived: "Archivés",
    all: "Tous",
  },
  en: {
    messages: "Messages",
    search: "Search conversations...",
    noConversations: "No conversations",
    noMessages: "No messages",
    typeMessage: "Type your message...",
    online: "Online",
    offline: "Offline",
    yesterday: "Yesterday",
    copied: "Copied",
    paymentRequest: "Payment request",
    amount: "Amount",
    send: "Send",
    pay: "Pay",
    cancel: "Cancel",
    reply: "Reply",
    delete: "Delete",
    copy: "Copy",
    pin: "Pin",
    archive: "Archive",
    unarchive: "Unarchive",
    loading: "Loading...",
    today: "Today",
    thisWeek: "This week",
    thisMonth: "This month",
    older: "Older",
    typing: "is typing...",
    selectConversation: "Select a conversation",
    selectConversationDesc: "Choose a contact to start chatting",
    discoverUsers: "Discover users",
    archived: "Archived",
    all: "All",
  },
}

// Données de démonstration
const demoConversations: Conversation[] = [
  {
    id: "1",
    participants: [{
      id: "user1",
      name: "Dr. Aminata Traoré",
      avatar: "AT",
      online: true,
      location: "Ouagadougou",
      profession: "Vétérinaire",
      rating: 4.9,
      verified: true,
    }],
    lastMessage: {
      id: "msg1",
      senderId: "user1",
      senderName: "Dr. Aminata Traoré",
      content: "Bonjour, comment puis-je vous aider avec votre élevage ?",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      delivered: true,
      type: "text",
    },
    unreadCount: 2,
    pinned: false,
    archived: false,
  },
  {
    id: "2",
    participants: [{
      id: "user2",
      name: "Coopérative YELEN",
      avatar: "CY",
      online: false,
      lastSeen: new Date(Date.now() - 1800000).toISOString(),
      location: "Bobo-Dioulasso",
      profession: "Coopérative agricole",
      rating: 4.7,
      verified: true,
    }],
    lastMessage: {
      id: "msg2",
      senderId: "current",
      senderName: "Vous",
      content: "Quels sont vos prix pour les aliments ?",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: true,
      delivered: true,
      type: "text",
    },
    unreadCount: 0,
    pinned: true,
    archived: false,
    isGroup: true,
    groupName: "Coopérative YELEN",
    groupMembers: 12,
  },
  {
    id: "3",
    participants: [{
      id: "user3",
      name: "Ibrahim Sawadogo",
      avatar: "IS",
      online: true,
      location: "Koudougou",
      profession: "Agriculteur",
      rating: 4.6,
      verified: false,
    }],
    lastMessage: {
      id: "msg3",
      senderId: "user3",
      senderName: "Ibrahim Sawadogo",
      content: "Merci pour les semences, très bonne qualité !",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true,
      delivered: true,
      type: "text",
    },
    unreadCount: 0,
    pinned: false,
    archived: false,
  },
]

export default function MessagingSystem({ currentLanguage, userRegion }: MessagingSystemProps) {
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("messages")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  const isOnline = useOnlineStatus()
  const { userData } = usePiAuth()
  const debouncedSearch = useDebounce(searchQuery, 300)

  const [conversations, setConversations] = useLocalStorage<Conversation[]>("conversations", demoConversations)
  const [messages, setMessages] = useLocalStorage<Record<string, Message[]>>("messages", {
    "1": [
      {
        id: "m1",
        senderId: "user1",
        senderName: "Dr. Aminata Traoré",
        content: "Bonjour ! Comment puis-je vous aider ?",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: true,
        delivered: true,
        type: "text",
      },
      {
        id: "m2",
        senderId: "current",
        senderName: "Vous",
        content: "J'ai besoin de conseils pour la vaccination de mes poules.",
        timestamp: new Date(Date.now() - 82800000).toISOString(),
        read: true,
        delivered: true,
        type: "text",
      },
      {
        id: "m3",
        senderId: "user1",
        senderName: "Dr. Aminata Traoré",
        content: "Je vous conseille de vacciner contre Newcastle à 4 semaines.",
        timestamp: new Date(Date.now() - 72000000).toISOString(),
        read: true,
        delivered: true,
        type: "text",
      },
    ],
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const t = translations[currentLanguage as keyof typeof translations] || translations.fr

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768 && activeConversation) {
        setShowSidebar(false)
      } else if (window.innerWidth >= 768) {
        setShowSidebar(true)
      }
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [activeConversation])

  // Scroll automatique vers le dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, activeConversation])

  const sendMessage = useCallback(async (content: string, type: string = "text", replyTo?: Message) => {
    if (!activeConversation || !content.trim() || !isOnline) return

    setIsSending(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      const newMsg: Message = {
        id: Date.now().toString(),
        senderId: "current",
        senderName: userData?.username || "Vous",
        content,
        timestamp: new Date().toISOString(),
        read: true,
        delivered: true,
        type: type as any,
        amount: type === "payment" ? parseFloat(content) : undefined,
        replyTo,
      }

      setMessages(prev => ({
        ...prev,
        [activeConversation]: [...(prev[activeConversation] || []), newMsg],
      }))

      // Mettre à jour le dernier message de la conversation
      setConversations(prev => prev.map(conv =>
        conv.id === activeConversation
          ? { ...conv, lastMessage: newMsg, unreadCount: 0 }
          : conv
      ))

      setNewMessage("")
      setReplyToMessage(null)
    } catch (error) {
      showToast("Erreur lors de l'envoi", "error")
    } finally {
      setIsSending(false)
    }
  }, [activeConversation, isOnline, userData, setMessages, setConversations])

  const sendPayment = useCallback(async () => {
    if (!paymentAmount || !activeConversation) return

    const amount = parseFloat(paymentAmount)
    await sendMessage(`Paiement de ${amount} π`, "payment")
    setShowPaymentModal(false)
    setPaymentAmount("")
    showToast("Paiement envoyé avec succès", "success")
  }, [paymentAmount, activeConversation, sendMessage])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showToast(t.copied, "success")
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)

    if (hours < 1) return "à l'instant"
    if (hours < 24) return `il y a ${hours}h`
    if (hours < 48) return t.yesterday
    return date.toLocaleDateString([], { day: "2-digit", month: "2-digit" })
  }

  const handleSelectConversation = (convId: string) => {
    setActiveConversation(convId)
    if (isMobile) setShowSidebar(false)
    // Marquer comme lu
    setConversations(prev => prev.map(conv =>
      conv.id === convId ? { ...conv, unreadCount: 0 } : conv
    ))
  }

  const handleBackToList = () => {
    setShowSidebar(true)
    setActiveConversation(null)
  }

  const getParticipant = (conv: Conversation) => conv.participants[0]
  const currentMessages = activeConversation ? (messages[activeConversation] || []) : []
  const currentConv = conversations.find(c => c.id === activeConversation)

  return (
    <div className="h-[600px] md:h-[700px] flex bg-white rounded-xl border shadow-lg overflow-hidden relative">
      {/* Sidebar - Liste des conversations */}
      {(showSidebar || !isMobile) && (
        <div className={`${isMobile ? 'absolute inset-0 z-10 bg-white' : 'w-80'} border-r flex flex-col`}>
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              {t.messages}
            </h2>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.filter(conv => !conv.archived).length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">{t.noConversations}</p>
              </div>
            ) : (
              conversations.filter(conv => !conv.archived).map((conv) => {
                const participant = getParticipant(conv)
                const name = conv.isGroup ? conv.groupName : participant?.name
                const avatar = conv.isGroup ? conv.groupAvatar : participant?.avatar
                const isOnline_status = !conv.isGroup && participant?.online

                return (
                  <div
                    key={conv.id}
                    className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-all ${
                      activeConversation === conv.id ? "bg-green-50 border-r-2 border-green-500" : ""
                    }`}
                    onClick={() => handleSelectConversation(conv.id)}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-lg">
                          {avatar?.substring(0, 2) || "👤"}
                        </AvatarFallback>
                      </Avatar>
                      {isOnline_status && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{name}</p>
                        <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                          {formatMessageTime(conv.lastMessage.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-gray-500 truncate flex-1">
                          {conv.lastMessage.senderId === "current" && "Vous: "}
                          {conv.lastMessage.type === "payment" ? "💰 Paiement" : conv.lastMessage.content}
                        </p>
                        {conv.unreadCount > 0 && (
                          <Badge className="bg-green-500 text-white ml-2 flex-shrink-0 text-[10px] px-1.5">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Zone de chat */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConversation && currentConv ? (
          <>
            {/* Header du chat */}
            <div className="p-3 border-b flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleBackToList}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gray-100">
                    {currentConv.isGroup ? "👥" : getParticipant(currentConv)?.avatar?.substring(0, 2) || "👤"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-sm">
                    {currentConv.isGroup ? currentConv.groupName : getParticipant(currentConv)?.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    {currentConv.isGroup ? (
                      <span>{currentConv.groupMembers} membres</span>
                    ) : (
                      <>
                        {getParticipant(currentConv)?.online ? (
                          <span className="text-green-600">{t.online}</span>
                        ) : (
                          <span>{t.offline}</span>
                        )}
                        {getParticipant(currentConv)?.location && (
                          <>
                            <span>•</span>
                            <span>{getParticipant(currentConv)?.location}</span>
                          </>
                        )}
                      </>
                    )}
                    {getParticipant(currentConv)?.rating && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Star className="h-2.5 w-2.5 text-yellow-500 fill-current" />
                          {getParticipant(currentConv)?.rating}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {currentMessages.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">{t.noMessages}</p>
                </div>
              ) : (
                currentMessages.map((message, idx) => {
                  const isCurrentUser = message.senderId === "current"
                  const showAvatar = !isCurrentUser && (idx === 0 || currentMessages[idx-1]?.senderId !== message.senderId)

                  return (
                    <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} group`}>
                      <div className="flex items-end gap-2 max-w-[80%]">
                        {!isCurrentUser && showAvatar && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="bg-gray-200 text-xs">
                              {getParticipant(currentConv)?.avatar?.substring(0, 2) || "👤"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {!isCurrentUser && !showAvatar && <div className="w-8 flex-shrink-0" />}

                        <div className="relative">
                          <div className={`px-3 py-2 rounded-2xl ${
                            isCurrentUser ? "bg-green-600 text-white" : "bg-white text-gray-900 shadow-sm"
                          }`}>
                            {message.replyTo && (
                              <div className={`text-[10px] p-1.5 rounded mb-1 ${
                                isCurrentUser ? "bg-green-700" : "bg-gray-100"
                              }`}>
                                <p className="font-medium">↳ {message.replyTo.senderName}</p>
                                <p className="truncate">{message.replyTo.content.substring(0, 50)}</p>
                              </div>
                            )}
                            {message.type === "text" && <p className="text-sm">{message.content}</p>}
                            {message.type === "payment" && (
                              <div className={`flex items-center gap-2 p-2 rounded-lg ${
                                isCurrentUser ? "bg-green-700" : "bg-gray-50 border"
                              }`}>
                                <Pi className="h-5 w-5 text-purple-500" />
                                <div>
                                  <p className="text-sm font-medium">{message.amount} π</p>
                                  <p className="text-[10px] opacity-75">Paiement</p>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <span className={`text-[9px] ${isCurrentUser ? "text-green-200" : "text-gray-400"}`}>
                                {formatMessageTime(message.timestamp)}
                              </span>
                              {isCurrentUser && message.delivered && (
                                <CheckCircle2 className="h-2.5 w-2.5 text-green-200" />
                              )}
                            </div>
                          </div>

                          {/* Actions au survol */}
                          <div className={`absolute top-0 ${isCurrentUser ? "-left-7" : "-right-7"} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 bg-white shadow-sm rounded-full" onClick={() => setReplyToMessage(message)}>
                              <Reply className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 bg-white shadow-sm rounded-full" onClick={() => copyToClipboard(message.content)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Zone de saisie */}
            <div className="p-3 border-t bg-white">
              {replyToMessage && (
                <div className="bg-gray-100 rounded-lg p-2 mb-2 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Réponse à {replyToMessage.senderName}</p>
                    <p className="text-xs truncate">{replyToMessage.content}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setReplyToMessage(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full" onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder={t.typeMessage}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(newMessage, "text")}
                    className="pr-20 rounded-full text-sm"
                    disabled={!isOnline}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 px-2 text-xs rounded-full"
                    onClick={() => setShowPaymentModal(true)}
                    disabled={!isOnline}
                  >
                    <Pi className="h-3 w-3 mr-1" />π
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={() => sendMessage(newMessage, "text")}
                  disabled={!newMessage.trim() || !isOnline || isSending}
                  className="bg-green-600 hover:bg-green-700 rounded-full h-8 w-8 p-0"
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              {!isOnline && (
                <p className="text-xs text-red-500 mt-2 text-center">⚠️ Vous êtes hors ligne</p>
              )}
              <input type="file" ref={fileInputRef} className="hidden" />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center p-4">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">{t.selectConversation}</p>
              <p className="text-sm text-gray-400">{t.selectConversationDesc}</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal paiement Pi */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Wallet className="h-5 w-5 text-purple-600" />
                {t.paymentRequest}
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Envoyer à: <span className="font-medium">{getParticipant(currentConv!)?.name}</span>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">{t.amount} (π)</label>
              <Input
                type="number"
                step="0.001"
                placeholder="0.008"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="text-lg"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowPaymentModal(false)}>
                {t.cancel}
              </Button>
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700 gap-2" onClick={sendPayment} disabled={!paymentAmount}>
                <Pi className="h-4 w-4" />
                {t.pay}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}