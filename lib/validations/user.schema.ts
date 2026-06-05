// lib/validations/user.schema.ts

export const validateUser = (data: any) => {
  const errors: string[] = []
  if (!data.username || data.username.length < 3) {
    errors.push('Nom d\'utilisateur trop court (minimum 3 caractères)')
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Email invalide')
  }
  return { valid: errors.length === 0, errors }
}

export const userSchema = { validate: validateUser }
export const userPreferencesSchema = { validate: () => ({ valid: true, errors: [] }) }
export const userUpdateSchema = { validate: () => ({ valid: true, errors: [] }) }