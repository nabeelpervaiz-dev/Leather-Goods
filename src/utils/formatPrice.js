export function formatPrice(amount, currency = 'PKR') {
  const numeric = Number(amount) || 0;
  return `${currency} ${numeric.toLocaleString('en-PK')}`;
}
