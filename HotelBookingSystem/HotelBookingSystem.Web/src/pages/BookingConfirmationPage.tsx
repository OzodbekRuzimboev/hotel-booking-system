import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getAccount } from "../api/accountApi";
import { createBooking } from "../api/bookingsApi";
import { getApiErrorMessage } from "../api/client";
import { getHotelDetails } from "../api/hotelsApi";
import { getGalleryImages, ImageGallery } from "../components/ImageGallery";
import type {
  AvailableRoomTypeResponse,
  BookingResponse,
  HotelSearchResponse,
} from "../types";
import { countNights, getDefaultStayDates } from "../utils/dates";
import { formatCurrency, formatDateRange } from "../utils/format";

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function BookingConfirmationPage() {
  const [searchParams] = useSearchParams();
  const defaults = getDefaultStayDates();
  const hotelId = Number(searchParams.get("hotelId") || "0");
  const roomTypeId = Number(searchParams.get("roomTypeId") || "0");
  const checkInDate = searchParams.get("checkInDate") || defaults.checkInDate;
  const checkOutDate =
    searchParams.get("checkOutDate") || defaults.checkOutDate;
  const guestsCount = Number(searchParams.get("guestsCount") || "1");

  const [hotel, setHotel] = useState<HotelSearchResponse | null>(null);
  const [contact, setContact] = useState({
    guestEmail: "",
    guestCountry: "",
    guestPhoneNumber: "",
  });
  const [createdBooking, setCreatedBooking] = useState<BookingResponse | null>(
    null
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const loadRequestId = useRef(0);

  const roomType = useMemo<AvailableRoomTypeResponse | undefined>(
    () =>
      hotel?.roomTypes.find(
        (currentRoomType) => currentRoomType.roomTypeId === roomTypeId
      ),
    [hotel, roomTypeId]
  );
  const nights = countNights(checkInDate, checkOutDate);
  const finalPrice = roomType ? roomType.price * Math.max(1, nights) : 0;

  useEffect(() => {
    const requestId = ++loadRequestId.current;

    async function loadBookingDetails() {
      if (!hotelId || !roomTypeId) {
        setHotel(null);
        setLoading(false);
        return;
      }

      setError("");
      setLoading(true);

      try {
        const [hotelResult, accountResult] = await Promise.all([
          getHotelDetails(hotelId, {
            checkInDate,
            checkOutDate,
            guestsCount,
          }),
          getAccount(),
        ]);

        if (requestId !== loadRequestId.current) return;

        setHotel(hotelResult);
        setContact({
          guestEmail: accountResult.email,
          guestCountry: accountResult.country ?? "",
          guestPhoneNumber: accountResult.phoneNumber ?? "",
        });
      } catch (err) {
        if (requestId !== loadRequestId.current) return;

        setError(getApiErrorMessage(err));
      } finally {
        if (requestId === loadRequestId.current) {
          setLoading(false);
        }
      }
    }

    loadBookingDetails();
  }, [hotelId, roomTypeId, checkInDate, checkOutDate, guestsCount]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!roomType) return;

    setError("");
    setSubmitting(true);

    try {
      setCreatedBooking(
        await createBooking({
          roomTypeId: roomType.roomTypeId,
          checkInDate,
          checkOutDate,
          guestsCount,
          guestEmail: contact.guestEmail,
          guestCountry: optionalText(contact.guestCountry),
          guestPhoneNumber: optionalText(contact.guestPhoneNumber),
        })
      );
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="page">
        <p className="muted">Loading booking details...</p>
      </main>
    );
  }

  if (!hotel || !roomType) {
    return (
      <main className="page stack">
        <p>Booking details are not available for these dates.</p>
        {error && <p className="alert error">{error}</p>}
        <Link to="/">Back to search</Link>
      </main>
    );
  }

  if (createdBooking) {
    return (
      <main className="page stack-lg">
        <section className="panel stack">
          <div>
            <p className="eyebrow">Confirmed</p>
            <h1>Booking #{createdBooking.id}</h1>
          </div>
          <p>
            Confirmation has been sent to {createdBooking.guestEmail}. You can
            manage this reservation in your bookings.
          </p>
          <div className="booking-confirmed-grid">
            <div>
              <h2>{createdBooking.hotelName}</h2>
              <p className="muted">{createdBooking.roomTypeName}</p>
              <p>{formatDateRange(createdBooking.checkInDate, createdBooking.checkOutDate)}</p>
              <p>Guests: {createdBooking.guestsCount}</p>
            </div>
            <div className="booking-side">
              <strong>{formatCurrency(createdBooking.totalPrice)}</strong>
              <Link className="button" to="/my-bookings">
                My bookings
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page booking-page stack-lg">
      <div className="page-header">
        <div>
          <p className="eyebrow">Reservation</p>
          <h1>Confirm booking</h1>
        </div>
        <Link
          className="button secondary"
          to={`/hotels/${hotel.id}/room-types/${roomType.roomTypeId}?${new URLSearchParams({
            checkInDate,
            checkOutDate,
            guestsCount: guestsCount.toString(),
          }).toString()}`}
        >
          Review room
        </Link>
      </div>

      {error && <p className="alert error">{error}</p>}

      <div className="booking-layout">
        <section className="panel stack">
          <ImageGallery
            alt={roomType.name}
            images={getGalleryImages(roomType.imageUrls, roomType.imageUrl)}
          />
          <div>
            <h2>{hotel.name}</h2>
            <p className="muted">{hotel.city} - {hotel.address}</p>
          </div>
          <div className="pill-row">
            <span className="pill">{roomType.name}</span>
            <span className="pill">{formatDateRange(checkInDate, checkOutDate)}</span>
            <span className="pill">
              {guestsCount} guest{guestsCount === 1 ? "" : "s"}
            </span>
          </div>
          <div className="price-total">
            <span className="muted">Final price</span>
            <strong>{formatCurrency(finalPrice)}</strong>
          </div>
        </section>

        <form className="panel stack booking-form" onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">Contact</p>
            <h2>Guest information</h2>
          </div>
          <label>
            Email address
            <input
              type="email"
              value={contact.guestEmail}
              onChange={(event) =>
                setContact({ ...contact, guestEmail: event.target.value })
              }
              required
            />
          </label>
          <label>
            Country
            <input
              value={contact.guestCountry}
              onChange={(event) =>
                setContact({ ...contact, guestCountry: event.target.value })
              }
              placeholder="Uzbekistan"
            />
          </label>
          <label>
            Phone number
            <input
              value={contact.guestPhoneNumber}
              onChange={(event) =>
                setContact({
                  ...contact,
                  guestPhoneNumber: event.target.value,
                })
              }
              placeholder="+998 90 123 45 67"
            />
          </label>
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? "Confirming..." : "Confirm booking"}
          </button>
        </form>
      </div>
    </main>
  );
}
