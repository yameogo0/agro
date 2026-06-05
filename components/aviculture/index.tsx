'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OverviewTab } from './OverviewTab'
import { BatchesTab } from './BatchesTab'
import { HealthTab } from './HealthTab'
import { FeedingTab } from './FeedingTab'
import { ServicesTab } from './ServicesTab'
import { AvicultureProvider } from '@/contexts/AvicultureContext'

interface AvicultureManagementProps {
  currentLanguage: string
  userRegion: string
}

export default function AvicultureManagement({ currentLanguage, userRegion }: AvicultureManagementProps) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <AvicultureProvider>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">🐔 Gestion Avicole</h2>
          <p className="text-gray-500 text-sm">Gérez vos élevages de volailles - {userRegion}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 gap-2">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="batches">Mes lots</TabsTrigger>
            <TabsTrigger value="health">Santé</TabsTrigger>
            <TabsTrigger value="feeding">Alimentation</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OverviewTab /></TabsContent>
          <TabsContent value="batches"><BatchesTab /></TabsContent>
          <TabsContent value="health"><HealthTab /></TabsContent>
          <TabsContent value="feeding"><FeedingTab /></TabsContent>
          <TabsContent value="services"><ServicesTab /></TabsContent>
        </Tabs>
      </div>
    </AvicultureProvider>
  )
}