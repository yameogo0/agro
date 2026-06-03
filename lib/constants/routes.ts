export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  SERVICES: '/services',
  MESSAGES: '/messages',
  WALLET: '/wallet',
  NOTIFICATIONS: '/notifications',
  ADMIN: '/admin',
} as const;

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE: '/api/user/profile/update',
    STATS: '/api/user/stats',
  },
  SERVICES: {
    LIST: '/api/services',
    CREATE: '/api/services',
    UPDATE: '/api/services/:id',
    DELETE: '/api/services/:id',
    BOOK: '/api/services/:id/book',
  },
  MESSAGES: {
    CONVERSATIONS: '/api/messages/conversations',
    SEND: '/api/messages/send',
    MARK_READ: '/api/messages/mark-read',
  },
  PAYMENTS: {
    SEND: '/api/payments/send',
    HISTORY: '/api/payments/history',
    BALANCE: '/api/payments/balance',
  },
} as const;