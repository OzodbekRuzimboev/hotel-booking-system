# Hotel Booking System API

Backend API for a hotel booking system. The project is currently backend-only; no frontend is included yet.

## Features

- User registration, login, logout, JWT access tokens, and refresh-token rotation
- Role-based access control for `User`, `Owner`, and `Admin`
- Public hotel search by city, dates, and guest count
- Room availability checks with booking-overlap protection
- User booking creation, listing, and cancellation
- Admin management for hotels, rooms, bookings, owners, and user roles
- Owner management for assigned hotels, rooms, room types, and bookings
- Centralized exception handling and validation responses
- OpenAPI/Scalar API documentation in development
- Integration tests using xUnit and Testcontainers PostgreSQL

## Tech Stack

- ASP.NET Core Web API (`net10.0`)
- Entity Framework Core
- PostgreSQL via Npgsql
- JWT Bearer authentication
- Scalar/OpenAPI
- xUnit, FluentAssertions, Testcontainers

## Project Structure

```text
HotelBookingSystem.Api/                   # Main Web API project
HotelBookingSystem.Api.IntegrationTests/  # Integration tests
```

## Requirements

- .NET SDK compatible with `net10.0`
- PostgreSQL
- Docker, only needed for running integration tests
- EF Core CLI, only needed when applying migrations manually

Install EF Core CLI if needed:

```bash
dotnet tool install --global dotnet-ef
```

## Configuration

The API expects configuration values for PostgreSQL, JWT, and optionally the initial admin user.

Recommended local setup with user secrets:

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=hotel_booking;Username=postgres;Password=postgres" --project HotelBookingSystem.Api

dotnet user-secrets set "Jwt:Issuer" "HotelBookingSystem" --project HotelBookingSystem.Api
dotnet user-secrets set "Jwt:Audience" "HotelBookingSystem.Client" --project HotelBookingSystem.Api
dotnet user-secrets set "Jwt:Key" "change-this-to-a-long-random-secret-key-at-least-32-characters" --project HotelBookingSystem.Api
dotnet user-secrets set "Jwt:ExpirationInMinutes" "60" --project HotelBookingSystem.Api

dotnet user-secrets set "Admin:Email" "admin@example.com" --project HotelBookingSystem.Api
dotnet user-secrets set "Admin:Password" "Admin12345!" --project HotelBookingSystem.Api
```

`Admin:Email` and `Admin:Password` are optional. If both are provided, the app seeds an initial admin account on startup.

## Database

Apply migrations:

```bash
dotnet ef database update --project HotelBookingSystem.Api
```

The migrations create the database schema and add a PostgreSQL exclusion constraint to prevent overlapping active bookings for the same room.

## Run the API

```bash
dotnet run --project HotelBookingSystem.Api
```

In development, OpenAPI and Scalar API documentation are enabled.

## Run Tests

Integration tests use Testcontainers, so Docker must be running.

```bash
dotnet test HotelBookingSystem.Api.IntegrationTests/HotelBookingSystem.Api.IntegrationTests.csproj
```

## API Documentation

When running in development mode, API documentation is available through Scalar/OpenAPI.

Main API areas:

- Authentication
- Public hotel search
- User bookings
- Admin management
- Owner management

## Status

This project is still in development. The backend API is implemented, but the frontend is not included yet.
