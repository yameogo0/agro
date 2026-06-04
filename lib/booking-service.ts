export interface Booking {
  id: string;
  serviceId: string;
  serviceTitle: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'completed';
  paymentId?: string;
  createdAt: string;
}

const STORAGE_KEY = 'agro_bookings';

export const createBooking = async (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<Booking> => {
  const newBooking: Booking = {
    ...booking,
    id: `bk_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  const existing = localStorage.getItem(STORAGE_KEY);
  const bookings: Booking[] = existing ? JSON.parse(existing) : [];
  bookings.unshift(newBooking);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  return newBooking;
};

export const getUserBookings = (): Booking[] => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) return [];
  return JSON.parse(existing);
};
