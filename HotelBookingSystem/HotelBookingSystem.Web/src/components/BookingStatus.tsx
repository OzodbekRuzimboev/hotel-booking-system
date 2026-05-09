import { BookingDisplayStatus, type BookingDisplayStatus as BookingStatusValue } from "../types";

export function bookingStatusText(status: BookingStatusValue) {
  switch (status) {
    case BookingDisplayStatus.Active:
      return "Active";
    case BookingDisplayStatus.Cancelled:
      return "Cancelled";
    case BookingDisplayStatus.Completed:
      return "Completed";
    default:
      return "Unknown";
  }
}

export function BookingStatusBadge({ status }: { status: BookingStatusValue }) {
  return <span className={`status status-${status}`}>{bookingStatusText(status)}</span>;
}
