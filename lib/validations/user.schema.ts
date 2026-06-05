// lib/validations/user.schema.ts

import { z } from 'zod'

// Schéma utilisateur complet
export const userSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(3, 'Nom d\'utilisateur trop court').max(30),
  email: z.string().email('Email invalide').optional(),
  phone: z.string().regex(/^\+?[0-9]{8,15}$/, 'Téléphone invalide').optional(),
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  profession: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  piWalletAddress: z.string().optional(),
  isVif: z.boolean().default(false),
  vifExpiryDate: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

// Schéma pour la mise à jour des préférences
export const userPreferencesSchema = z.object({
  notificationsEnabled: z.boolean().default(true),
  darkMode: z.boolean().default(false),
  autoSync: z.boolean().default(true),
  language: z.enum(['fr', 'en']).default('fr'),
})

// Schéma pour la modification du profil (champs modifiables)
export const userUpdateSchema = userSchema.partial().omit({ id: true, createdAt: true, updatedAt: true })