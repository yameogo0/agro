import { useState, useEffect, useCallback } from 'react'

interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  error: string | null
  loading: boolean
}

export function useGeolocation(options: GeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 300000,
  } = options

  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
  })

  const [watchId, setWatchId] = useState<number | null>(null)

  const onSuccess = useCallback((position: GeolocationPosition) => {
    setState({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      error: null,
      loading: false,
    })
  }, [])

  const onError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Erreur de géolocalisation'
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Permission refusée pour accéder à la position'
        break
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Position non disponible'
        break
      case error.TIMEOUT:
        errorMessage = 'Timeout lors de la récupération de la position'
        break
    }
    setState(prev => ({
      ...prev,
      error: errorMessage,
      loading: false,
    }))
  }, [])

  const getCurrentPosition = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'La géolocalisation n\'est pas supportée par ce navigateur',
        loading: false,
      }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      onSuccess,
      onError,
      { enableHighAccuracy, timeout, maximumAge }
    )
  }, [enableHighAccuracy, timeout, maximumAge, onSuccess, onError])

  const startWatching = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'La géolocalisation n\'est pas supportée par ce navigateur',
        loading: false,
      }))
      return
    }

    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
    }

    const id = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      { enableHighAccuracy, timeout, maximumAge }
    )
    setWatchId(id)
  }, [enableHighAccuracy, timeout, maximumAge, onSuccess, onError, watchId])

  const stopWatching = useCallback(() => {
    if (watchId !== null && typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
  }, [watchId])

  const refresh = useCallback(() => {
    getCurrentPosition()
  }, [getCurrentPosition])

  useEffect(() => {
    getCurrentPosition()
    return () => {
      if (watchId !== null && typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [getCurrentPosition, watchId])

  return {
    latitude: state.latitude,
    longitude: state.longitude,
    accuracy: state.accuracy,
    error: state.error,
    loading: state.loading,
    refresh,
    startWatching,
    stopWatching,
  }
}

export default useGeolocation
