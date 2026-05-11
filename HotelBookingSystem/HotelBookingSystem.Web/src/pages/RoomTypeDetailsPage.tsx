import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { getHotelDetails } from "../api/hotelsApi";
import { useAuth } from "../auth/AuthContext";
import { getGalleryImages, ImageGallery } from "../components/ImageGallery";
import {
  getAmenityLabels,
  MEAL_OPTIONS,
  ROOM_AMENITIES,
} from "../constants/amenities";
import {
  Role,
  type AvailableRoomTypeResponse,
  type HotelSearchResponse,
} from "../types";
import { countNights, getDefaultStayDates } from "../utils/dates";
import { formatCurrency, formatDateRange } from "../utils/format";

export function RoomTypeDetailsPage() {
  const { hotelId, roomTypeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const defaults = getDefaultStayDates();

  const numericHotelId = Number(hotelId);
  const numericRoomTypeId = Number(roomTypeId);
  const checkInDate = searchParams.get("checkInDate") || defaults.checkInDate;
  const checkOutDate =
    searchParams.get("checkOutDate") || defaults.checkOutDate;
  const guestsCount = Number(searchParams.get("guestsCount") || "1");
  const canBookRoom = !user || user.role === Role.User;

  const [hotel, setHotel] = useState<HotelSearchResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roomType = useMemo<AvailableRoomTypeResponse | undefined>(
    () =>
      hotel?.roomTypes.find(
        (currentRoomType) => currentRoomType.roomTypeId === numericRoomTypeId
      ),
    [hotel, numericRoomTypeId]
  );

  const nights = countNights(checkInDate, checkOutDate);
  const finalPrice = roomType ? roomType.price * Math.max(1, nights) : 0;

  useEffect(() => {
    async function loadRoomType() {
      if (!numericHotelId || !numericRoomTypeId) return;

      setError("");
      setLoading(true);

      try {
        setHotel(
          await getHotelDetails(numericHotelId, {
            checkInDate,
            checkOutDate,
            guestsCount,
          })
        );
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadRoomType();
  }, [numericHotelId, numericRoomTypeId, checkInDate, checkOutDate, guestsCount]);

  function handleBook() {
    if (!roomType) return;
    if (user && user.role !== Role.User) return;

    const bookingSearch = new URLSearchParams({
      hotelId: numericHotelId.toString(),
      roomTypeId: roomType.roomTypeId.toString(),
      checkInDate,
      checkOutDate,
      guestsCount: guestsCount.toString(),
    });
    const bookingUrl = `/bookings/new?${bookingSearch.toString()}`;

    if (!user) {
      navigate(`/login?returnTo=${encodeURIComponent(bookingUrl)}`);
      return;
    }

    navigate(bookingUrl);
  }

  if (loading) {
    return (
      <main className="page">
        <p className="muted">Loading room type...</p>
      </main>
    );
  }

  if (!hotel || !roomType) {
    return (
      <main className="page stack">
        <p>No room type found for these dates.</p>
        {error && <p className="alert error">{error}</p>}
        <Link to="/">Back to search</Link>
      </main>
    );
  }

  return (
    <main className="page room-detail-page stack-lg">
      <div className="page-header">
        <div>
          <p className="eyebrow">{hotel.name}</p>
          <h1>{roomType.name}</h1>
          <p className="muted">
            {hotel.city} - {hotel.address}
          </p>
        </div>
        <Link
          className="button secondary"
          to={`/hotels/${hotel.id}?${new URLSearchParams({
            checkInDate,
            checkOutDate,
            guestsCount: guestsCount.toString(),
          }).toString()}`}
        >
          Back to hotel
        </Link>
      </div>

      {error && <p className="alert error">{error}</p>}

      <section className="room-detail-layout">
        <ImageGallery
          alt={roomType.name}
          images={getGalleryImages(roomType.imageUrls, roomType.imageUrl)}
        />

        <aside className="panel stack booking-summary">
          <div>
            <p className="eyebrow">Your stay</p>
            <h2>{formatCurrency(finalPrice)}</h2>
            <p className="muted">
              {formatCurrency(roomType.price)}/night
            </p>
          </div>
          <div className="pill-row">
            <span className="pill">{formatDateRange(checkInDate, checkOutDate)}</span>
            <span className="pill">
              {nights} night{nights === 1 ? "" : "s"}
            </span>
            <span className="pill">
              {guestsCount} guest{guestsCount === 1 ? "" : "s"}
            </span>
          </div>
          <div className="stack-sm">
            <p>Sleeps {roomType.capacity}</p>
            <p>{roomType.availableCount} room{roomType.availableCount === 1 ? "" : "s"} available</p>
          </div>
          {canBookRoom && (
            <button className="button" type="button" onClick={handleBook}>
              Reserve
            </button>
          )}
        </aside>
      </section>

      <section className="panel stack">
        <div>
          <p className="eyebrow">Room details</p>
          <h2>About this room type</h2>
        </div>
        {roomType.description ? (
          <p>{roomType.description}</p>
        ) : (
          <p className="muted">No description has been added yet.</p>
        )}
        <div className="pill-row">
          <span className="pill">Capacity {roomType.capacity}</span>
          <span className="pill">{formatCurrency(roomType.price)}/night</span>
          <span className="pill">Final price {formatCurrency(finalPrice)}</span>
        </div>
        {(roomType.amenities.length > 0 || roomType.mealOptions.length > 0) && (
          <div className="room-feature-row">
            {roomType.amenities.length > 0 && (
              <div>
                <h3>Room amenities</h3>
                <div className="amenity-chip-row">
                  {getAmenityLabels(roomType.amenities, ROOM_AMENITIES).map(
                    (amenity) => (
                      <span className="amenity-chip" key={amenity}>
                        {amenity}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
            {roomType.mealOptions.length > 0 && (
              <div>
                <h3>Meals</h3>
                <div className="amenity-chip-row">
                  {getAmenityLabels(roomType.mealOptions, MEAL_OPTIONS).map(
                    (mealOption) => (
                      <span className="amenity-chip" key={mealOption}>
                        {mealOption}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
