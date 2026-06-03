import { useState, useEffect } from 'react'

/**
 * Hook personnalisé pour détecter l'état de la connexion internet
 * @returns {boolean} true si en ligne, false si hors ligne
 * 
 * @example
 * const isOnline = useOnlineStatus()
 * 
 * return (
 *   <div>
 *     {isOnline ? "Vous êtes en ligne" : "Mode hors ligne"}
 *   </div>
 * )
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(true)

  useEffect(() => {
    // Vérifier l'état initial
    setIsOnline(navigator.onLine)

    // Gestionnaire pour le retour en ligne
    const handleOnline = () => {
      setIsOnline(true)
      // Optionnel : afficher une notification
      console.log('Connexion internet rétablie')
    }

    // Gestionnaire pour la perte de connexion
    const handleOffline = () => {
      setIsOnline(false)
      // Optionnel : afficher une notification
      console.log('Connexion internet perdue')
    }

    // Ajouter les écouteurs d'événements
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Nettoyage
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

export default useOnlineStatus
