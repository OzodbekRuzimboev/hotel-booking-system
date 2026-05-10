import { api } from "./client";
import type {
  CreateReviewRequest,
  HotelSearchRequest,
  HotelSearchResponse,
  PublicHotelDetailsRequest,
  ReviewResponse,
} from "../types";

export async function searchHotels(
  request: HotelSearchRequest
): Promise<HotelSearchResponse[]> {
  const response = await api.get<HotelSearchResponse[]>("/hotels/search", {
    params: toSearchParams(request),
  });

  return response.data;
}

function toSearchParams(request: HotelSearchRequest) {
  const params = new URLSearchParams({
    city: request.city,
    checkInDate: request.checkInDate,
    checkOutDate: request.checkOutDate,
    guestsCount: request.guestsCount.toString(),
  });

  if (request.minNightlyPrice !== null && request.minNightlyPrice !== undefined) {
    params.set("minNightlyPrice", request.minNightlyPrice.toString());
  }

  if (request.maxNightlyPrice !== null && request.maxNightlyPrice !== undefined) {
    params.set("maxNightlyPrice", request.maxNightlyPrice.toString());
  }

  request.hotelAmenities?.forEach((amenity) =>
    params.append("hotelAmenities", amenity)
  );
  request.roomAmenities?.forEach((amenity) =>
    params.append("roomAmenities", amenity)
  );
  request.mealOptions?.forEach((mealOption) =>
    params.append("mealOptions", mealOption)
  );

  return params;
}

export async function getHotelDetails(
  hotelId: number,
  request: PublicHotelDetailsRequest
): Promise<HotelSearchResponse> {
  const response = await api.get<HotelSearchResponse>(
    `/hotels/${hotelId}/details`,
    {
      params: request,
    }
  );

  return response.data;
}

export async function getHotelReviews(hotelId: number): Promise<ReviewResponse[]> {
  const response = await api.get<ReviewResponse[]>(`/hotels/${hotelId}/reviews`);
  return response.data;
}

export async function createReview(
  hotelId: number,
  request: CreateReviewRequest
): Promise<ReviewResponse> {
  const response = await api.post<ReviewResponse>(
    `/hotels/${hotelId}/reviews`,
    request
  );
  return response.data;
}

export async function updateReview(
  hotelId: number,
  reviewId: number,
  request: CreateReviewRequest
): Promise<ReviewResponse> {
  const response = await api.patch<ReviewResponse>(
    `/hotels/${hotelId}/reviews/${reviewId}`,
    request
  );
  return response.data;
}

export async function deleteReview(
  hotelId: number,
  reviewId: number
): Promise<void> {
  await api.delete(`/hotels/${hotelId}/reviews/${reviewId}`);
}
