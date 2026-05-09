import { useState, type FormEvent } from "react";
import { getApiErrorMessage } from "../api/client";
import { searchHotels } from "../api/hotelsApi";
import { HotelCard } from "../components/HotelCard";
import type { HotelSearchResponse } from "../types";
import {
  getDefaultStayDates,
  isValidStayRange,
  toDateInputValue,
} from "../utils/dates";

const popularCities = ["Tashkent", "Samarkand", "Bukhara"];

export function HomePage() {
  const defaults = getDefaultStayDates();
  const today = toDateInputValue(new Date());
  const [city, setCity] = useState("Tashkent");
  const [checkInDate, setCheckInDate] = useState(defaults.checkInDate);
  const [checkOutDate, setCheckOutDate] = useState(defaults.checkOutDate);
  const [guestsCount, setGuestsCount] = useState(1);

  const [hotels, setHotels] = useState<HotelSearchResponse[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSearched(true);

    if (!isValidStayRange(checkInDate, checkOutDate)) {
      setError("Check-out date must be after check-in date.");
      setHotels([]);
      return;
    }

    setLoading(true);

    try {
      const result = await searchHotels({
        city: city.trim(),
        checkInDate,
        checkOutDate,
        guestsCount,
      });

      setHotels(result);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setHotels([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-content stack-lg">
          <div className="stack-sm">
            <p className="eyebrow">Hotel stays</p>
            <h1>Find your next stay</h1>
            <p className="lead">
              City breaks, business nights, and quiet weekend rooms in one
              simple search.
            </p>
          </div>

          <form className="search-form hero-search" onSubmit={handleSearch}>
            <label>
              City
              <input
                placeholder="City"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                required
              />
            </label>

            <label>
              Check-in
              <input
                type="date"
                min={today}
                value={checkInDate}
                onChange={(event) => setCheckInDate(event.target.value)}
                required
              />
            </label>

            <label>
              Check-out
              <input
                type="date"
                min={checkInDate || today}
                value={checkOutDate}
                onChange={(event) => setCheckOutDate(event.target.value)}
                required
              />
            </label>

            <label>
              Guests
              <input
                type="number"
                min={1}
                value={guestsCount}
                onChange={(event) => setGuestsCount(Number(event.target.value))}
                required
              />
            </label>

            <button className="button search-button" disabled={loading} type="submit">
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          <div className="city-chip-row" aria-label="Popular cities">
            {popularCities.map((popularCity) => (
              <button
                className="city-chip"
                key={popularCity}
                type="button"
                onClick={() => setCity(popularCity)}
              >
                {popularCity}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="page stack-lg results-section">
        {error && <p className="alert error">{error}</p>}

        <div className="page-header">
          <div>
            <p className="eyebrow">Available hotels</p>
            <h2>Search results</h2>
          </div>
          {searched && (
            <span className="muted small">
              {hotels.length} hotel{hotels.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {loading && <p className="muted">Searching hotels...</p>}

        {!searched && (
          <p className="muted">
            Choose a city and dates to see available hotels.
          </p>
        )}

        {searched && !loading && hotels.length === 0 && !error && (
          <p className="muted">
            No hotels match the selected city, dates, and guest count.
          </p>
        )}

        <div className="hotel-results">
          {hotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              checkInDate={checkInDate}
              checkOutDate={checkOutDate}
              guestsCount={guestsCount}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
