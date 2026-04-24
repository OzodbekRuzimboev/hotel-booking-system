namespace HotelBookingSystem.Api.Authorization
{
    public static class Permissions
    {
        public const string HotelsCreate = "hotels:create";
        public const string HotelsUpdate = "hotels:update";
        public const string HotelsDelete = "hotels:delete";

        public const string RoomTypesCreate = "room_types:create";
        public const string RoomTypesUpdate = "room_types:update";
        public const string RoomTypesDelete = "room_types:delete";

        public const string BookingsCreateOwn = "bookings:create_own";
        public const string BookingsReadOwn = "bookings:read_own";
        public const string BookingsReadAll = "bookings:read_all";
        public const string BookingsCancelOwn = "bookings:cancel_own";
        public const string BookingsCancelAny = "bookings:cancel_any";
    }
}
