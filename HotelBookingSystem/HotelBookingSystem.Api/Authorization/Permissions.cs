namespace HotelBookingSystem.Api.Authorization
{
    public static class Permissions
    {
        // User bookings
        public const string BookingsCreateOwn = "bookings:create_own";
        public const string BookingsReadOwn = "bookings:read_own";
        public const string BookingsCancelOwn = "bookings:cancel_own";

        // Owner bookings
        public const string BookingsReadOwnHotels = "bookings:read_own_hotel";
        public const string BookingsCancelOwnHotels = "bookings:cancel_own_hotel";

        // Admin global bookings
        public const string BookingsReadAny = "bookings:read_any";
        public const string BookingsCancelAny = "bookings:cancel_any";
        public const string BookingsCreateForUser = "bookings:create_for_user";

        // Hotels
        public const string HotelsCreate = "hotels:create";
        public const string HotelsUpdateAny = "hotels:update_any";
        public const string HotelsDeactivateAny = "hotels:deactivate_any";
        public const string HotelsAssignOwner = "hotels:assign_owner";

        public const string HotelsUpdateOwn = "hotels:update_own";

        // RoomTypes
        public const string RoomTypesCreateAny = "room_types:create_any";
        public const string RoomTypesUpdateAny = "room_types:update_any";
        public const string RoomTypesDeactivateAny = "room_types:deactivate_any";

        public const string RoomTypesCreateOwn = "room_types:create_own";
        public const string RoomTypesUpdateOwn = "room_types:update_own";
        public const string RoomTypesDeactivateOwn = "room_types:deactivate_own";

        // Rooms
        public const string RoomsCreateAny = "rooms:create_any";
        public const string RoomsUpdateAny = "rooms:update_any";
        public const string RoomsDeactivateAny = "rooms:deactivate_any";

        public const string RoomsCreateOwn = "rooms:create_own";
        public const string RoomsUpdateOwn = "rooms:update_own";
        public const string RoomsDeactivateOwn = "rooms:deactivate_own";

        // Users
        public const string UsersManageRoles = "users:manage_roles";
    }
}
