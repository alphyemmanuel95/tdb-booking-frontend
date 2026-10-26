/** Temple times are always Indian Standard Time, whatever time zone the device is in. */
export const IST_TIME_ZONE = 'Asia/Kolkata';

// IST has no daylight saving, so a fixed offset is safe.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

const pad = (value: number) => String(value).padStart(2, '0');

/** Calendar date (`YYYY-MM-DD`) of an instant, as seen in IST. */
export function toIstDateKey(date: Date): string {
  return new Date(date.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** Adds whole days to a `YYYY-MM-DD` date key. */
export function addDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** The next `count` IST date keys, starting today. */
export function nextIstDateKeys(count: number, now: Date = new Date()): string[] {
  const today = toIstDateKey(now);
  return Array.from({ length: count }, (_, index) => addDays(today, index));
}

/** The instant of an IST wall-clock time on a date key. */
export function istDateTime(dateKey: string, hour: number, minute = 0): Date {
  return new Date(`${dateKey}T${pad(hour)}:${pad(minute)}:00+05:30`);
}

/** Formats an ISO instant as an IST clock time, e.g. "9:00 am". */
export function formatIstTime(iso: string, locale = 'en-IN'): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: IST_TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

/** Formats a `YYYY-MM-DD` IST date key, e.g. "Sat, 31 Oct". */
export function formatIstDate(dateKey: string, locale = 'en-IN'): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: IST_TIME_ZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(istDateTime(dateKey, 12));
}
