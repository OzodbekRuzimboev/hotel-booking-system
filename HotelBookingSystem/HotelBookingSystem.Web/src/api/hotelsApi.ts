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
    params: request,
  });

  return response.data;
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
