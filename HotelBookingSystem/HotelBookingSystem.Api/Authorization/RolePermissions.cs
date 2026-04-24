using HotelBookingSystem.Api.Enums;

namespace HotelBookingSystem.Api.Authorization
{
    public static class RolePermissions
    {
        public static readonly Dictionary<Role, string[]> Map = new()
        {
            [Role.User] =
            [
                Permissions.BookingsCreateOwn,
                Permissions.BookingsReadOwn,
                Permissions.BookingsCancelOwn
            ],

            [Role.Admin] =
            [
                Permissions.BookingsCreateOwn,
                Permissions.BookingsReadOwn,
                Permissions.BookingsCancelOwn,

                Permissions.HotelsCreate,
                Permissions.HotelsUpdate,
                Permissions.HotelsDelete,

                Permissions.RoomTypesCreate,
                Permissions.RoomTypesUpdate,
                Permissions.RoomTypesDelete,

                Permissions.BookingsReadAll,
                Permissions.BookingsCancelAny
            ]
        };
    }
}
