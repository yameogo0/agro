export const ERROR_MESSAGES = {
  NETWORK: 'Erreur réseau. Vérifiez votre connexion.',
  TIMEOUT: 'La requête a expiré. Veuillez réessayer.',
  UNAUTHORIZED: 'Session expirée. Veuillez vous reconnecter.',
  FORBIDDEN: 'Accès interdit.',
  NOT_FOUND: 'Ressource non trouvée.',
  SERVER: 'Erreur serveur. Veuillez réessayer plus tard.',
  BAD_REQUEST: 'Données invalides.',
  RATE_LIMIT: 'Trop de requêtes. Veuillez patienter.',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN: 'Connexion réussie !',
  REGISTER: 'Compte créé avec succès !',
  PROFILE_UPDATED: 'Profil mis à jour.',
  SERVICE_CREATED: 'Service créé avec succès.',
  SERVICE_DELETED: 'Service supprimé.',
  BOOKING_CONFIRMED: 'Réservation confirmée.',
  PAYMENT_SENT: 'Paiement envoyé.',
} as const;