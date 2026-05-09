import { Link } from "react-router-dom";
import type { HotelSearchResponse } from "../types";
import { formatCurrency } from "../utils/format";
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
  const lowestPrice = Math.min(
    ...hotel.roomTypes.map((roomType) => roomType.price)
  );
  const detailsSearch = new URLSearchParams({
    checkInDate,
    checkOutDate,
    guestsCount: guestsCount.toString(),
  });

  return (
    <article className="hotel-card">
      <ImageWithFallback
        alt={hotel.name}
        className="hotel-card-image"
        src={hotel.imageUrl}
      />
      <div className="hotel-card-body">
        <div className="row between gap hotel-card-top">
          <div>
            <h2>{hotel.name}</h2>
            <p className="muted">
              {hotel.city} - {hotel.address}
            </p>
          </div>
          {Number.isFinite(lowestPrice) && (
            <div className="price-block">
              <span>from</span>
              <strong>{formatCurrency(lowestPrice)}</strong>
            </div>
          )}
        </div>

        {hotel.description && <p>{hotel.description}</p>}

        <div className="pill-row">
          <span className="pill">
            {hotel.reviewCount > 0
              ? `${hotel.averageRating.toFixed(1)} review score`
              : "No reviews yet"}
          </span>
          {hotel.roomTypes.slice(0, 4).map((roomType) => (
            <span className="pill" key={roomType.roomTypeId}>
              {roomType.name}: {roomType.availableCount} available
            </span>
          ))}
        </div>

        <Link
          className="button inline-button"
          to={`/hotels/${hotel.id}?${detailsSearch.toString()}`}
        >
          View hotel
        </Link>
      </div>
    </article>
  );
}
