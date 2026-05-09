import { useEffect, useState, type FormEvent } from "react";
import {
  cancelAdminBooking,
  createBookingForUser,
  getAdminBookings,
} from "../../api/adminApi";
import { getApiErrorMessage } from "../../api/client";
import { BookingStatusBadge } from "../../components/BookingStatus";
import { BookingDisplayStatus, type BookingResponse } from "../../types";
import { formatCurrency, formatDateRange } from "../../utils/format";

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [userId, setUserId] = useState("");
  const [roomTypeId, setRoomTypeId] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guestsCount, setGuestsCount] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadBookings() {
    setError("");
    setLoading(true);
    try {
      setBookings(await getAdminBookings());
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function run(action: () => Promise<unknown>, message: string) {
    setError("");
    setSuccess("");
    try {
      await action();
      await loadBookings();
      setSuccess(message);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    await run(
      () =>
        createBookingForUser(Number(userId), {
          roomTypeId: Number(roomTypeId),
          checkInDate,
          checkOutDate,
          guestsCount,
        }),
      "Booking created."
    );
  }

  return (
    <main className="page stack-lg">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Bookings</h1>
        </div>
        <button className="button secondary" type="button" onClick={loadBookings}>
          Refresh
        </button>
      </div>

      {error && <p className="alert error">{error}</p>}
      {success && <p className="alert success">{success}</p>}

      <section className="panel stack">
        <h2>Create booking for user</h2>
        <form className="search-form management-search" onSubmit={handleCreate}>
          <label>
            User ID
            <input
              type="number"
              min={1}
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              required
            />
          </label>
          <label>
            Room type ID
            <input
              type="number"
              min={1}
              value={roomTypeId}
              onChange={(event) => setRoomTypeId(event.target.value)}
              required
            />
          </label>
          <label>
            Check-in
            <input
              type="date"
              value={checkInDate}
              onChange={(event) => setCheckInDate(event.target.value)}
              required
            />
          </label>
          <label>
            Check-out
            <input
              type="date"
              value={checkOutDate}
              onChange={(event) => setCheckOutDate(event.target.value)}
              required
            />
          </label>
          <label>
            Guests
            <input
              type="number"
              min={1}
              value={guestsCount}
              onChange={(event) => setGuestsCount(Number(event.target.value))}
              required
            />
          </label>
          <button className="button" type="submit">
            Create
          </button>
        </form>
      </section>

      {loading && <p className="muted">Loading bookings...</p>}
      <BookingAdminList
        bookings={bookings}
        onCancel={(id) => run(() => cancelAdminBooking(id), "Booking cancelled.")}
      />
    </main>
  );
}

function BookingAdminList({
  bookings,
  onCancel,
}: {
  bookings: BookingResponse[];
  onCancel: (id: number) => void;
}) {
  if (bookings.length === 0) return <p className="muted">No bookings found.</p>;

  return (
    <div className="booking-list">
      {bookings.map((booking) => (
        <article className="card booking-card" key={booking.id}>
          <div>
            <h2>{booking.hotelName}</h2>
            <p className="muted">
              Booking #{booking.id} - User #{booking.userId}
            </p>
            <p>{booking.roomTypeName}</p>
            <p>{formatDateRange(booking.checkInDate, booking.checkOutDate)}</p>
            <p>Guests: {booking.guestsCount}</p>
          </div>
          <div className="booking-side">
            <BookingStatusBadge status={booking.status} />
            <strong>{formatCurrency(booking.totalPrice)}</strong>
            {booking.status === BookingDisplayStatus.Active && (
              <button
                className="button danger"
                type="button"
                onClick={() => onCancel(booking.id)}
              >
                Cancel
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
