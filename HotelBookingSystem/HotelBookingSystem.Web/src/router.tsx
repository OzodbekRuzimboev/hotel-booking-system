import { createBrowserRouter } from "react-router-dom";
import { Role } from "./types";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { RoleRoute } from "./auth/RoleRoute";
import { AppLayout } from "./components/AppLayout";

import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { HotelDetailsPage } from "./pages/HotelDetailsPage";
import { RoomTypeDetailsPage } from "./pages/RoomTypeDetailsPage";
import { BookingConfirmationPage } from "./pages/BookingConfirmationPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { PartnerPage } from "./pages/PartnerPage";
import { MyBookingsPage } from "./pages/MyBookingsPage";
import { AccountPage } from "./pages/AccountPage";
import { FavoritesPage } from "./pages/FavoritesPage";

import { OwnerHotelsPage } from "./pages/owner/OwnerHotelsPage";
import { OwnerHotelDetailsPage } from "./pages/owner/OwnerHotelDetailsPage";
import { OwnerBookingsPage } from "./pages/owner/OwnerBookingsPage";

import { AdminHotelsPage } from "./pages/admin/AdminHotelsPage";
import { AdminHotelDetailsPage } from "./pages/admin/AdminHotelDetailsPage";
import { AdminBookingsPage } from "./pages/admin/AdminBookingsPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/hotels/:hotelId", element: <HotelDetailsPage /> },
      { path: "/hotels/:hotelId/room-types/:roomTypeId", element: <RoomTypeDetailsPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/list-your-property", element: <PartnerPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/account", element: <AccountPage /> },
          {
            element: <RoleRoute allowed={[Role.User]} />,
            children: [
              { path: "/favorites", element: <FavoritesPage /> },
              { path: "/my-bookings", element: <MyBookingsPage /> },
              { path: "/bookings/new", element: <BookingConfirmationPage /> },
            ],
          },
        ],
      },
      {
        element: <RoleRoute allowed={[Role.Owner]} />,
        children: [
          { path: "/owner/hotels", element: <OwnerHotelsPage /> },
          { path: "/owner/hotels/:hotelId", element: <OwnerHotelDetailsPage /> },
          { path: "/owner/bookings", element: <OwnerBookingsPage /> },
        ],
      },
      {
        element: <RoleRoute allowed={[Role.Admin]} />,
        children: [
          { path: "/admin/hotels", element: <AdminHotelsPage /> },
          { path: "/admin/hotels/:hotelId", element: <AdminHotelDetailsPage /> },
          { path: "/admin/bookings", element: <AdminBookingsPage /> },
          { path: "/admin/users", element: <AdminUsersPage /> },
        ],
      },
    ],
  },
]);
