import type { RegistrationData, ValidationError } from "@/lib/types/user"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[0-9\s+\-()]+$/

export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return "L'email est requis"
  }
  if (!EMAIL_REGEX.test(email)) {
    return "Veuillez entrer une adresse email valide"
  }
  return null
}

export function validatePhone(phone: string): string | null {
  if (!phone.trim()) {
    return "Le téléphone est requis"
  }
  if (!PHONE_REGEX.test(phone)) {
    return "Veuillez entrer un numéro de téléphone valide"
  }
  if (phone.replace(/\D/g, "").length < 9) {
    return "Le numéro de téléphone doit contenir au moins 9 chiffres"
  }
  return null
}

export function validateRegistrationData(data: RegistrationData): ValidationError[] {
  const errors: ValidationError[] = []

  if (!data.firstName.trim()) {
    errors.push({ field: "firstName", message: "Le prénom est requis" })
  }

  if (!data.lastName.trim()) {
    errors.push({ field: "lastName", message: "Le nom est requis" })
  }

  const emailError = validateEmail(data.email)
  if (emailError) {
    errors.push({ field: "email", message: emailError })
  }

  const phoneError = validatePhone(data.phone)
  if (phoneError) {
    errors.push({ field: "phone", message: phoneError })
  }

  if (!data.country.trim()) {
    errors.push({ field: "country", message: "Le pays est requis" })
  }

  if (!data.profession.trim()) {
    errors.push({ field: "profession", message: "La profession est requise" })
  }

  if (data.specialties.length === 0) {
    errors.push({ field: "specialties", message: "Sélectionnez au moins une spécialité" })
  }

  if (data.languages.length === 0) {
    errors.push({ field: "languages", message: "Sélectionnez au moins une langue" })
  }

  if (data.latitude === null || data.longitude === null) {
    errors.push({ field: "geolocation", message: "La géolocalisation est requise" })
  }

  return errors
}

export function getFieldError(errors: ValidationError[], field: string): string | null {
  const error = errors.find((e) => e.field === field)
  return error?.message || null
}
