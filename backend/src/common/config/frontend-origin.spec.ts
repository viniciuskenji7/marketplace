import { getAllowedFrontendOrigin } from './frontend-origin.js';

describe('getAllowedFrontendOrigin', () => {
  it('returns a normalized HTTP or HTTPS origin', () => {
    expect(getAllowedFrontendOrigin('http://localhost:3000')).toBe(
      'http://localhost:3000',
    );
    expect(getAllowedFrontendOrigin('https://shop.example.com/')).toBe(
      'https://shop.example.com',
    );
  });

  it.each([
    undefined,
    '',
    '*',
    'file://localhost',
    'https://shop.example.com/path',
    'https://shop.example.com?any=value',
    'https://user:password@shop.example.com',
  ])('rejects invalid or non-origin values: %s', (frontendUrl) => {
    expect(() => getAllowedFrontendOrigin(frontendUrl)).toThrow();
  });
});
