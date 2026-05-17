import { BookingDisplayStatus, type BookingDisplayStatus as BookingStatusValue } from "../types";

export function bookingStatusText(status: BookingStatusValue) {
  switch (status) {
    case BookingDisplayStatus.Active:
      return "Активно";
    case BookingDisplayStatus.Cancelled:
      return "Отменено";
    case BookingDisplayStatus.Completed:
      return "Завершено";
    default:
      return "Неизвестно";
  }
}

export function BookingStatusBadge({ status }: { status: BookingStatusValue }) {
  return <span className={`status status-${status}`}>{bookingStatusText(status)}</span>;
}
