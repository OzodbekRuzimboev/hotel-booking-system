import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  cancelOwnerBooking,
  getOwnerBookings,
  getOwnerHotels,
} from "../../api/ownerApi";
import { getApiErrorMessage } from "../../api/client";
import { BookingStatusBadge } from "../../components/BookingStatus";
import {
  BookingDisplayStatus,
  type BookingResponse,
  type ManagedHotelResponse,
} from "../../types";
import { formatCurrency, formatDateRange } from "../../utils/format";

export function OwnerBookingsPage() {
  const [hotels, setHotels] = useState<ManagedHotelResponse[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<number | "">("");
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const bookingsRequestId = useRef(0);

  const selectedHotel = useMemo(
    () => hotels.find((hotel) => hotel.id === selectedHotelId),
    [hotels, selectedHotelId]
  );

  const loadHotels = useCallback(async () => {
    setError("");
    try {
      const result = await getOwnerHotels();
      setHotels(result);
      if (!selectedHotelId && result.length > 0) {
        setSelectedHotelId(result[0].id);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }, [selectedHotelId]);

  const loadBookings = useCallback(async (hotelId = selectedHotelId) => {
    if (!hotelId) {
      bookingsRequestId.current++;
      setBookings([]);
      return;
    }

    const requestId = ++bookingsRequestId.current;

    setError("");
    setLoading(true);
    try {
      const result = await getOwnerBookings(Number(hotelId));

      if (requestId !== bookingsRequestId.current) return;

      setBookings(result);
    } catch (err) {
      if (requestId !== bookingsRequestId.current) return;

      setError(getApiErrorMessage(err));
    } finally {
      if (requestId === bookingsRequestId.current) {
        setLoading(false);
      }
    }
  }, [selectedHotelId]);

  useEffect(() => {
    loadHotels();
  }, [loadHotels]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  async function handleCancel(id: number) {
    setError("");
    setSuccess("");
    try {
      await cancelOwnerBooking(id);
      await loadBookings();
      setSuccess("Бронирование отменено.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <main className="page stack-lg">
      <div className="page-header">
        <div>
          <p className="eyebrow">Владелец</p>
          <h1>Бронирования отелей</h1>
        </div>
      </div>

      {error && <p className="alert error">{error}</p>}
      {success && <p className="alert success">{success}</p>}

      <section className="panel stack-sm">
        <label>
          Отель
          <select
            value={selectedHotelId}
            onChange={(event) => setSelectedHotelId(Number(event.target.value))}
          >
            {hotels.map((hotel) => (
              <option key={hotel.id} value={hotel.id}>
                {hotel.name}
              </option>
            ))}
          </select>
        </label>
        {selectedHotel && (
          <p className="muted small">
            {selectedHotel.city} - {selectedHotel.address}
          </p>
        )}
      </section>

      {loading && <p className="muted">Загрузка бронирований...</p>}
      {!loading && bookings.length === 0 && (
        <p className="muted">Для этого отеля бронирования не найдены.</p>
      )}

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
              <p className="muted small">Подтверждение: {booking.guestEmail}</p>
            </div>
            <div className="booking-side">
              <BookingStatusBadge status={booking.status} />
              <strong>{formatCurrency(booking.totalPrice)}</strong>
              {booking.status === BookingDisplayStatus.Active && (
                <button
                  className="button danger"
                  type="button"
                  onClick={() => handleCancel(booking.id)}
                >
                  Отменить
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
