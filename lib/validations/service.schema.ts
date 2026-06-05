// lib/validations/service.schema.ts

export const validateService = (data: any) => {
  const errors: string[] = []
  if (!data.title || data.title.length < 5) {
    errors.push('Le titre doit contenir au moins 5 caractères')
  }
  if (!data.description || data.description.length < 20) {
    errors.push('La description doit contenir au moins 20 caractères')
  }
  if (!data.price || data.price <= 0) {
    errors.push('Le prix doit être positif')
  }
  return { valid: errors.length === 0, errors }
}

export const serviceSchema = { validate: validateService }
export const bookingSchema = { validate: () => ({ valid: true, errors: [] }) }
export const bookingStatusSchema = { validate: () => ({ valid: true, errors: [] }) }