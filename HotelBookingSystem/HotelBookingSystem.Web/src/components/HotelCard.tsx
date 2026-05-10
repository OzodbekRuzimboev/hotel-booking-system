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
  const recommendedRoomType = getRecommendedRoomType(hotel.roomTypes);
  const nights = Math.max(1, countNights(checkInDate, checkOutDate));
  const totalPrice = recommendedRoomType
    ? recommendedRoomType.price * nights
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
        <div className="row between gap hotel-card-top">
          <div>
            <h2>{hotel.name}</h2>
            <p className="muted">
              {hotel.city} - {hotel.address}
            </p>
            {hotel.description && (
              <p className="hotel-card-description">{hotel.description}</p>
            )}
          </div>
          {recommendedRoomType && (
            <div className="price-block">
              <span>
                total for {nights} night{nights === 1 ? "" : "s"}
              </span>
              <strong>{formatCurrency(totalPrice)}</strong>
              <span>{formatCurrency(recommendedRoomType.price)}/night</span>
            </div>
          )}
        </div>

        <div className="pill-row">
          <button
            className="pill review-pill-button"
            type="button"
            onClick={openReviews}
          >
            {hotel.reviewCount > 0
              ? `${hotel.averageRating.toFixed(1)} rating - ${hotel.reviewCount} review${hotel.reviewCount === 1 ? "" : "s"}`
              : "No reviews yet"}
          </button>
        </div>

        {recommendedRoomType && (
          <div className="recommended-room stack-sm">
            <p className="eyebrow">Recommended room</p>
            <h3>{recommendedRoomType.name}</h3>
            <p>{getRoomTypeSummary(recommendedRoomType)}</p>
            <div className="pill-row">
              <span className="pill">
                {recommendedRoomType.availableCount} available
              </span>
              <span className="pill">Sleeps {recommendedRoomType.capacity}</span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function getRecommendedRoomType(roomTypes: AvailableRoomTypeResponse[]) {
  return [...roomTypes].sort((left, right) => {
    if (left.price !== right.price) return left.price - right.price;
    return right.availableCount - left.availableCount;
  })[0];
}

function getRoomTypeSummary(roomType: AvailableRoomTypeResponse) {
  const text = `${roomType.name} ${roomType.description ?? ""}`.toLowerCase();

  if (text.includes("king")) return "1 king bed";
  if (text.includes("queen")) return "1 queen bed";
  if (text.includes("twin")) return "2 twin beds";
  if (text.includes("double")) return "1 double bed";
  if (text.includes("suite")) return "Separate living area";

  if (roomType.capacity === 1) return "1 single bed";
  if (roomType.capacity === 2) return "1 double bed";
  return `Sleeps ${roomType.capacity} guests`;
}
