const dayInMilliseconds = 86_400_000;

export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDefaultStayDates() {
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 1);

  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 1);

  return {
    checkInDate: toDateInputValue(checkIn),
    checkOutDate: toDateInputValue(checkOut),
  };
}

export function countNights(checkInDate: string, checkOutDate: string) {
  if (!checkInDate || !checkOutDate) return 0;

  const diff =
    new Date(checkOutDate).getTime() - new Date(checkInDate).getTime();

  return Math.max(0, Math.round(diff / dayInMilliseconds));
}

export function isValidStayRange(checkInDate: string, checkOutDate: string) {
  return Boolean(checkInDate && checkOutDate && checkInDate < checkOutDate);
}
