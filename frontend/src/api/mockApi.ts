import { createSeed, type MockDb } from './mockData';
import type { Booking, BookingRequest, BookingResult, Slot, Temple } from './types';

/**
 * In-memory mock backend that behaves like an unreliable network:
 * every call is async, takes a random delay and fails at a configurable rate.
 * Some failures happen after the server has done the work ("response lost"),
 * so a client cannot tell from a network error whether its request took effect.
 */
export interface MockApiConfig {
  /** Probability (0–1) that a call fails with a network error. */
  failureRate: number;
  /**
   * Share (0–1) of those failures where the request reached the server and was
   * processed, but the response was lost. The rest fail before reaching the server.
   */
  lostResponseShare: number;
  minDelayMs: number;
  maxDelayMs: number;
  /**
   * Optional fixed latency for one `getSlots` call, in ms; `undefined` keeps the random delay.
   * Lets tests make the response for one selection arrive after another.
   */
  getSlotsDelayMs?: ((templeId: string, date: string) => number | undefined) | undefined;
}

export const DEFAULT_MOCK_API_CONFIG: MockApiConfig = {
  failureRate: 0.2,
  lostResponseShare: 0.5,
  minDelayMs: 200,
  maxDelayMs: 1500,
};

export type MockApiErrorCode =
  | 'NETWORK'
  | 'NOT_FOUND'
  | 'INVALID'
  | 'SLOT_STARTED'
  | 'SLOT_FULL'
  | 'NOT_ENOUGH_TICKETS'
  | 'ALREADY_CANCELLED'
  | 'IDEMPOTENCY_CONFLICT';

export class MockApiError extends Error {
  override name = 'MockApiError';
  /** Only `NETWORK` errors are worth retrying unchanged; the rest are the server's answer. */
  readonly code: MockApiErrorCode;

  constructor(code: MockApiErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

interface IdempotentBooking {
  /** The request the key was first used with, to reject reuse for a different booking. */
  fingerprint: string;
  result: BookingResult;
}

let config: MockApiConfig = { ...DEFAULT_MOCK_API_CONFIG };
let db: MockDb = createSeed();
let nextBookingId = 1;
let idempotentBookings = new Map<string, IdempotentBooking>();

export function configureMockApi(overrides: Partial<MockApiConfig>): void {
  config = { ...config, ...overrides };
}

/** Restores the seed data (or the given data). Used by tests. */
export function resetMockApi(seed: MockDb = createSeed()): void {
  db = structuredClone(seed);
  nextBookingId = 1;
  idempotentBookings = new Map();
}

const PHONE_PATTERN = /^[6-9]\d{9}$/;

const networkError = () => new MockApiError('NETWORK', 'Network error. Please try again.');

async function simulate<T>(work: () => T, fixedDelayMs?: number): Promise<T> {
  const delayMs =
    fixedDelayMs ?? config.minDelayMs + Math.random() * (config.maxDelayMs - config.minDelayMs);
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  const fails = Math.random() < config.failureRate;
  const responseLost = fails && Math.random() < config.lostResponseShare;
  if (fails && !responseLost) throw networkError();
  // Clone so callers can never mutate the "server" data.
  const result = structuredClone(work());
  if (responseLost) throw networkError();
  return result;
}

const hasStarted = (slot: Slot) => Date.parse(slot.startTime) <= Date.now();

function findSlot(slotId: string): Slot {
  const slot = db.slots.find((candidate) => candidate.id === slotId);
  if (!slot) throw new MockApiError('NOT_FOUND', 'This slot does not exist.');
  return slot;
}

export function getTemples(): Promise<Temple[]> {
  return simulate(() => db.temples);
}

export function getSlots(templeId: string, date: string): Promise<Slot[]> {
  return simulate(
    () =>
      db.slots
        .filter((slot) => slot.templeId === templeId && slot.date === date)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    config.getSlotsDelayMs?.(templeId, date),
  );
}

const fingerprintOf = (request: BookingRequest) =>
  JSON.stringify([request.slotId, request.name.trim(), request.phone, request.tickets]);

/**
 * Books tickets. With an `idempotencyKey`, a repeated request (e.g. a retry after a
 * lost response) returns the original result instead of booking again, and reusing
 * the key for a different booking is rejected. Only successful bookings are remembered,
 * because a rejected request changed nothing and may safely run again.
 */
export function createBooking(request: BookingRequest): Promise<BookingResult> {
  return simulate(() => {
    const { idempotencyKey } = request;
    if (idempotencyKey !== undefined) {
      const previous = idempotentBookings.get(idempotencyKey);
      if (previous) {
        if (previous.fingerprint !== fingerprintOf(request)) {
          throw new MockApiError(
            'IDEMPOTENCY_CONFLICT',
            'This booking attempt was already used for different details.',
          );
        }
        // Same booking, but the slot as it is now: others may have booked since.
        return { booking: previous.result.booking, slot: findSlot(request.slotId) };
      }
    }

    const result = bookTickets(request);
    if (idempotencyKey !== undefined) {
      idempotentBookings.set(idempotencyKey, {
        fingerprint: fingerprintOf(request),
        result: structuredClone(result),
      });
    }
    return result;
  });
}

function bookTickets(request: BookingRequest): BookingResult {
  const slot = findSlot(request.slotId);
  const name = request.name.trim();
  if (name.length < 2) throw new MockApiError('INVALID', 'Enter the devotee name.');
  if (!PHONE_PATTERN.test(request.phone)) {
    throw new MockApiError('INVALID', 'Enter a valid mobile number.');
  }
  if (hasStarted(slot)) throw new MockApiError('SLOT_STARTED', 'This slot has already started.');
  if (slot.remaining === 0) throw new MockApiError('SLOT_FULL', 'This slot is full.');
  if (!Number.isInteger(request.tickets) || request.tickets < 1) {
    throw new MockApiError('INVALID', 'Book at least 1 ticket.');
  }
  if (request.tickets > slot.remaining) {
    throw new MockApiError(
      'NOT_ENOUGH_TICKETS',
      `Only ${String(slot.remaining)} tickets are left in this slot.`,
    );
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
    if (!booking) throw new MockApiError('NOT_FOUND', 'This booking does not exist.');
    if (booking.status === 'cancelled') {
      throw new MockApiError('ALREADY_CANCELLED', 'This booking is already cancelled.');
    }
    const slot = findSlot(booking.slotId);
    if (hasStarted(slot)) throw new MockApiError('SLOT_STARTED', 'This slot has already started.');

    booking.status = 'cancelled';
    slot.remaining += booking.tickets;
    return booking;
  });
}
