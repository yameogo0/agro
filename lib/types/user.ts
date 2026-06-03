export interface RegistrationData {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  region: string
  city: string
  profession: string
  specialties: string[]
  languages: string[]
  piWalletAddress: string
  latitude: number | null
  longitude: number | null
}

export interface ValidationError {
  field: string
  message: string
}

export interface Country {
  name: string
  code: string
  flag: string
  continent: string
}

export interface NavigationItem {
  id: string
  label: string
  icon: any
}
