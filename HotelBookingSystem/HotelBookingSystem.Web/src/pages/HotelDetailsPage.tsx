import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  addFavorite,
  getFavoriteStatus,
  removeFavorite,
} from "../api/accountApi";
import { createBooking } from "../api/bookingsApi";
import { getApiErrorMessage } from "../api/client";
import {
  createReview,
  getHotelDetails,
  getHotelReviews,
} from "../api/hotelsApi";
import { useAuth } from "../auth/AuthContext";
import { ImageWithFallback } from "../components/ImageWithFallback";
import type { HotelSearchResponse, ReviewResponse } from "../types";
import { countNights, getDefaultStayDates } from "../utils/dates";
import { formatCurrency, formatDateRange } from "../utils/format";

function reviewScoreText(score: number) {
  if (score >= 4.5) return "Excellent";
  if (score >= 4) return "Very good";
  if (score >= 3) return "Good";
  if (score > 0) return "Review score";
  return "No reviews";
}

export function HotelDetailsPage() {
  const { hotelId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const defaults = getDefaultStayDates();

  const numericHotelId = Number(hotelId);
  const checkInDate = searchParams.get("checkInDate") || defaults.checkInDate;
  const checkOutDate =
    searchParams.get("checkOutDate") || defaults.checkOutDate;
  const guestsCount = Number(searchParams.get("guestsCount") || "1");

  const [hotel, setHotel] = useState<HotelSearchResponse | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingRoomTypeId, setBookingRoomTypeId] = useState<number | null>(
    null
  );
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [reviewDraft, setReviewDraft] = useState({
    roomTypeId: "",
    rating: 5,
    comment: "",
  });

  const nights = useMemo(
    () => countNights(checkInDate, checkOutDate),
    [checkInDate, checkOutDate]
  );

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return hotel?.averageRating ?? 0;
    return reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;
  }, [hotel?.averageRating, reviews]);

  const reviewCount = reviews.length || hotel?.reviewCount || 0;

  async function loadReviews(id = numericHotelId) {
    if (!id) return;
    setReviews(await getHotelReviews(id));
  }

  useEffect(() => {
    async function loadHotel() {
      if (!numericHotelId) return;

      setError("");
      setLoading(true);

      try {
        const [hotelResult, reviewResult] = await Promise.all([
          getHotelDetails(numericHotelId, {
            checkInDate,
            checkOutDate,
            guestsCount,
          }),
          getHotelReviews(numericHotelId),
        ]);

        setHotel(hotelResult);
        setReviews(reviewResult);
        setReviewDraft((draft) => ({
          ...draft,
          roomTypeId: hotelResult.roomTypes[0]?.roomTypeId.toString() ?? "",
        }));
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadHotel();
  }, [numericHotelId, checkInDate, checkOutDate, guestsCount]);

  useEffect(() => {
    async function loadFavorite() {
      if (!user || !numericHotelId) {
        setIsFavorite(false);
        return;
      }

      try {
        const result = await getFavoriteStatus(numericHotelId);
        setIsFavorite(result.isFavorite);
      } catch {
        setIsFavorite(false);
      }
    }

    loadFavorite();
  }, [user, numericHotelId]);

  async function handleBook(roomTypeId: number) {
    if (!user) {
      const returnTo = window.location.pathname + window.location.search;
      navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    setError("");
    setSuccess("");
    setBookingRoomTypeId(roomTypeId);

    try {
      await createBooking({ roomTypeId, checkInDate, checkOutDate, guestsCount });
      setSuccess("Booking created. You can see it in My account.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBookingRoomTypeId(null);
    }
  }

  async function handleFavorite() {
    if (!user) {
      const returnTo = window.location.pathname + window.location.search;
      navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    setFavoriteLoading(true);
    setError("");

    try {
      if (isFavorite) {
        await removeFavorite(numericHotelId);
        setIsFavorite(false);
      } else {
        await addFavorite(numericHotelId);
        setIsFavorite(true);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setFavoriteLoading(false);
    }
  }

  async function handleReviewSubmit(event: FormEvent) {
    event.preventDefault();

    if (!user) {
      const returnTo = window.location.pathname + window.location.search;
      navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    setError("");
    setSuccess("");

    try {
      await createReview(numericHotelId, {
        roomTypeId: Number(reviewDraft.roomTypeId),
        rating: reviewDraft.rating,
        comment: reviewDraft.comment || null,
      });
      setSuccess("Review saved.");
      setReviewDraft((draft) => ({ ...draft, comment: "" }));
      await loadReviews();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  if (loading) {
    return (
      <main className="page">
        <p className="muted">Loading hotel...</p>
      </main>
    );
  }

  if (!hotel) {
    return (
      <main className="page stack">
        <p>No hotel found.</p>
        {error && <p className="alert error">{error}</p>}
        <Link to="/">Back to search</Link>
      </main>
    );
  }

  return (
    <main className="page hotel-details-page stack-lg">
      <section className="hotel-detail-shell">
        <div className="hotel-title-row">
          <div className="stack-sm">
            <p className="eyebrow">{hotel.city}</p>
            <h1>{hotel.name}</h1>
            <p className="muted">{hotel.address}</p>
          </div>
          <div className="hotel-actions">
            <button
              className="button secondary"
              type="button"
              disabled={favoriteLoading}
              onClick={handleFavorite}
            >
              {isFavorite ? "Saved" : "Save"}
            </button>
            <Link className="button" to="#rooms">
              See rooms
            </Link>
          </div>
        </div>

        <div className="hotel-media-grid">
          <ImageWithFallback
            alt={hotel.name}
            className="hotel-main-image"
            src={hotel.imageUrl}
          />
          <div className="hotel-info-card panel">
            <div className="review-score">
              <strong>{averageRating > 0 ? averageRating.toFixed(1) : "-"}</strong>
              <div>
                <h3>{reviewScoreText(averageRating)}</h3>
                <p className="muted small">
                  {reviewCount} review{reviewCount === 1 ? "" : "s"}
                </p>
              </div>
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
            {hotel.description && <p>{hotel.description}</p>}
          </div>
        </div>
      </section>

      {error && <p className="alert error">{error}</p>}
      {success && <p className="alert success">{success}</p>}

      <section className="stack" id="rooms">
        <div className="row between wrap gap">
          <div>
            <p className="eyebrow">Availability</p>
            <h2>Choose your room type</h2>
          </div>
          <Link className="button secondary" to="/">
            Change search
          </Link>
        </div>

        {hotel.roomTypes.length === 0 && (
          <p className="muted">No room types are available for these dates.</p>
        )}

        <div className="room-results">
          {hotel.roomTypes.map((roomType) => (
            <article className="room-booking-card" key={roomType.roomTypeId}>
              <ImageWithFallback
                alt={roomType.name}
                className="room-booking-image"
                src={roomType.imageUrl}
              />
              <div className="stack-sm">
                <h3>{roomType.name}</h3>
                {roomType.description && <p>{roomType.description}</p>}
                <div className="pill-row">
                  <span className="pill">Sleeps {roomType.capacity}</span>
                  <span className="pill">
                    {roomType.availableCount} available
                  </span>
                  <span className="pill">
                    {formatCurrency(roomType.price)}/night
                  </span>
                </div>
              </div>
              <div className="booking-side">
                <span className="muted small">Total</span>
                <strong>
                  {formatCurrency(roomType.price * Math.max(1, nights))}
                </strong>
                <button
                  className="button"
                  type="button"
                  disabled={bookingRoomTypeId === roomType.roomTypeId}
                  onClick={() => handleBook(roomType.roomTypeId)}
                >
                  {bookingRoomTypeId === roomType.roomTypeId
                    ? "Booking..."
                    : "Reserve"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="reviews-layout">
        <div className="panel stack">
          <div>
            <p className="eyebrow">Guest reviews</p>
            <h2>Reviews by room type</h2>
          </div>

          {reviews.length === 0 ? (
            <p className="muted">No reviews yet. Be the first to write one.</p>
          ) : (
            <div className="review-list">
              {reviews.map((review) => (
                <article className="review-card" key={review.id}>
                  <div className="row between gap wrap">
                    <div>
                      <strong>{review.userName}</strong>
                      <p className="muted small">{review.roomTypeName}</p>
                    </div>
                    <span className="review-rating">{review.rating}/5</span>
                  </div>
                  {review.comment && <p>{review.comment}</p>}
                </article>
              ))}
            </div>
          )}
        </div>

        <form className="panel stack review-form" onSubmit={handleReviewSubmit}>
          <div>
            <p className="eyebrow">Your stay</p>
            <h2>Write a review</h2>
          </div>
          <label>
            Room type
            <select
              value={reviewDraft.roomTypeId}
              onChange={(event) =>
                setReviewDraft({
                  ...reviewDraft,
                  roomTypeId: event.target.value,
                })
              }
              required
            >
              {hotel.roomTypes.map((roomType) => (
                <option key={roomType.roomTypeId} value={roomType.roomTypeId}>
                  {roomType.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Rating
            <select
              value={reviewDraft.rating}
              onChange={(event) =>
                setReviewDraft({
                  ...reviewDraft,
                  rating: Number(event.target.value),
                })
              }
            >
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Very good</option>
              <option value={3}>3 - Good</option>
              <option value={2}>2 - Fair</option>
              <option value={1}>1 - Poor</option>
            </select>
          </label>
          <label>
            Review
            <textarea
              value={reviewDraft.comment}
              onChange={(event) =>
                setReviewDraft({ ...reviewDraft, comment: event.target.value })
              }
              rows={5}
              placeholder="What should other guests know about this room type?"
            />
          </label>
          <button className="button" type="submit" disabled={hotel.roomTypes.length === 0}>
            Save review
          </button>
          {!user && (
            <p className="muted small">You will be asked to log in before saving.</p>
          )}
        </form>
      </section>
    </main>
  );
}
