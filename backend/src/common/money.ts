export function toCents(priceInReais: number): number {
  if (!Number.isFinite(priceInReais) || priceInReais < 0) {
    throw new RangeError('O preço deve ser um número finito e não negativo.');
  }

  return Math.round(priceInReais * 100);
}
