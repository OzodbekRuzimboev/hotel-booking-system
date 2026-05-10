import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cancelMyBooking, getMyBookings } from "../api/bookingsApi";
import { getApiErrorMessage } from "../api/client";
import { BookingStatusBadge } from "../components/BookingStatus";
import { getGalleryImages } from "../components/ImageGallery";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { BookingDisplayStatus, type BookingResponse } from "../types";
import { formatCurrency, formatDateRange } from "../utils/format";

export function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
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

  function openHotel(booking: BookingResponse) {
    navigate(getHotelUrl(booking));
  }

  return (
    <main className="page stack-lg">
      <div className="page-header">
        <div>
          <p className="eyebrow">Customer area</p>
          <h1>My bookings</h1>
        </div>
      </div>

      {loading && <p className="muted">Loading bookings...</p>}
      {error && <p className="alert error">{error}</p>}
      {!loading && bookings.length === 0 && (
        <p className="muted">You have no bookings yet.</p>
      )}

      <div className="booking-list">
        {bookings.map((booking) => (
          <article
            className="card booking-card with-image clickable-card"
            key={booking.id}
            role="link"
            tabIndex={0}
            onClick={() => openHotel(booking)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openHotel(booking);
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
              <h2>{booking.hotelName}</h2>
              <p className="muted">{booking.roomTypeName}</p>
              <p>{formatDateRange(booking.checkInDate, booking.checkOutDate)}</p>
              <p>Guests: {booking.guestsCount}</p>
              <p className="muted small">Confirmation: {booking.guestEmail}</p>
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
                  Cancel
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
