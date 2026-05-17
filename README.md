# Hotel Booking System

Full-stack hotel booking app with an ASP.NET Core API, PostgreSQL, and a React/Vite frontend.

## Features

- Search hotels by destination, dates, guest count, amenities, meal options, and price range.
- View hotel details, image galleries, available room types, reviews, and popular destinations.
- Register, log in, refresh sessions, manage profile settings, save favorites, and review hotels.
- Book rooms, view booking history, and cancel active reservations.
- Owner and admin pages for managing hotels, room types, rooms, bookings, users, and popular destinations.

## Architecture

The backend is an ASP.NET Core API with EF Core and PostgreSQL; database migrations run automatically when the API starts. Users authenticate with JWT access tokens and refresh tokens, and authorization is role/permission based for `User`, `Owner`, and `Admin` workflows.

The React app is served by Vite during local development and by nginx in Docker, where nginx also proxies `/api` requests to the API container. The admin panel is available to seeded admin users and provides management screens for hotels, rooms, bookings, users, and popular destinations.

## Tech Stack

- ASP.NET Core
- EF Core
- PostgreSQL
- React
- Vite
- Docker

## Project Structure

- `HotelBookingSystem.Api` - ASP.NET Core API, controllers, services, EF Core entities, migrations, authentication, authorization, and admin seeding.
- `HotelBookingSystem.Web` - React/Vite frontend, routes, pages, shared components, API clients, and nginx config for Docker.
- `HotelBookingSystem.Api.IntegrationTests` - API integration tests using Testcontainers with PostgreSQL.
- `docker-compose.yml` - Local Docker setup for PostgreSQL, API, and web frontend.

## Run With Docker

Prerequisite: Docker Desktop or Docker Engine with Docker Compose.

```bash
docker compose up --build
```

Then open:

- Web app: http://localhost:5173
- API: http://localhost:5126

The API runs EF Core migrations automatically on startup. Docker Compose also creates a local admin account:

```text
Email: admin@example.com
Password: ChangeMe123!
```

These credentials and JWT settings are for local development only.

## Useful Commands

```bash
docker compose down
docker compose down -v
```

Use `docker compose down -v` when you want to delete the local PostgreSQL data and start from an empty database.

## Local Development Without Docker

The API targets .NET 10 and expects PostgreSQL plus these settings:

- `ConnectionStrings:DefaultConnection`
- `Jwt:Issuer`
- `Jwt:Audience`
- `Jwt:Key`
- `Jwt:ExpirationInMinutes`

The frontend is in `HotelBookingSystem.Web`:

```bash
npm install
npm run dev
```

## Configuration

For Docker, the required development values are already set in `docker-compose.yml` under the `api.environment` section. For local development, set them with user secrets, environment variables, or `HotelBookingSystem.Api/appsettings.Development.json`.

Example local API settings:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=hotel_booking;Username=hotel;Password=hotel"
  },
  "Jwt": {
    "Issuer": "StayFinder",
    "Audience": "StayFinder",
    "Key": "replace-with-a-long-local-development-signing-key",
    "ExpirationInMinutes": 120
  },
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:5173"
    ]
  },
  "Admin": {
    "Email": "admin@example.com",
    "Password": "ChangeMe123!"
  }
}
```
