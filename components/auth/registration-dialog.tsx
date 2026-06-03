"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { RegistrationData, ValidationError } from "@/lib/types/user"
import { WORLD_COUNTRIES } from "@/lib/constants/countries"
import { PROFESSIONS } from "@/lib/constants/professions"
import { SPECIALTIES } from "@/lib/constants/specialties"
import { AVAILABLE_LANGUAGES } from "@/lib/constants/languages"
import { validateRegistrationData, getFieldError } from "@/lib/validators"

interface RegistrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRegistration: (data: RegistrationData) => void
}

const initialRegistrationData: RegistrationData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "",
  region: "",
  city: "",
  profession: "",
  specialties: [],
  languages: [],
  piWalletAddress: "",
  latitude: null,
  longitude: null,
}

export default function RegistrationDialog({ open, onOpenChange, onRegistration }: RegistrationDialogProps) {
  const [data, setData] = useState<RegistrationData>(initialRegistrationData)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [isGeolocationLoading, setIsGeolocationLoading] = useState(false)

  const handleSubmit = () => {
    const validationErrors = validateRegistrationData(data)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    onRegistration(data)
    setData(initialRegistrationData)
    setErrors([])
  }

  const handleGeolocation = () => {
    setIsGeolocationLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("[v0] Geolocation success:", position.coords.latitude, position.coords.longitude)
          setData({
            ...data,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          setIsGeolocationLoading(false)
        },
        (error) => {
          console.error("[v0] Geolocation error:", error.message)
          setIsGeolocationLoading(false)
        },
      )
    }
  }

  const updateField = (field: keyof RegistrationData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }))
    setErrors(errors.filter((e) => e.field !== field))
  }

  const toggleSpecialty = (specialty: string) => {
    setData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }))
  }

  const toggleLanguage = (language: string) => {
    setData((prev) => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter((l) => l !== language)
        : [...prev.languages, language],
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Inscription à Agro Multicenter Hinos</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Personal Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={data.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                className={getFieldError(errors, "firstName") ? "border-red-500" : ""}
              />
              {getFieldError(errors, "firstName") && (
                <p className="text-red-500 text-xs mt-1">{getFieldError(errors, "firstName")}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={data.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                className={getFieldError(errors, "lastName") ? "border-red-500" : ""}
              />
              {getFieldError(errors, "lastName") && (
                <p className="text-red-500 text-xs mt-1">{getFieldError(errors, "lastName")}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={getFieldError(errors, "email") ? "border-red-500" : ""}
            />
            {getFieldError(errors, "email") && (
              <p className="text-red-500 text-xs mt-1">{getFieldError(errors, "email")}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={data.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className={getFieldError(errors, "phone") ? "border-red-500" : ""}
            />
            {getFieldError(errors, "phone") && (
              <p className="text-red-500 text-xs mt-1">{getFieldError(errors, "phone")}</p>
            )}
          </div>

          {/* Country */}
          <div>
            <Label htmlFor="country">Pays</Label>
            <Select value={data.country} onValueChange={(value) => updateField("country", value)}>
              <SelectTrigger className={getFieldError(errors, "country") ? "border-red-500" : ""}>
                <SelectValue placeholder="Sélectionnez votre pays" />
              </SelectTrigger>
              <SelectContent>
                {WORLD_COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.name}>
                    <div className="flex items-center space-x-2">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError(errors, "country") && (
              <p className="text-red-500 text-xs mt-1">{getFieldError(errors, "country")}</p>
            )}
          </div>

          {/* Geolocation */}
          <div>
            <Label htmlFor="geolocation">Géolocalisation (Obligatoire)</Label>
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={handleGeolocation}
                disabled={isGeolocationLoading}
              >
                {isGeolocationLoading ? "Détection en cours..." : "📍 Détecter ma position automatiquement"}
              </Button>
              {data.latitude && data.longitude && (
                <div className="text-xs bg-green-50 p-3 rounded-lg">
                  <p className="text-green-800 font-medium">Position détectée</p>
                  <p className="text-green-700">
                    Latitude: {data.latitude.toFixed(4)}, Longitude: {data.longitude.toFixed(4)}
                  </p>
                </div>
              )}
              <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                <p className="font-medium text-blue-800 mb-1">Pourquoi la géolocalisation ?</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Conseils agricoles adaptés à votre climat</li>
                  <li>• Connexion avec des utilisateurs proches</li>
                  <li>• Marketplace régional personnalisé</li>
                  <li>• Alertes météo et agricoles locales</li>
                </ul>
              </div>
              {getFieldError(errors, "geolocation") && (
                <p className="text-red-500 text-xs">{getFieldError(errors, "geolocation")}</p>
              )}
            </div>
          </div>

          {/* Region and City */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="region">Région/État</Label>
              <Input
                id="region"
                value={data.region}
                onChange={(e) => updateField("region", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={data.city}
                onChange={(e) => updateField("city", e.target.value)}
              />
            </div>
          </div>

          {/* Profession */}
          <div>
            <Label htmlFor="profession">Profession</Label>
            <Select value={data.profession} onValueChange={(value) => updateField("profession", value)}>
              <SelectTrigger className={getFieldError(errors, "profession") ? "border-red-500" : ""}>
                <SelectValue placeholder="Sélectionnez votre profession" />
              </SelectTrigger>
              <SelectContent>
                {PROFESSIONS.map((profession) => (
                  <SelectItem key={profession} value={profession}>
                    {profession}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError(errors, "profession") && (
              <p className="text-red-500 text-xs mt-1">{getFieldError(errors, "profession")}</p>
            )}
          </div>

          {/* Specialties */}
          <div>
            <Label>Spécialités (sélectionnez plusieurs)</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {SPECIALTIES.map((specialty) => (
                <label key={specialty} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={data.specialties.includes(specialty)}
                    onChange={() => toggleSpecialty(specialty)}
                    className="rounded"
                  />
                  <span className="text-sm">{specialty}</span>
                </label>
              ))}
            </div>
            {getFieldError(errors, "specialties") && (
              <p className="text-red-500 text-xs mt-1">{getFieldError(errors, "specialties")}</p>
            )}
          </div>

          {/* Languages */}
          <div>
            <Label>Langues parlées</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {AVAILABLE_LANGUAGES.map((language) => (
                <label key={language} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={data.languages.includes(language)}
                    onChange={() => toggleLanguage(language)}
                    className="rounded"
                  />
                  <span className="text-sm">{language}</span>
                </label>
              ))}
            </div>
            {getFieldError(errors, "languages") && (
              <p className="text-red-500 text-xs mt-1">{getFieldError(errors, "languages")}</p>
            )}
          </div>

          {/* Pi Wallet */}
          <div>
            <Label htmlFor="piWallet">Adresse Portefeuille Pi Network</Label>
            <Input
              id="piWallet"
              value={data.piWalletAddress}
              onChange={(e) => updateField("piWalletAddress", e.target.value)}
              placeholder="Votre adresse Pi Network"
            />
          </div>

          {/* Submit Button */}
          <Button onClick={handleSubmit} className="w-full bg-green-600 hover:bg-green-700">
            Créer mon compte
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
