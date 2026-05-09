export const Role = {
  User: 0,
  Owner: 1,
  Admin: 2,
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const BookingDisplayStatus = {
  Active: 0,
  Cancelled: 1,
  Completed: 2,
} as const;

export type BookingDisplayStatus =
  (typeof BookingDisplayStatus)[keyof typeof BookingDisplayStatus];

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  userId: number;
  name: string;
  email: string;
  role: Role;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  role?: Role;
};

export type HotelSearchRequest = {
  city: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
};

export type AvailableRoomTypeResponse = {
  roomTypeId: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  capacity: number;
  price: number;
  availableCount: number;
};

export type HotelSearchResponse = {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  city: string;
  address: string;
  averageRating: number;
  reviewCount: number;
  roomTypes: AvailableRoomTypeResponse[];
};

export type PublicHotelDetailsRequest = {
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
};

export type HotelDetailsResponse = {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  city: string;
  address: string;
  isActive: boolean;
  ownerId?: number | null;
  averageRating: number;
  reviewCount: number;
  roomTypes: RoomTypeResponse[];
};

export type RoomTypeResponse = {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  capacity: number;
  price: number;
  totalCount: number;
};

export type CreateBookingRequest = {
  roomTypeId: number;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
};

export type BookingResponse = {
  id: number;
  userId: number;
  roomId: number;
  hotelName: string;
  roomTypeName: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  totalPrice: number;
  status: BookingDisplayStatus;
  createdAt: string;
  cancelledAt?: string | null;
};

export type RoomRequest = {
  number: string;
};

export type RoomTypeRequest = {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  capacity: number;
  price: number;
  rooms: RoomRequest[];
};

export type CreateHotelRequest = {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  city: string;
  address: string;
  roomTypes: RoomTypeRequest[];
};

export type UpdateHotelRequest = {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  city: string;
  address: string;
};

export type UpdateRoomTypeRequest = {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  capacity: number;
  price: number;
};

export type CreateRoomRequest = {
  number: string;
};

export type UpdateRoomRequest = {
  number: string;
};

export type ManagedRoomResponse = {
  id: number;
  roomTypeId: number;
  number: string;
  isActive: boolean;
};

export type ManagedRoomTypeResponse = {
  id: number;
  hotelId: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  capacity: number;
  price: number;
  isActive: boolean;
  totalRooms: number;
  activeRooms: number;
  rooms: ManagedRoomResponse[];
};

export type ManagedHotelResponse = {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  city: string;
  address: string;
  isActive: boolean;
  ownerId?: number | null;
  roomTypes: ManagedRoomTypeResponse[];
};

export type AssignHotelOwnerRequest = {
  ownerId: number;
};

export type UpdateUserRoleRequest = {
  role: Role;
};

export type UserRoleResponse = {
  id: number;
  name: string;
  email: string;
  role: Role;
  phoneNumber?: string | null;
  country?: string | null;
};

export type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

export type AccountSettings = {
  preferredCurrency: string;
  preferredLanguage: string;
  emailNotificationsEnabled: boolean;
};

export type UserAccountResponse = {
  id: number;
  name: string;
  email: string;
  role: Role;
  phoneNumber?: string | null;
  country?: string | null;
  settings: AccountSettings;
};

export type UpdateProfileRequest = {
  name: string;
  phoneNumber?: string | null;
  country?: string | null;
};

export type FavoriteHotelResponse = {
  hotelId: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  city: string;
  address: string;
  averageRating: number;
  reviewCount: number;
  addedAt: string;
};

export type FavoriteStatusResponse = {
  isFavorite: boolean;
};

export type ReviewResponse = {
  id: number;
  hotelId: number;
  roomTypeId: number;
  roomTypeName: string;
  userId: number;
  userName: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt?: string | null;
};

export type CreateReviewRequest = {
  roomTypeId: number;
  rating: number;
  comment?: string | null;
};

export type ProblemDetails = {
  status?: number;
  title?: string;
  detail?: string;
  instance?: string;
  traceId?: string;
};
