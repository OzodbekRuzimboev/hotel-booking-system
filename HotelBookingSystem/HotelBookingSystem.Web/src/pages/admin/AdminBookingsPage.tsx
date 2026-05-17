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
  const [guestEmail, setGuestEmail] = useState("");
  const [guestCountry, setGuestCountry] = useState("");
  const [guestPhoneNumber, setGuestPhoneNumber] = useState("");
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
          guestEmail,
          guestCountry: guestCountry || null,
          guestPhoneNumber: guestPhoneNumber || null,
        }),
      "Бронирование создано."
    );
  }

  return (
    <main className="page stack-lg">
      <div className="page-header">
        <div>
          <p className="eyebrow">Администратор</p>
          <h1>Бронирования</h1>
        </div>
      </div>

      {error && <p className="alert error">{error}</p>}
      {success && <p className="alert success">{success}</p>}

      <section className="panel stack">
        <h2>Создать бронирование для пользователя</h2>
        <form className="search-form management-search" onSubmit={handleCreate}>
          <label>
            ID пользователя
            <input
              type="number"
              min={1}
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              required
            />
          </label>
          <label>
            ID типа номера
            <input
              type="number"
              min={1}
              value={roomTypeId}
              onChange={(event) => setRoomTypeId(event.target.value)}
              required
            />
          </label>
          <label>
            Заезд
            <input
              type="date"
              value={checkInDate}
              onChange={(event) => setCheckInDate(event.target.value)}
              required
            />
          </label>
          <label>
            Выезд
            <input
              type="date"
              value={checkOutDate}
              onChange={(event) => setCheckOutDate(event.target.value)}
              required
            />
          </label>
          <label>
            Гости
            <input
              type="number"
              min={1}
              value={guestsCount}
              onChange={(event) => setGuestsCount(Number(event.target.value))}
              required
            />
          </label>
          <label>
            Электронная почта
            <input
              type="email"
              value={guestEmail}
              onChange={(event) => setGuestEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Страна
            <input
              value={guestCountry}
              onChange={(event) => setGuestCountry(event.target.value)}
            />
          </label>
          <label>
            Телефон
            <input
              value={guestPhoneNumber}
              onChange={(event) => setGuestPhoneNumber(event.target.value)}
            />
          </label>
          <button className="button" type="submit">
            Создать
          </button>
        </form>
      </section>

      {loading && <p className="muted">Загрузка бронирований...</p>}
      <BookingAdminList
        bookings={bookings}
        onCancel={(id) => run(() => cancelAdminBooking(id), "Бронирование отменено.")}
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
  if (bookings.length === 0) return <p className="muted">Бронирования не найдены.</p>;

  return (
    <div className="booking-list">
      {bookings.map((booking) => (
        <article className="card booking-card" key={booking.id}>
          <div>
            <h2>{booking.hotelName}</h2>
            <p className="muted">
              Бронирование #{booking.id} - пользователь #{booking.userId}
            </p>
            <p>{booking.roomTypeName}</p>
            <p>{formatDateRange(booking.checkInDate, booking.checkOutDate)}</p>
            <p>Гости: {booking.guestsCount}</p>
            <p className="muted small">{booking.guestEmail}</p>
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
                Отменить
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
