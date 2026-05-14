import { api } from "./client";
import type {
  AssignHotelOwnerRequest,
  BookingResponse,
  CreateUserRequest,
  CreateBookingRequest,
  CreateHotelRequest,
  CreateRoomRequest,
  ManagedHotelResponse,
  ManagedRoomResponse,
  ManagedRoomTypeResponse,
  PopularDestinationRequest,
  PopularDestinationResponse,
  RoomTypeRequest,
  UpdateHotelRequest,
  UpdateRoomRequest,
  UpdateRoomTypeRequest,
  UpdateUserRoleRequest,
  UserRoleResponse,
} from "../types";

export async function getAdminHotels(): Promise<ManagedHotelResponse[]> {
  const response = await api.get<ManagedHotelResponse[]>("/hotels");
  return response.data;
}

export async function getAdminHotel(id: number): Promise<ManagedHotelResponse> {
  const response = await api.get<ManagedHotelResponse>(`/hotels/${id}`);
  return response.data;
}

export async function createHotel(
  request: CreateHotelRequest
): Promise<ManagedHotelResponse> {
  const response = await api.post<ManagedHotelResponse>("/admin/hotels", request);
  return response.data;
}

export async function updateHotel(
  hotelId: number,
  request: UpdateHotelRequest
): Promise<ManagedHotelResponse> {
  const response = await api.patch<ManagedHotelResponse>(
    `/admin/hotels/${hotelId}`,
    request
  );
  return response.data;
}

export async function deactivateHotel(hotelId: number): Promise<void> {
  await api.patch(`/admin/hotels/${hotelId}/deactivate`);
}

export async function assignHotelOwner(
  hotelId: number,
  request: AssignHotelOwnerRequest
): Promise<ManagedHotelResponse> {
  const response = await api.patch<ManagedHotelResponse>(
    `/admin/hotels/${hotelId}/owner`,
    request
  );
  return response.data;
}

export async function createRoomType(
  hotelId: number,
  request: RoomTypeRequest
): Promise<ManagedRoomTypeResponse> {
  const response = await api.post<ManagedRoomTypeResponse>(
    `/admin/hotels/${hotelId}/room-types`,
    request
  );
  return response.data;
}

export async function updateRoomType(
  roomTypeId: number,
  request: UpdateRoomTypeRequest
): Promise<ManagedRoomTypeResponse> {
  const response = await api.patch<ManagedRoomTypeResponse>(
    `/admin/room-types/${roomTypeId}`,
    request
  );
  return response.data;
}

export async function deactivateRoomType(roomTypeId: number): Promise<void> {
  await api.patch(`/admin/room-types/${roomTypeId}/deactivate`);
}

export async function createRoom(
  roomTypeId: number,
  request: CreateRoomRequest
): Promise<ManagedRoomResponse> {
  const response = await api.post<ManagedRoomResponse>(
    `/admin/room-types/${roomTypeId}/rooms`,
    request
  );
  return response.data;
}

export async function updateRoom(
  roomId: number,
  request: UpdateRoomRequest
): Promise<ManagedRoomResponse> {
  const response = await api.patch<ManagedRoomResponse>(
    `/admin/rooms/${roomId}`,
    request
  );
  return response.data;
}

export async function deactivateRoom(roomId: number): Promise<void> {
  await api.patch(`/admin/rooms/${roomId}/deactivate`);
}

export async function getAdminBookings(): Promise<BookingResponse[]> {
  const response = await api.get<BookingResponse[]>("/admin/bookings");
  return response.data;
}

export async function cancelAdminBooking(bookingId: number): Promise<void> {
  await api.patch(`/admin/bookings/${bookingId}/cancel`);
}

export async function createBookingForUser(
  userId: number,
  request: CreateBookingRequest
): Promise<BookingResponse> {
  const response = await api.post<BookingResponse>(
    `/admin/users/${userId}/bookings`,
    request
  );
  return response.data;
}

export async function updateUserRole(
  userId: number,
  request: UpdateUserRoleRequest
): Promise<UserRoleResponse> {
  const response = await api.patch<UserRoleResponse>(
    `/admin/users/${userId}/role`,
    request
  );
  return response.data;
}

export async function getUsers(): Promise<UserRoleResponse[]> {
  const response = await api.get<UserRoleResponse[]>("/admin/users");
  return response.data;
}

export async function createUser(
  request: CreateUserRequest
): Promise<UserRoleResponse> {
  const response = await api.post<UserRoleResponse>("/admin/users", request);
  return response.data;
}

export async function getAdminPopularDestinations(): Promise<PopularDestinationResponse[]> {
  const response = await api.get<PopularDestinationResponse[]>(
    "/admin/popular-destinations"
  );
  return response.data;
}

export async function createPopularDestination(
  request: PopularDestinationRequest
): Promise<PopularDestinationResponse> {
  const response = await api.post<PopularDestinationResponse>(
    "/admin/popular-destinations",
    request
  );
  return response.data;
}

export async function updatePopularDestination(
  destinationId: number,
  request: PopularDestinationRequest
): Promise<PopularDestinationResponse> {
  const response = await api.patch<PopularDestinationResponse>(
    `/admin/popular-destinations/${destinationId}`,
    request
  );
  return response.data;
}

export async function deletePopularDestination(destinationId: number): Promise<void> {
  await api.delete(`/admin/popular-destinations/${destinationId}`);
}
