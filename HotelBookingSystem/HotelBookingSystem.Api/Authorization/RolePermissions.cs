using HotelBookingSystem.Api.Authorization;
using HotelBookingSystem.Api.Enums;

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

            Permissions.BookingsReadAny,
            Permissions.BookingsCancelAny,

            Permissions.HotelsCreate,
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