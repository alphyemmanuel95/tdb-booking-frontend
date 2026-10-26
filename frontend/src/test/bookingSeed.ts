import type { MockDb } from '@/api/mockData';
import { addDays, istDateTime, toIstDateKey } from '@/lib/datetime';

export const TODAY = toIstDateKey(new Date());
export const TOMORROW = addDays(TODAY, 1);

/** Small, predictable data set for UI tests. Guruvayur has no slots (empty state). */
export function createTestSeed(): MockDb {
  return {
    temples: [
      { id: 'sabarimala', name: 'Sabarimala', location: 'Pathanamthitta' },
      { id: 'guruvayur', name: 'Guruvayur', location: 'Thrissur' },
    ],
    slots: [
      {
        id: 'open',
        templeId: 'sabarimala',
        date: TOMORROW,
        startTime: istDateTime(TOMORROW, 9).toISOString(),
        capacity: 20,
        remaining: 10,
      },
      {
        id: 'few-left',
        templeId: 'sabarimala',
        date: TOMORROW,
        startTime: istDateTime(TOMORROW, 10).toISOString(),
        capacity: 20,
        remaining: 2,
      },
      {
        id: 'full',
        templeId: 'sabarimala',
        date: TOMORROW,
        startTime: istDateTime(TOMORROW, 11).toISOString(),
        capacity: 20,
        remaining: 0,
      },
      {
        id: 'started',
        templeId: 'sabarimala',
        date: TODAY,
        startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        capacity: 20,
        remaining: 5,
      },
    ],
    bookings: [],
  };
}
