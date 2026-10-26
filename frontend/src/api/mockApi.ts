import { createSeed, type MockDb } from './mockData';
import type { Booking, BookingRequest, BookingResult, Slot, Temple } from './types';

/**
 * In-memory mock backend that behaves like an unreliable network:
 * every call is async, takes a random delay and fails at a configurable rate.
 */
export interface MockApiConfig {
  /** Probability (0–1) that a call fails with a network error. */
  failureRate: number;
  minDelayMs: number;
  maxDelayMs: number;
}

export const DEFAULT_MOCK_API_CONFIG: MockApiConfig = {
  failureRate: 0.2,
  minDelayMs: 200,
  maxDelayMs: 1500,
};

export class MockApiError extends Error {
  override name = 'MockApiError';
}

let config: MockApiConfig = { ...DEFAULT_MOCK_API_CONFIG };
let db: MockDb = createSeed();
let nextBookingId = 1;

export function configureMockApi(overrides: Partial<MockApiConfig>): void {
  config = { ...config, ...overrides };
}

/** Restores the seed data (or the given data). Used by tests. */
export function resetMockApi(seed: MockDb = createSeed()): void {
  db = structuredClone(seed);
  nextBookingId = 1;
}

const PHONE_PATTERN = /^[6-9]\d{9}$/;

async function simulate<T>(work: () => T): Promise<T> {
  const delayMs = config.minDelayMs + Math.random() * (config.maxDelayMs - config.minDelayMs);
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  if (Math.random() < config.failureRate) {
    throw new MockApiError('Network error. Please try again.');
  }
  // Clone so callers can never mutate the "server" data.
  return structuredClone(work());
}

const hasStarted = (slot: Slot) => Date.parse(slot.startTime) <= Date.now();

function findSlot(slotId: string): Slot {
  const slot = db.slots.find((candidate) => candidate.id === slotId);
  if (!slot) throw new MockApiError('This slot does not exist.');
  return slot;
}

export function getTemples(): Promise<Temple[]> {
  return simulate(() => db.temples);
}

export function getSlots(templeId: string, date: string): Promise<Slot[]> {
  return simulate(() =>
    db.slots
      .filter((slot) => slot.templeId === templeId && slot.date === date)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  );
}

export function createBooking(request: BookingRequest): Promise<BookingResult> {
  return simulate(() => {
    const slot = findSlot(request.slotId);
    const name = request.name.trim();
    if (name.length < 2) throw new MockApiError('Enter the devotee name.');
    if (!PHONE_PATTERN.test(request.phone)) throw new MockApiError('Enter a valid mobile number.');
    if (hasStarted(slot)) throw new MockApiError('This slot has already started.');
    if (slot.remaining === 0) throw new MockApiError('This slot is full.');
    if (!Number.isInteger(request.tickets) || request.tickets < 1) {
      throw new MockApiError('Book at least 1 ticket.');
    }
    if (request.tickets > slot.remaining) {
      throw new MockApiError(`Only ${String(slot.remaining)} tickets are left in this slot.`);
    }

    const temple = db.temples.find((candidate) => candidate.id === slot.templeId);
    slot.remaining -= request.tickets;
    const booking: Booking = {
      id: `BK-${String(nextBookingId++).padStart(4, '0')}`,
      slotId: slot.id,
      templeId: slot.templeId,
      templeName: temple?.name ?? slot.templeId,
      date: slot.date,
      startTime: slot.startTime,
      name,
      phone: request.phone,
      tickets: request.tickets,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    db.bookings.push(booking);
    return { booking, slot };
  });
}

export function getBookings(phone: string): Promise<Booking[]> {
  return simulate(() =>
    db.bookings
      .filter((booking) => booking.phone === phone)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  );
}

export function cancelBooking(bookingId: string): Promise<Booking> {
  return simulate(() => {
    const booking = db.bookings.find((candidate) => candidate.id === bookingId);
    if (!booking) throw new MockApiError('This booking does not exist.');
    if (booking.status === 'cancelled')
      throw new MockApiError('This booking is already cancelled.');
    const slot = findSlot(booking.slotId);
    if (hasStarted(slot)) throw new MockApiError('This slot has already started.');

    booking.status = 'cancelled';
    slot.remaining += booking.tickets;
    return booking;
  });
}
