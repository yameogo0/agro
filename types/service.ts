export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  duration?: string;
  location?: string;
  providerId: string;
  providerName: string;
  providerAvatar?: string;
  rating: number;
  reviews: number;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceBooking {
  id: string;
  serviceId: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  amount: number;
  date: Date;
  message?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}