import type { Slot } from '@/api/types';

export type SlotStatus = 'available' | 'full' | 'started';

export function getSlotStatus(slot: Slot, now: number): SlotStatus {
  if (Date.parse(slot.startTime) <= now) return 'started';
  if (slot.remaining === 0) return 'full';
  return 'available';
}
