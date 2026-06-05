// components/subscription/SubscriptionBadge.tsx

"use client"

import { Crown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useSubscription } from '@/contexts/SubscriptionContext'

interface SubscriptionBadgeProps {
  showIcon?: boolean
  className?: string
}

export function SubscriptionBadge({ showIcon = true, className = '' }: SubscriptionBadgeProps) {
  const { isVif } = useSubscription()

  if (!isVif) return null

  return (
    <Badge className={`bg-yellow-100 text-yellow-700 border-yellow-200 ${className}`}>
      {showIcon && <Crown className="h-3 w-3 mr-1" />}
      Membre Vif
    </Badge>
  )
}