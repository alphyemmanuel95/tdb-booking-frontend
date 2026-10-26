import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatIstDate, formatIstTime, toIstDateKey } from './datetime';

describe('IST formatting', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('shows IST whatever the device time zone', () => {
    // Simulate a device in Los Angeles. 20:00 UTC on 30 Oct is 1 pm on 30 Oct there,
    // but 1:30 am on 31 Oct in IST.
    vi.stubEnv('TZ', 'America/Los_Angeles');
    const instant = '2026-10-30T20:00:00Z';
    expect(new Date(instant).getHours()).toBe(13);

    expect(formatIstTime(instant)).toBe('1:30 am');
    expect(toIstDateKey(new Date(instant))).toBe('2026-10-31');
    expect(formatIstDate('2026-10-31')).toBe('Sat, 31 Oct');
  });
});
