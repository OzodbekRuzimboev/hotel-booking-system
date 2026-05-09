export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

export function formatDateRange(checkInDate: string, checkOutDate: string) {
  return `${checkInDate} to ${checkOutDate}`;
}
