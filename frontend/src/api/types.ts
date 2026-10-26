export interface Temple {
  id: string;
  name: string;
  location: string;
}

export interface Slot {
  id: string;
  templeId: string;
  /** IST calendar date, `YYYY-MM-DD`. */
  date: string;
  /** ISO instant the darshan starts. */
  startTime: string;
  capacity: number;
  remaining: number;
}

export type BookingStatus = 'confirmed' | 'cancelled';

export interface Booking {
  id: string;
  slotId: string;
  templeId: string;
  templeName: string;
  date: string;
  startTime: string;
  name: string;
  phone: string;
  tickets: number;
  status: BookingStatus;
  createdAt: string;
}

export interface BookingRequest {
  slotId: string;
  name: string;
  phone: string;
  tickets: number;
}

export interface BookingResult {
  booking: Booking;
  /** The slot after the booking, so callers can show the new remaining count. */
  slot: Slot;
}
