// lib/validations/auth.schema.ts

import { z } from 'zod'

// Schéma d'inscription
export const registerSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  email: z.string().email('Email invalide').optional(),
  phone: z.string().regex(/^\+?[0-9]{8,15}$/, 'Téléphone invalide (8-15 chiffres)').optional(),
  country: z.string().min(2, 'Pays requis'),
  region: z.string().optional(),
  city: z.string().optional(),
  profession: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  piWalletAddress: z.string().optional(),
})

// Schéma de connexion (via Pi Network - pas de mot de passe)
export const loginSchema = z.object({
  // Pi Network utilise l'authentification via le SDK, pas de champs classiques
  accessToken: z.string().optional(),
  userUid: z.string().optional(),
})

// Schéma de mise à jour du profil
export const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[0-9]{8,15}$/).optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  profession: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  piWalletAddress: z.string().optional(),
})