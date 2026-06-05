// lib/validations/auth.schema.ts

// Validation simple sans Zod
export const validateRegister = (data: any) => {
  const errors: string[] = []
  if (!data.firstName || data.firstName.length < 2) {
    errors.push('Le prénom doit contenir au moins 2 caractères')
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Email invalide')
  }
  if (data.phone && !/^\+?[0-9]{8,15}$/.test(data.phone)) {
    errors.push('Téléphone invalide (8-15 chiffres)')
  }
  if (!data.country) {
    errors.push('Pays requis')
  }
  return { valid: errors.length === 0, errors }
}

export const registerSchema = { validate: validateRegister }
export const loginSchema = { validate: () => ({ valid: true, errors: [] }) }
export const updateProfileSchema = { validate: () => ({ valid: true, errors: [] }) }