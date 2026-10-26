import type { MockApiConfig } from './mockApi';

const DECIMAL = /^(?:\d+\.?\d*|\.\d+)$/;

/** Reads a probability from a URL query string; only plain decimals in [0, 1] are accepted. */
export function parseRateParam(search: string, name: string): number | undefined {
  const raw = new URLSearchParams(search).get(name);
  if (raw === null || !DECIMAL.test(raw)) return undefined;
  const rate = Number(raw);
  return Number.isFinite(rate) && rate >= 0 && rate <= 1 ? rate : undefined;
}

/**
 * Dev-only overrides for the mock API from the page URL, e.g. `?failureRate=0` or
 * `?failureRate=1&lostResponseShare=1`. Invalid or missing values are ignored.
 */
export function parseMockApiParams(
  search: string,
): Partial<Pick<MockApiConfig, 'failureRate' | 'lostResponseShare'>> {
  const failureRate = parseRateParam(search, 'failureRate');
  const lostResponseShare = parseRateParam(search, 'lostResponseShare');
  return {
    ...(failureRate === undefined ? {} : { failureRate }),
    ...(lostResponseShare === undefined ? {} : { lostResponseShare }),
  };
}
