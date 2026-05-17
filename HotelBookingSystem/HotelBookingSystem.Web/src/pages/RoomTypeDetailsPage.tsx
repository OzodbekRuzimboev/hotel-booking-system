import { useEffect, useMemo, useRef, useState } from "react";
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
  const loadRequestId = useRef(0);

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
    const requestId = ++loadRequestId.current;

    async function loadRoomType() {
      if (!numericHotelId || !numericRoomTypeId) {
        setHotel(null);
        setLoading(false);
        return;
      }

      setError("");
      setLoading(true);

      try {
        const hotelResult = await getHotelDetails(numericHotelId, {
          checkInDate,
          checkOutDate,
          guestsCount,
        });

        if (requestId !== loadRequestId.current) return;

        setHotel(hotelResult);
      } catch (err) {
        if (requestId !== loadRequestId.current) return;

        setError(getApiErrorMessage(err));
      } finally {
        if (requestId === loadRequestId.current) {
          setLoading(false);
        }
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
        <p className="muted">Загрузка типа номера...</p>
      </main>
    );
  }

  if (!hotel || !roomType) {
    return (
      <main className="page stack">
        <p>Тип номера на выбранные даты не найден.</p>
        {error && <p className="alert error">{error}</p>}
        <Link to="/">Вернуться к поиску</Link>
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
          Вернуться к отелю
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
            <p className="eyebrow">Ваше проживание</p>
            <h2>{formatCurrency(finalPrice)}</h2>
            <p className="muted">
              {formatCurrency(roomType.price)}/ночь
            </p>
          </div>
          <div className="pill-row">
            <span className="pill">{formatDateRange(checkInDate, checkOutDate)}</span>
            <span className="pill">
              ночей: {nights}
            </span>
            <span className="pill">
              гостей: {guestsCount}
            </span>
          </div>
          <div className="stack-sm">
            <p>Мест: {roomType.capacity}</p>
            <p>доступно номеров: {roomType.availableCount}</p>
          </div>
          {canBookRoom && (
            <button className="button" type="button" onClick={handleBook}>
              Забронировать
            </button>
          )}
        </aside>
      </section>

      <section className="panel stack">
        <div>
          <p className="eyebrow">Детали номера</p>
          <h2>Об этом типе номера</h2>
        </div>
        {roomType.description ? (
          <p>{roomType.description}</p>
        ) : (
          <p className="muted">Описание пока не добавлено.</p>
        )}
        <div className="pill-row">
          <span className="pill">Мест: {roomType.capacity}</span>
          <span className="pill">{formatCurrency(roomType.price)}/ночь</span>
          <span className="pill">Итоговая цена {formatCurrency(finalPrice)}</span>
        </div>
        {(roomType.amenities.length > 0 || roomType.mealOptions.length > 0) && (
          <div className="room-feature-row">
            {roomType.amenities.length > 0 && (
              <div>
                <h3>Удобства номера</h3>
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
                <h3>Питание</h3>
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
