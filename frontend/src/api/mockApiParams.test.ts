import { describe, expect, it } from 'vitest';
import { parseMockApiParams, parseRateParam } from './mockApiParams';

describe('parseRateParam', () => {
  it.each([
    ['?failureRate=0', 0],
    ['?failureRate=1', 1],
    ['?failureRate=0.5', 0.5],
    ['?failureRate=.25', 0.25],
    ['?other=x&failureRate=1.0', 1],
  ])('reads %s as %d', (search, expected) => {
    expect(parseRateParam(search, 'failureRate')).toBe(expected);
  });

  it.each([
    '',
    '?failureRate',
    '?failureRate=',
    '?failureRate=abc',
    '?failureRate=-0.1',
    '?failureRate=1.5',
    '?failureRate=Infinity',
    '?failureRate=0x1',
    '?failureRate=1e-1',
    '?failureRate=%200.5',
  ])('ignores %j', (search) => {
    expect(parseRateParam(search, 'failureRate')).toBeUndefined();
  });
});

describe('parseMockApiParams', () => {
  it('returns only the valid overrides', () => {
    expect(parseMockApiParams('?failureRate=1&lostResponseShare=1')).toEqual({
      failureRate: 1,
      lostResponseShare: 1,
    });
    expect(parseMockApiParams('?failureRate=0&lostResponseShare=2')).toEqual({ failureRate: 0 });
    expect(parseMockApiParams('?page=2')).toEqual({});
  });
});
