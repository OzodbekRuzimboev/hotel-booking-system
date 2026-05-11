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
            {selectedBookingId === booking.id && (
              <div
                className="booking-details"
                onClick={(event) => event.stopPropagation()}
              >
                <BookingDetail label="Booking ID" value={`#${booking.id}`} />
                <BookingDetail label="Hotel" value={booking.hotelName} />
                <BookingDetail label="Room type" value={booking.roomTypeName} />
                <BookingDetail label="Room number" value={booking.roomNumber} />
                <BookingDetail
                  label="Stay dates"
                  value={formatDateRange(
                    booking.checkInDate,
                    booking.checkOutDate
                  )}
                />
                <BookingDetail
                  label="Guests"
                  value={booking.guestsCount.toString()}
                />
                <BookingDetail
                  label="Total price"
                  value={formatCurrency(booking.totalPrice)}
                />
                <BookingDetail label="Guest email" value={booking.guestEmail} />
                <BookingDetail
                  label="Guest country"
                  value={booking.guestCountry ?? "Not provided"}
                />
                <BookingDetail
                  label="Guest phone"
                  value={booking.guestPhoneNumber ?? "Not provided"}
                />
                <BookingDetail
                  label="Booked"
                  value={new Date(booking.createdAt).toLocaleString()}
                />
                {booking.cancelledAt && (
                  <BookingDetail
                    label="Cancelled"
                    value={new Date(booking.cancelledAt).toLocaleString()}
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
