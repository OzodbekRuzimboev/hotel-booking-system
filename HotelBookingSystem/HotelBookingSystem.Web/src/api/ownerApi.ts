import { api } from "./client";
import type {
  BookingResponse,
  CreateHotelRequest,
  CreateRoomRequest,
  ManagedHotelResponse,
  ManagedRoomResponse,
  ManagedRoomTypeResponse,
  RoomTypeRequest,
  UpdateHotelRequest,
  UpdateRoomRequest,
  UpdateRoomTypeRequest,
} from "../types";

export async function getOwnerHotels(): Promise<ManagedHotelResponse[]> {
  const response = await api.get<ManagedHotelResponse[]>("/owner/hotels");
  return response.data;
}

export async function getOwnerHotel(id: number): Promise<ManagedHotelResponse> {
  const response = await api.get<ManagedHotelResponse>(`/owner/hotels/${id}`);
  return response.data;
}

export async function createOwnerHotel(
  request: CreateHotelRequest
): Promise<ManagedHotelResponse> {
  const response = await api.post<ManagedHotelResponse>("/owner/hotels", request);
  return response.data;
}

export async function updateOwnerHotel(
  hotelId: number,
  request: UpdateHotelRequest
): Promise<ManagedHotelResponse> {
  const response = await api.patch<ManagedHotelResponse>(
    `/owner/hotels/${hotelId}`,
    request
  );
  return response.data;
}

export async function createOwnerRoomType(
  hotelId: number,
  request: RoomTypeRequest
): Promise<ManagedRoomTypeResponse> {
  const response = await api.post<ManagedRoomTypeResponse>(
    `/owner/hotels/${hotelId}/room-types`,
    request
  );
  return response.data;
}

export async function updateOwnerRoomType(
  roomTypeId: number,
  request: UpdateRoomTypeRequest
): Promise<ManagedRoomTypeResponse> {
  const response = await api.patch<ManagedRoomTypeResponse>(
    `/owner/room-types/${roomTypeId}`,
    request
  );
  return response.data;
}

export async function deactivateOwnerRoomType(roomTypeId: number): Promise<void> {
  await api.patch(`/owner/room-types/${roomTypeId}/deactivate`);
}

export async function createOwnerRoom(
  roomTypeId: number,
  request: CreateRoomRequest
): Promise<ManagedRoomResponse> {
  const response = await api.post<ManagedRoomResponse>(
    `/owner/room-types/${roomTypeId}/rooms`,
    request
  );
  return response.data;
}

export async function updateOwnerRoom(
  roomId: number,
  request: UpdateRoomRequest
): Promise<ManagedRoomResponse> {
  const response = await api.patch<ManagedRoomResponse>(
    `/owner/rooms/${roomId}`,
    request
  );
  return response.data;
}

export async function deactivateOwnerRoom(roomId: number): Promise<void> {
  await api.patch(`/owner/rooms/${roomId}/deactivate`);
}

export async function getOwnerBookings(hotelId: number): Promise<BookingResponse[]> {
  const response = await api.get<BookingResponse[]>("/owner/bookings", {
    params: { hotelId },
  });
  return response.data;
}

export async function cancelOwnerBooking(bookingId: number): Promise<void> {
  await api.patch(`/owner/bookings/${bookingId}/cancel`);
}
