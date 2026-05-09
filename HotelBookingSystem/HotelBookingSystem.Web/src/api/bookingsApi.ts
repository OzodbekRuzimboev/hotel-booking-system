import { api } from "./client";
import type { BookingResponse, CreateBookingRequest } from "../types";

export async function createBooking(
  request: CreateBookingRequest
): Promise<BookingResponse> {
  const response = await api.post<BookingResponse>("/bookings", request);
  return response.data;
}

export async function getMyBookings(): Promise<BookingResponse[]> {
  const response = await api.get<BookingResponse[]>("/bookings/my");
  return response.data;
}

export async function cancelMyBooking(id: number): Promise<void> {
  await api.patch(`/bookings/${id}/cancel`);
}