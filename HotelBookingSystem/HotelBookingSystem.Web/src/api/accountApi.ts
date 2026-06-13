import { api } from "./client";
import type {
  ChangePasswordRequest,
  FavoriteHotelResponse,
  FavoriteStatusResponse,
  UpdateProfileRequest,
  UserAccountResponse,
} from "../types";

export async function getAccount(): Promise<UserAccountResponse> {
  const response = await api.get<UserAccountResponse>("/account/me");
  return response.data;
}

export async function updateProfile(
  request: UpdateProfileRequest
): Promise<UserAccountResponse> {
  const response = await api.patch<UserAccountResponse>(
    "/account/profile",
    request
  );
  return response.data;
}

export async function changePassword(
  request: ChangePasswordRequest
): Promise<void> {
  await api.patch("/account/password", request);
}

export async function getFavorites(): Promise<FavoriteHotelResponse[]> {
  const response = await api.get<FavoriteHotelResponse[]>("/account/favorites");
  return response.data;
}

export async function getFavoriteStatus(
  hotelId: number
): Promise<FavoriteStatusResponse> {
  const response = await api.get<FavoriteStatusResponse>(
    `/account/favorites/${hotelId}`
  );
  return response.data;
}

export async function addFavorite(hotelId: number): Promise<void> {
  await api.post(`/account/favorites/${hotelId}`);
}

export async function removeFavorite(hotelId: number): Promise<void> {
  await api.delete(`/account/favorites/${hotelId}`);
}
