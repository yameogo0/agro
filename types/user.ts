export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  region: string;
  city?: string;
  bio?: string;
  specialties?: string[];
  languages?: string[];
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  followers: number;
  following: number;
  rating: number;
  reviews: number;
  piBalance: number;
}

export interface UserStats {
  followers: number;
  following: number;
  posts: number;
  rating: number;
  reviews: number;
  transactions: number;
  piEarned: number;
  servicesOffered: number;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  language: string;
  privacy: {
    shareLocation: boolean;
    showEmail: boolean;
    showPhone: boolean;
  };
}