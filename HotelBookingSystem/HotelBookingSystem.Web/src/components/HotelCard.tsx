import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { AvailableRoomTypeResponse, HotelSearchResponse } from "../types";
import { countNights } from "../utils/dates";
import { formatCurrency } from "../utils/format";
import { FavoriteButton } from "./FavoriteButton";
import { ImageWithFallback } from "./ImageWithFallback";

type HotelCardProps = {
  hotel: HotelSearchResponse;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
};

export function HotelCard({
  hotel,
  checkInDate,
  checkOutDate,
  guestsCount,
}: HotelCardProps) {
  const navigate = useNavigate();
  const displayedRoomType = getDisplayedRoomType(hotel.roomTypes);
  const roomCardDescription = displayedRoomType
    ? getRoomCardDescription(displayedRoomType)
    : null;
  const roomBenefit = displayedRoomType
    ? getRoomBenefit(displayedRoomType)
    : null;
  const nights = Math.max(1, countNights(checkInDate, checkOutDate));
  const totalPrice = displayedRoomType
    ? displayedRoomType.price * nights
    : 0;
  const detailsSearch = new URLSearchParams({
    checkInDate,
    checkOutDate,
    guestsCount: guestsCount.toString(),
  });
  const hotelUrl = `/hotels/${hotel.id}?${detailsSearch.toString()}`;

  function openHotel() {
    navigate(hotelUrl);
  }

  function openReviews(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    navigate(`${hotelUrl}#reviews`);
  }

  return (
    <article
      className="hotel-card clickable-card"
      role="link"
      tabIndex={0}
      onClick={openHotel}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openHotel();
        }
      }}
    >
      <ImageWithFallback
        alt={hotel.name}
        className="hotel-card-image"
        src={hotel.imageUrl}
      />
      <FavoriteButton
        className="hotel-card-favorite"
        hotelId={hotel.id}
        stopPropagation
      />
      <div className="hotel-card-body">
        <div className="hotel-card-top">
          <div className="hotel-card-main">
            <h2>{hotel.name}</h2>
            <p className="muted hotel-card-address">
              {hotel.city} - {hotel.address}
            </p>
            {hotel.description && (
              <p className="hotel-card-description">{hotel.description}</p>
            )}
          </div>
          <button
            className="hotel-card-rating"
            type="button"
            onClick={openReviews}
          >
            {hotel.reviewCount > 0 ? (
              <>
                <span className="hotel-card-rating-copy">
                  <strong>{getRatingLabel(hotel.averageRating)}</strong>
                  <span>
                    {hotel.reviewCount.toLocaleString()} review
                    {hotel.reviewCount === 1 ? "" : "s"}
                  </span>
                </span>
                <span className="hotel-card-rating-score">
                  {hotel.averageRating.toFixed(1)}
                </span>
              </>
            ) : (
              <span className="hotel-card-rating-copy">
                <strong>No reviews yet</strong>
              </span>
            )}
          </button>
        </div>

        {displayedRoomType && (
          <div className="hotel-card-bottom">
            <div className="recommended-room">
              <h3>{displayedRoomType.name}</h3>
              {roomCardDescription && (
                <p className="room-short-description">
                  {roomCardDescription}
                </p>
              )}
              {roomBenefit && (
                <p className="room-benefit">
                  <span aria-hidden="true">{"\u2713"}</span>
                  {roomBenefit}
                </p>
              )}
            </div>
            <div className="price-block hotel-card-price">
              <span>
                total for {nights} night{nights === 1 ? "" : "s"}
              </span>
              <strong>{formatCurrency(totalPrice)}</strong>
              <span>{formatCurrency(displayedRoomType.price)}/night</span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function getDisplayedRoomType(roomTypes: AvailableRoomTypeResponse[]) {
  return [...roomTypes].sort((left, right) => {
    if (left.price !== right.price) return left.price - right.price;
    return right.availableCount - left.availableCount;
  })[0];
}

function getRatingLabel(rating: number) {
  if (rating >= 9) return "Superb";
  if (rating >= 8) return "Fabulous";
  if (rating >= 7) return "Very good";
  if (rating >= 6) return "Good";
  return "Review score";
}

function getRoomCardDescription(roomType: AvailableRoomTypeResponse) {
  const description = roomType.description?.trim();
  return description ? shortenText(description, 92) : null;
}

function getRoomBenefit(roomType: AvailableRoomTypeResponse) {
  if (roomType.mealOptions.includes("breakfast-included")) {
    return "Breakfast included";
  }

  if (roomType.mealOptions.includes("all-inclusive")) {
    return "All-inclusive";
  }

  if (roomType.mealOptions.includes("self-catering")) {
    return "Self-catering";
  }

  return null;
}

function shortenText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3).trim()}...`;
}
