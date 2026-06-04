// contexts/location-context.tsx
"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useGeolocation } from "@/hooks/use-geolocation"

interface LocationContextType {
  latitude: number | null
  longitude: number | null
  region: string
  city: string
  loading: boolean
  error: string | null
}

const LocationContext = createContext<LocationContextType>({
  latitude: null,
  longitude: null,
  region: "Burkina Faso",
  city: "Ouagadougou",
  loading: true,
  error: null,
})

export const useLocation = () => useContext(LocationContext)

export function LocationProvider({ children }: { children: ReactNode }) {
  const { latitude, longitude, accuracy, error, loading } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
  })
  const [region, setRegion] = useState("Burkina Faso")
  const [city, setCity] = useState("Ouagadougou")

  useEffect(() => {
    if (latitude && longitude) {
      // Appel reverse geocoding (optionnel)
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        .then(res => res.json())
        .then(data => {
          const address = data.address || {}
          const country = address.country || "Position GPS"
          const state = address.state || address.region || ""
          const cityName = address.city || address.town || address.village || "Position actuelle"
          setRegion(state || country)
          setCity(cityName)
        })
        .catch(() => {
          setRegion(`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`)
          setCity("Position GPS")
        })
    }
  }, [latitude, longitude])

  return (
    <LocationContext.Provider value={{ latitude, longitude, region, city, loading, error }}>
      {children}
    </LocationContext.Provider>
  )
}