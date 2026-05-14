import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import {
  createReview,
  deleteReview,
  getHotelDetails,
  getHotelReviews,
  updateReview,
} from "../api/hotelsApi";
import { useAuth } from "../auth/AuthContext";
import { FavoriteButton } from "../components/FavoriteButton";
import { getGalleryImages, ImageGallery } from "../components/ImageGallery";
import { ImageWithFallback } from "../components/ImageWithFallback";
import {
  getAmenityLabels,
  HOTEL_AMENITIES,
  MEAL_OPTIONS,
  ROOM_AMENITIES,
} from "../constants/amenities";
import { Role, type HotelSearchResponse, type ReviewResponse } from "../types";
import {
  countNights,
  getDefaultStayDates,
  isValidStayRange,
  toDateInputValue,
} from "../utils/dates";
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
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const defaults = getDefaultStayDates();

  const numericHotelId = Number(hotelId);
  const checkInDate = searchParams.get("checkInDate") || defaults.checkInDate;
  const checkOutDate =
    searchParams.get("checkOutDate") || defaults.checkOutDate;
  const guestsCount = Number(searchParams.get("guestsCount") || "2");
  const today = toDateInputValue(new Date());
  const canBookRoom = !user || user.role === Role.User;

  const [hotel, setHotel] = useState<HotelSearchResponse | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [reviewDraft, setReviewDraft] = useState({
    roomTypeId: "",
    rating: 5,
    comment: "",
  });
  const loadRequestId = useRef(0);
  const [searchDraft, setSearchDraft] = useState({
    checkInDate,
    checkOutDate,
    guestsCount,
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
    setSearchDraft({
      checkInDate,
      checkOutDate,
      guestsCount,
    });
  }, [checkInDate, checkOutDate, guestsCount]);

  useEffect(() => {
    const requestId = ++loadRequestId.current;

    async function loadHotel() {
      if (!numericHotelId) {
        setHotel(null);
        setReviews([]);
        setLoading(false);
        return;
      }

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

        if (requestId !== loadRequestId.current) return;

        setHotel(hotelResult);
        setReviews(reviewResult);
        setReviewDraft((draft) => ({
          ...draft,
          roomTypeId: hotelResult.roomTypes[0]?.roomTypeId.toString() ?? "",
        }));
      } catch (err) {
        if (requestId !== loadRequestId.current) return;

        setError(getApiErrorMessage(err));
      } finally {
        if (requestId === loadRequestId.current) {
          setLoading(false);
        }
      }
    }

    loadHotel();
  }, [numericHotelId, checkInDate, checkOutDate, guestsCount]);

  useEffect(() => {
    if (location.hash !== "#reviews" || !hotel) return;

    requestAnimationFrame(() => {
      document.getElementById("reviews")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [hotel, location.hash]);

  function getBookingUrl(roomTypeId: number) {
    const bookingSearch = new URLSearchParams({
      hotelId: numericHotelId.toString(),
      roomTypeId: roomTypeId.toString(),
      checkInDate,
      checkOutDate,
      guestsCount: guestsCount.toString(),
    });

    return `/bookings/new?${bookingSearch.toString()}`;
  }

  function getRoomTypeUrl(roomTypeId: number) {
    return `/hotels/${numericHotelId}/room-types/${roomTypeId}?${new URLSearchParams({
      checkInDate,
      checkOutDate,
      guestsCount: guestsCount.toString(),
    }).toString()}`;
  }

  function handleSearchParameterSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!isValidStayRange(searchDraft.checkInDate, searchDraft.checkOutDate)) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    navigate(
      `/hotels/${numericHotelId}?${new URLSearchParams({
        checkInDate: searchDraft.checkInDate,
        checkOutDate: searchDraft.checkOutDate,
        guestsCount: searchDraft.guestsCount.toString(),
      }).toString()}`
    );
  }

  function handleBook(roomTypeId: number) {
    if (user && user.role !== Role.User) return;

    const bookingUrl = getBookingUrl(roomTypeId);

    if (!user) {
      navigate(`/login?returnTo=${encodeURIComponent(bookingUrl)}`);
      return;
    }

    navigate(bookingUrl);
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

  async function handleReviewUpdate(
    review: ReviewResponse,
    rating: number,
    comment: string
  ) {
    setError("");
    setSuccess("");

    try {
      await updateReview(numericHotelId, review.id, {
        roomTypeId: review.roomTypeId,
        rating,
        comment: comment || null,
      });
      setSuccess("Review updated.");
      await loadReviews();
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return false;
    }
  }

  async function handleReviewDelete(reviewId: number) {
    setError("");
    setSuccess("");

    try {
      await deleteReview(numericHotelId, reviewId);
      setSuccess("Review deleted.");
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
            <FavoriteButton hotelId={numericHotelId} />
          </div>
        </div>

        <div className="hotel-media-grid">
          <ImageGallery
            alt={hotel.name}
            images={getGalleryImages(hotel.imageUrls, hotel.imageUrl)}
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

        {hotel.amenities.length > 0 && (
          <section className="amenity-section">
            <p className="eyebrow">Hotel amenities</p>
            <div className="amenity-grid">
              {getAmenityLabels(hotel.amenities, HOTEL_AMENITIES).map((amenity) => (
                <span className="amenity-chip" key={amenity}>
                  {amenity}
                </span>
              ))}
            </div>
          </section>
        )}
      </section>

      {error && <p className="alert error">{error}</p>}
      {success && <p className="alert success">{success}</p>}

      <section className="stack" id="rooms">
        <div className="row between wrap gap">
          <div>
            <p className="eyebrow">Availability</p>
            <h2>Choose your room type</h2>
          </div>
        </div>

        <form
          className="availability-search-form panel"
          onSubmit={handleSearchParameterSubmit}
        >
          <label>
            Check-in
            <input
              type="date"
              min={today}
              value={searchDraft.checkInDate}
              onChange={(event) =>
                setSearchDraft({
                  ...searchDraft,
                  checkInDate: event.target.value,
                })
              }
              required
            />
          </label>
          <label>
            Check-out
            <input
              type="date"
              min={searchDraft.checkInDate || today}
              value={searchDraft.checkOutDate}
              onChange={(event) =>
                setSearchDraft({
                  ...searchDraft,
                  checkOutDate: event.target.value,
                })
              }
              required
            />
          </label>
          <label>
            Guests
            <input
              type="number"
              min={1}
              value={searchDraft.guestsCount}
              onChange={(event) =>
                setSearchDraft({
                  ...searchDraft,
                  guestsCount: Number(event.target.value),
                })
              }
              required
            />
          </label>
          <button className="button" type="submit">
            Change search parameters
          </button>
        </form>

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
                <h3>
                  <Link
                    className="room-type-name-link"
                    to={getRoomTypeUrl(roomType.roomTypeId)}
                  >
                    {roomType.name}
                  </Link>
                </h3>
                {roomType.description && <p>{roomType.description}</p>}
                <div className="pill-row">
                  <span className="pill">Sleeps {roomType.capacity}</span>
                  <span className="pill">
                    {roomType.availableCount} available
                  </span>
                  <span className="pill">
                    Final price {formatCurrency(roomType.price * Math.max(1, nights))}
                  </span>
                </div>
                {(roomType.amenities.length > 0 ||
                  roomType.mealOptions.length > 0) && (
                  <div className="amenity-chip-row compact">
                    {getAmenityLabels(roomType.amenities, ROOM_AMENITIES).map(
                      (amenity) => (
                        <span className="amenity-chip small" key={amenity}>
                          {amenity}
                        </span>
                      )
                    )}
                    {getAmenityLabels(roomType.mealOptions, MEAL_OPTIONS).map(
                      (mealOption) => (
                        <span className="amenity-chip small" key={mealOption}>
                          {mealOption}
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>
              <div className="booking-side">
                <span className="muted small">
                  Total for {Math.max(1, nights)} night{Math.max(1, nights) === 1 ? "" : "s"}
                </span>
                <strong>
                  {formatCurrency(roomType.price * Math.max(1, nights))}
                </strong>
                <span>{formatCurrency(roomType.price)}/night</span>
                {canBookRoom && (
                  <button
                    className="button"
                    type="button"
                    onClick={() => handleBook(roomType.roomTypeId)}
                  >
                    Reserve
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="reviews-layout" id="reviews">
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
                <ReviewCard
                  canManage={user?.userId === review.userId}
                  key={review.id}
                  onDelete={handleReviewDelete}
                  onUpdate={handleReviewUpdate}
                  review={review}
                />
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

function ReviewCard({
  review,
  canManage,
  onUpdate,
  onDelete,
}: {
  review: ReviewResponse;
  canManage: boolean;
  onUpdate: (
    review: ReviewResponse,
    rating: number,
    comment: string
  ) => Promise<boolean>;
  onDelete: (reviewId: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment ?? "");

  useEffect(() => {
    setRating(review.rating);
    setComment(review.comment ?? "");
  }, [review]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const saved = await onUpdate(review, rating, comment);
    if (saved) setEditing(false);
  }

  async function handleDelete() {
    if (!window.confirm("Delete this review?")) return;
    await onDelete(review.id);
  }

  if (editing) {
    return (
      <article className="review-card">
        <form className="form" onSubmit={handleSubmit}>
          <div className="row between gap wrap">
            <div>
              <strong>{review.userName}</strong>
              <p className="muted small">{review.roomTypeName}</p>
            </div>
            <label className="compact-field">
              Rating
              <select
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
              >
                <option value={5}>5</option>
                <option value={4}>4</option>
                <option value={3}>3</option>
                <option value={2}>2</option>
                <option value={1}>1</option>
              </select>
            </label>
          </div>
          <label>
            Review
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
            />
          </label>
          <div className="row gap wrap">
            <button className="button secondary" type="submit">
              Save
            </button>
            <button
              className="button secondary"
              type="button"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article className="review-card">
      <div className="row between gap wrap">
        <div>
          <strong>{review.userName}</strong>
          <p className="muted small">{review.roomTypeName}</p>
        </div>
        <span className="review-rating">{review.rating}/5</span>
      </div>
      {review.comment && <p>{review.comment}</p>}
      {canManage && (
        <div className="row gap wrap">
          <button
            className="mini-button"
            type="button"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
          <button
            className="mini-button danger-text"
            type="button"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
}
