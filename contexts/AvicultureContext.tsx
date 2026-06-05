'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { PoultryBatch, HealthRecord, FeedStock, VetService } from '@/lib/aviculture/types'
import {
  getBatches, saveBatches,
  getHealthRecords, saveHealthRecords,
  getFeedStock, saveFeedStock,
} from '@/lib/aviculture/storage'
import { mockBatches, mockHealthRecords, mockFeedStock, mockVetServices } from '@/lib/aviculture/constants'

interface AvicultureContextType {
  batches: PoultryBatch[]
  healthRecords: HealthRecord[]
  feedStock: FeedStock[]
  vetServices: VetService[]
  addBatch: (batch: PoultryBatch) => void
  updateBatch: (batch: PoultryBatch) => void
  deleteBatch: (id: string) => void
  addHealthRecord: (record: HealthRecord) => void
  updateHealthRecord: (record: HealthRecord) => void
  deleteHealthRecord: (id: string) => void
  updateFeedStock: (newStock: FeedStock[]) => void
}

const AvicultureContext = createContext<AvicultureContextType | undefined>(undefined)

export const AvicultureProvider = ({ children }: { children: ReactNode }) => {
  const [batches, setBatches] = useState<PoultryBatch[]>([])
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([])
  const [feedStock, setFeedStock] = useState<FeedStock[]>([])
  const [vetServices] = useState<VetService[]>(mockVetServices)

  useEffect(() => {
    setBatches(getBatches().length ? getBatches() : mockBatches)
    setHealthRecords(getHealthRecords().length ? getHealthRecords() : mockHealthRecords)
    setFeedStock(getFeedStock().length ? getFeedStock() : mockFeedStock)
  }, [])

  const addBatch = (batch: PoultryBatch) => {
    const newBatches = [batch, ...batches]
    setBatches(newBatches)
    saveBatches(newBatches)
  }

  const updateBatch = (batch: PoultryBatch) => {
    const newBatches = batches.map(b => b.id === batch.id ? batch : b)
    setBatches(newBatches)
    saveBatches(newBatches)
  }

  const deleteBatch = (id: string) => {
    const newBatches = batches.filter(b => b.id !== id)
    setBatches(newBatches)
    saveBatches(newBatches)
  }

  const addHealthRecord = (record: HealthRecord) => {
    const newRecords = [record, ...healthRecords]
    setHealthRecords(newRecords)
    saveHealthRecords(newRecords)
  }

  const updateHealthRecord = (record: HealthRecord) => {
    const newRecords = healthRecords.map(r => r.id === record.id ? record : r)
    setHealthRecords(newRecords)
    saveHealthRecords(newRecords)
  }

  const deleteHealthRecord = (id: string) => {
    const newRecords = healthRecords.filter(r => r.id !== id)
    setHealthRecords(newRecords)
    saveHealthRecords(newRecords)
  }

  const updateFeedStock = (newStock: FeedStock[]) => {
    setFeedStock(newStock)
    saveFeedStock(newStock)
  }

  return (
    <AvicultureContext.Provider value={{
      batches, healthRecords, feedStock, vetServices,
      addBatch, updateBatch, deleteBatch,
      addHealthRecord, updateHealthRecord, deleteHealthRecord,
      updateFeedStock,
    }}>
      {children}
    </AvicultureContext.Provider>
  )
}

export const useAviculture = () => {
  const context = useContext(AvicultureContext)
  if (!context) throw new Error('useAviculture must be used within AvicultureProvider')
  return context
}