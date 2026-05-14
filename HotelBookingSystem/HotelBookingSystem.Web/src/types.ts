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
  profileImageUrl?: string | null;
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
  minNightlyPrice?: number | null;
  maxNightlyPrice?: number | null;
  hotelAmenities?: string[];
  roomAmenities?: string[];
  mealOptions?: string[];
};

export type PopularDestinationResponse = {
  id: number;
  city: string;
  country: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
};

export type PopularDestinationRequest = {
  city: string;
  country: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
};

export type AvailableRoomTypeResponse = {
  roomTypeId: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  imageUrls: string[];
  capacity: number;
  price: number;
  availableCount: number;
  amenities: string[];
  mealOptions: string[];
};

export type HotelSearchResponse = {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  imageUrls: string[];
  city: string;
  address: string;
  averageRating: number;
  reviewCount: number;
  amenities: string[];
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
  imageUrls: string[];
  city: string;
  address: string;
  isActive: boolean;
  ownerId?: number | null;
  averageRating: number;
  reviewCount: number;
  amenities: string[];
  roomTypes: RoomTypeResponse[];
};

export type RoomTypeResponse = {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  imageUrls: string[];
  capacity: number;
  price: number;
  totalCount: number;
  amenities: string[];
  mealOptions: string[];
};

export type CreateBookingRequest = {
  roomTypeId: number;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  guestEmail: string;
  guestCountry?: string | null;
  guestPhoneNumber?: string | null;
};

export type BookingResponse = {
  id: number;
  userId: number;
  roomId: number;
  hotelId: number;
  hotelName: string;
  hotelImageUrl?: string | null;
  hotelImageUrls: string[];
  roomTypeName: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  totalPrice: number;
  guestEmail: string;
  guestCountry?: string | null;
  guestPhoneNumber?: string | null;
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
  imageUrls: string[];
  capacity: number;
  price: number;
  amenities: string[];
  mealOptions: string[];
  rooms: RoomRequest[];
};

export type CreateHotelRequest = {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  imageUrls: string[];
  city: string;
  address: string;
  amenities: string[];
  roomTypes: RoomTypeRequest[];
};

export type UpdateHotelRequest = {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  imageUrls: string[];
  city: string;
  address: string;
  amenities: string[];
};

export type UpdateRoomTypeRequest = {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  imageUrls: string[];
  capacity: number;
  price: number;
  amenities: string[];
  mealOptions: string[];
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
  imageUrls: string[];
  capacity: number;
  price: number;
  isActive: boolean;
  totalRooms: number;
  activeRooms: number;
  amenities: string[];
  mealOptions: string[];
  rooms: ManagedRoomResponse[];
};

export type ManagedHotelResponse = {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  imageUrls: string[];
  city: string;
  address: string;
  isActive: boolean;
  ownerId?: number | null;
  amenities: string[];
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
  profileImageUrl?: string | null;
  settings: AccountSettings;
};

export type UpdateProfileRequest = {
  name: string;
  phoneNumber?: string | null;
  country?: string | null;
  profileImageUrl?: string | null;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
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
  errors?: Record<string, string[]>;
};
