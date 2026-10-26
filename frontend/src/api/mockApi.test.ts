import { describe, expect, it } from 'vitest';
import { createTestSeed, TOMORROW } from '@/test/bookingSeed';
import { createSeed } from './mockData';
import {
  cancelBooking,
  configureMockApi,
  createBooking,
  getBookings,
  getSlots,
  getTemples,
  resetMockApi,
} from './mockApi';

const request = { slotId: 'open', name: 'Anil Kumar', phone: '9876543210', tickets: 3 };

describe('mock API seed', () => {
  it('has 3+ temples with slots on 7 days, including full and started slots', () => {
    const now = new Date();
    const seed = createSeed(now);

    expect(seed.temples.length).toBeGreaterThanOrEqual(3);
    for (const temple of seed.temples) {
      const dates = new Set(seed.slots.filter((s) => s.templeId === temple.id).map((s) => s.date));
      expect(dates.size).toBe(7);
    }
    expect(seed.slots.some((s) => s.remaining === 0)).toBe(true);
    expect(seed.slots.some((s) => Date.parse(s.startTime) <= now.getTime())).toBe(true);
  });
});

describe('mock API', () => {
  it('lists temples and the slots for a temple and date', async () => {
    resetMockApi(createTestSeed());

    expect(await getTemples()).toHaveLength(2);
    const slots = await getSlots('sabarimala', TOMORROW);
    expect(slots.map((s) => s.id)).toEqual(['open', 'few-left', 'full']);
  });

  it('books tickets and reduces the remaining count', async () => {
    resetMockApi(createTestSeed());

    const { booking, slot } = await createBooking(request);

    expect(booking).toMatchObject({ tickets: 3, status: 'confirmed', templeName: 'Sabarimala' });
    expect(slot.remaining).toBe(7);
    expect(await getBookings('9876543210')).toHaveLength(1);
  });

  it.each([
    ['more tickets than remain', { slotId: 'few-left', tickets: 3 }, 'Only 2 tickets are left'],
    ['a full slot', { slotId: 'full', tickets: 1 }, 'This slot is full'],
    ['a started slot', { slotId: 'started', tickets: 1 }, 'already started'],
    ['an invalid phone', { phone: '12345' }, 'valid mobile number'],
  ])('rejects booking %s', async (_case, overrides, message) => {
    resetMockApi(createTestSeed());

    await expect(createBooking({ ...request, ...overrides })).rejects.toThrow(message);
    expect(await getBookings('9876543210')).toHaveLength(0);
  });

  it('fails calls at the configured rate', async () => {
    configureMockApi({ failureRate: 1 });

    await expect(getTemples()).rejects.toThrow('Network error');
  });

  it('fails network calls before the work by default in tests', async () => {
    resetMockApi(createTestSeed());
    configureMockApi({ failureRate: 1 });

    await expect(createBooking(request)).rejects.toMatchObject({ code: 'NETWORK' });
    configureMockApi({ failureRate: 0 });
    expect(await getBookings('9876543210')).toHaveLength(0);
  });

  it('can lose the response after the booking was made', async () => {
    resetMockApi(createTestSeed());
    configureMockApi({ failureRate: 1, lostResponseShare: 1 });

    await expect(createBooking(request)).rejects.toMatchObject({ code: 'NETWORK' });
    configureMockApi({ failureRate: 0 });
    expect(await getBookings('9876543210')).toHaveLength(1);
  });

  it('replays the original booking for a repeated idempotency key', async () => {
    resetMockApi(createTestSeed());
    const keyed = { ...request, idempotencyKey: 'attempt-1' };

    const first = await createBooking(keyed);
    const replay = await createBooking(keyed);

    expect(replay).toEqual(first);
    expect(await getBookings('9876543210')).toHaveLength(1);
    const open = (await getSlots('sabarimala', TOMORROW)).find((s) => s.id === 'open');
    expect(open?.remaining).toBe(7);
  });

  it('rejects a reused idempotency key for different details', async () => {
    resetMockApi(createTestSeed());
    await createBooking({ ...request, idempotencyKey: 'attempt-1' });

    await expect(
      createBooking({ ...request, tickets: 2, idempotencyKey: 'attempt-1' }),
    ).rejects.toMatchObject({ code: 'IDEMPOTENCY_CONFLICT' });
    expect(await getBookings('9876543210')).toHaveLength(1);
  });

  it('runs a keyed request again after it was rejected', async () => {
    resetMockApi(createTestSeed());
    const keyed = { ...request, slotId: 'few-left', tickets: 2, idempotencyKey: 'attempt-1' };
    await createBooking({ ...keyed, idempotencyKey: 'other' });

    await expect(createBooking(keyed)).rejects.toMatchObject({ code: 'SLOT_FULL' });
    await cancelBooking('BK-0001');
    expect(await createBooking(keyed)).toMatchObject({ booking: { id: 'BK-0002' } });
  });

  it('cancels a booking and releases its tickets', async () => {
    resetMockApi(createTestSeed());
    const { booking } = await createBooking(request);

    expect(await cancelBooking(booking.id)).toMatchObject({ status: 'cancelled' });
    const open = (await getSlots('sabarimala', TOMORROW)).find((s) => s.id === 'open');
    expect(open?.remaining).toBe(10);
  });
});
