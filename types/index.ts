// types/user.ts
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  region: string;
  verified: boolean;
  createdAt: Date;
}

// types/service.ts
export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  providerId: string;
  available: boolean;
}

// types/api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}