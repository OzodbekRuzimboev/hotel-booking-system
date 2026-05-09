# StayFinder Web

React + Vite front end for the hotel booking system.

## Run locally

```bash
npm install
npm run dev
```

The app expects the API base URL in `.env`:

```env
VITE_API_BASE_URL=http://localhost:5126/api
```

## Build and lint

```bash
npm run build
npm run lint
```

## Main flows

- Search hotels by city, dates, and guests.
- View room availability and book a room type.
- Register or log in without losing the booking page.
- View and cancel customer bookings.
- Manage profile details, account settings, reservations, and favorite hotels.
- Save hotels to favorites and write room-type-specific hotel reviews.
- Manage hotels, room types, rooms, bookings, and user roles from owner/admin pages.
