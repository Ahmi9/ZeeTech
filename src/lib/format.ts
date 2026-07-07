export function formatPrice(amount: number): string {
  return 'Rs ' + Math.round(amount).toLocaleString()
}

export function formatPricePKR(amount: number): string {
  return 'PKR ' + Math.round(amount).toLocaleString()
}
