import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cancelMyBooking, getMyBookings } from "../api/bookingsApi";
import { getApiErrorMessage } from "../api/client";
import { BookingStatusBadge } from "../components/BookingStatus";
import { getGalleryImages } from "../components/ImageGallery";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { BookingDisplayStatus, type BookingResponse } from "../types";
import { formatCurrency, formatDateRange } from "../utils/format";

export function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadBookings() {
    setError("");
    setLoading(true);

    try {
      setBookings(await getMyBookings());
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id: number) {
    setError("");

    try {
      await cancelMyBooking(id);
      await loadBookings();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  function getHotelUrl(booking: BookingResponse) {
    return `/hotels/${booking.hotelId}?guestsCount=${booking.guestsCount}`;
  }

  function toggleBookingDetails(booking: BookingResponse) {
    setSelectedBookingId((current) =>
      current === booking.id ? null : booking.id
    );
  }

  return (
    <main className="page stack-lg">
      <div className="page-header">
        <div>
          <h1>Мои бронирования</h1>
        </div>
      </div>

      {loading && <p className="muted">Загрузка бронирований...</p>}
      {error && <p className="alert error">{error}</p>}
      {!loading && bookings.length === 0 && (
        <p className="muted">У вас пока нет бронирований.</p>
      )}

      <div className="booking-list">
        {bookings.map((booking) => (
          <article
            className="card booking-card with-image clickable-card"
            key={booking.id}
            aria-expanded={selectedBookingId === booking.id}
            role="button"
            tabIndex={0}
            onClick={() => toggleBookingDetails(booking)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleBookingDetails(booking);
              }
            }}
          >
            <ImageWithFallback
              alt={booking.hotelName}
              className="booking-hotel-image"
              src={getGalleryImages(
                booking.hotelImageUrls,
                booking.hotelImageUrl
              )[0]}
            />
            <div>
              <h2>
                <Link
                  className="booking-hotel-link"
                  to={getHotelUrl(booking)}
                  onClick={(event) => event.stopPropagation()}
                >
                  {booking.hotelName}
                </Link>
              </h2>
              <p className="muted">{booking.roomTypeName}</p>
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
                  onClick={(event) => {
                    event.stopPropagation();
                    handleCancel(booking.id);
                  }}
                >
                  Отменить
                </button>
              )}
            </div>
            {selectedBookingId === booking.id && (
              <div
                className="booking-details"
                onClick={(event) => event.stopPropagation()}
              >
                <BookingDetail label="ID бронирования" value={`#${booking.id}`} />
                <BookingDetail label="Отель" value={booking.hotelName} />
                <BookingDetail label="Тип номера" value={booking.roomTypeName} />
                <BookingDetail label="Номер комнаты" value={booking.roomNumber} />
                <BookingDetail
                  label="Даты проживания"
                  value={formatDateRange(
                    booking.checkInDate,
                    booking.checkOutDate
                  )}
                />
                <BookingDetail
                  label="Гости"
                  value={booking.guestsCount.toString()}
                />
                <BookingDetail
                  label="Итоговая цена"
                  value={formatCurrency(booking.totalPrice)}
                />
                <BookingDetail label="Электронная почта гостя" value={booking.guestEmail} />
                <BookingDetail
                  label="Страна гостя"
                  value={booking.guestCountry ?? "Не указано"}
                />
                <BookingDetail
                  label="Телефон гостя"
                  value={booking.guestPhoneNumber ?? "Не указано"}
                />
                <BookingDetail
                  label="Забронировано"
                  value={new Date(booking.createdAt).toLocaleString("ru-RU")}
                />
                {booking.cancelledAt && (
                  <BookingDetail
                    label="Отменено"
                    value={new Date(booking.cancelledAt).toLocaleString("ru-RU")}
                  />
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}

function BookingDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="booking-detail">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
