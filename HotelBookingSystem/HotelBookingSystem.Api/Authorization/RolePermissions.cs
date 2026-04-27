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

            [Role.Owner] =
            [
                Permissions.HotelsUpdateOwn,

                Permissions.RoomTypesCreateOwn,
                Permissions.RoomTypesUpdateOwn,
                Permissions.RoomTypesDeactivateOwn,

                Permissions.RoomsCreateOwn,
                Permissions.RoomsUpdateOwn,
                Permissions.RoomsDeactivateOwn,

                Permissions.BookingsReadOwnHotel,
                Permissions.BookingsCancelOwnHotel
            ],

            [Role.Admin] =
            [
                Permissions.BookingsReadAny,
                Permissions.BookingsCancelAny,
                Permissions.BookingsCreateForUser,

                Permissions.HotelsCreate,
                Permissions.HotelsReadAny,
                Permissions.HotelsUpdateAny,
                Permissions.HotelsDeactivateAny,
                Permissions.HotelsAssignOwner,

                Permissions.RoomTypesCreateAny,
                Permissions.RoomTypesUpdateAny,
                Permissions.RoomTypesDeactivateAny,

                Permissions.RoomsCreateAny,
                Permissions.RoomsUpdateAny,
                Permissions.RoomsDeactivateAny,

                Permissions.UsersManageRoles
            ]
        };
    }
}
