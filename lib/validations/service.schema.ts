// lib/validations/service.schema.ts

import { z } from 'zod'

// Schéma pour créer/modifier un service
export const serviceSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères').max(100, 'Titre trop long'),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères').max(2000, 'Description trop longue'),
  category: z.enum(['veterinary', 'training', 'consulting', 'equipment', 'feed', 'processing', 'marketing', 'finance']),
  price: z.number().positive('Le prix doit être positif').min(0.001, 'Prix minimum 0.001 π'),
  duration: z.string().optional(),
  availability: z.enum(['available', 'busy']).default('available'),
  tags: z.array(z.string()).max(5, 'Maximum 5 tags').optional(),
  location: z.string().optional(),
  requirements: z.string().optional(),
})

// Schéma pour la réservation d'un service
export const bookingSchema = z.object({
  serviceId: z.string().min(1, 'ID du service requis'),
  clientName: z.string().min(2, 'Nom du client requis'),
  clientPhone: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date au format YYYY-MM-DD'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Heure au format HH:MM'),
  notes: z.string().optional(),
})

// Schéma pour la mise à jour du statut d'une réservation
export const bookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
})