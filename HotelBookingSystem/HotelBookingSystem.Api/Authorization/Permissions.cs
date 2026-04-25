namespace HotelBookingSystem.Api.Authorization
{
    public static class Permissions
    {
        // User bookings
        public const string BookingsCreateOwn = "bookings:create_own";
        public const string BookingsReadOwn = "bookings:read_own";
        public const string BookingsCancelOwn = "bookings:cancel_own";

        // Admin global bookings
        public const string BookingsReadAny = "bookings:read_any";
        public const string BookingsCancelAny = "bookings:cancel_any";

        // Hotels
        public const string HotelsCreate = "hotels:create";
        public const string HotelsUpdateAny = "hotels:update_any";
        public const string HotelsDeactivateAny = "hotels:deactivate_any";
        public const string HotelsAssignOwner = "hotels:assign_owner";

        // RoomTypes
        public const string RoomTypesCreateAny = "room_types:create_any";
        public const string RoomTypesUpdateAny = "room_types:update_any";
        public const string RoomTypesDeactivateAny = "room_types:deactivate_any";

        // Rooms
        public const string RoomsCreateAny = "rooms:create_any";
        public const string RoomsUpdateAny = "rooms:update_any";
        public const string RoomsDeactivateAny = "rooms:deactivate_any";

        // Users
        public const string UsersManageRoles = "users:manage_roles";
    }
}
