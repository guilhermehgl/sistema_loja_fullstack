export function formatPriceInput(rawValue: string): string {
  const digitsOnly = rawValue.replace(/\D/g, '').slice(0, 9);
  if (!digitsOnly) return '';

  const integer = digitsOnly.slice(0, -2) || '0';
  const cents = digitsOnly.slice(-2).padStart(2, '0');
  return `${String(Number(integer))},${cents}`;
}

export function toNumericPrice(formattedPrice: string): number {
  return Number(String(formattedPrice).replace(',', '.'));
}
