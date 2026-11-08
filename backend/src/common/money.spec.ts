import { toCents } from './money.js';

describe('toCents', () => {
  it.each([
    [10, 1000],
    [10.5, 1050],
    [10.55, 1055],
    [0, 0],
  ])('converts R$ %s to %s cents', (price, expected) => {
    expect(toCents(price)).toBe(expected);
  });

  it('rejects invalid prices', () => {
    expect(() => toCents(Number.NaN)).toThrow(RangeError);
    expect(() => toCents(-1)).toThrow(RangeError);
  });
});
