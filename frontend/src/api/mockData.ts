import { istDateTime, nextIstDateKeys, toIstDateKey } from '@/lib/datetime';
import type { Booking, Slot, Temple } from './types';

export interface MockDb {
  temples: Temple[];
  slots: Slot[];
  bookings: Booking[];
}

const TEMPLES: Temple[] = [
  { id: 'sabarimala', name: 'Sabarimala', location: 'Pathanamthitta' },
  { id: 'guruvayur', name: 'Guruvayur', location: 'Thrissur' },
  { id: 'padmanabhaswamy', name: 'Sree Padmanabhaswamy', location: 'Thiruvananthapuram' },
];

/** Darshan start hours in IST. */
const SLOT_HOURS = [5, 9, 12, 16, 19];
const CAPACITY = 40;

/** Seed data: slots for the next 7 IST days at every temple, some full and some already started. */
export function createSeed(now: Date = new Date()): MockDb {
  const dates = nextIstDateKeys(7, now);
  const slots = TEMPLES.flatMap((temple, templeIndex) =>
    dates.flatMap((date, dayIndex) =>
      SLOT_HOURS.map((hour, hourIndex): Slot => {
        const variant = templeIndex + dayIndex + hourIndex;
        // Every 4th slot is full and the 9:00 slot has exactly 10 left; the rest vary.
        const remaining =
          variant % 4 === 0 ? 0 : hourIndex === 1 ? 10 : CAPACITY - ((variant * 7) % 30);
        return {
          id: `${temple.id}-${date}-${String(hour)}`,
          templeId: temple.id,
          date,
          startTime: istDateTime(date, hour).toISOString(),
          capacity: CAPACITY,
          remaining,
        };
      }),
    ),
  );

  // Guarantee at least one started slot today, whatever time the app is opened.
  const startedSlots = TEMPLES.map((temple): Slot => ({
    id: `${temple.id}-started`,
    templeId: temple.id,
    date: toIstDateKey(now),
    startTime: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    capacity: CAPACITY,
    remaining: 12,
  }));

  return { temples: TEMPLES, slots: [...startedSlots, ...slots], bookings: [] };
}
