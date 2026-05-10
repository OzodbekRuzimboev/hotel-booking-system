import { useState, type FormEvent } from "react";
import { getApiErrorMessage } from "../api/client";
import { searchHotels } from "../api/hotelsApi";
import { HotelCard } from "../components/HotelCard";
import {
  HOTEL_AMENITIES,
  MEAL_OPTIONS,
  ROOM_AMENITIES,
  type AmenityOption,
} from "../constants/amenities";
import type { HotelSearchResponse } from "../types";
import {
  isValidStayRange,
  toDateInputValue,
} from "../utils/dates";

type SearchFilters = {
  minNightlyPrice: string;
  maxNightlyPrice: string;
  hotelAmenities: string[];
  roomAmenities: string[];
  mealOptions: string[];
};

export function HomePage() {
  const today = toDateInputValue(new Date());
  const [city, setCity] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guestsCount, setGuestsCount] = useState(2);
  const [filters, setFilters] = useState<SearchFilters>({
    minNightlyPrice: "",
    maxNightlyPrice: "",
    hotelAmenities: [],
    roomAmenities: [],
    mealOptions: [],
  });

  const [hotels, setHotels] = useState<HotelSearchResponse[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function runSearch() {
    setError("");

    if (!isValidStayRange(checkInDate, checkOutDate)) {
      setError("Check-out date must be after check-in date.");
      setHotels([]);
      return;
    }

    const minNightlyPrice =
      filters.minNightlyPrice.trim().length > 0
        ? Number(filters.minNightlyPrice)
        : null;
    const maxNightlyPrice =
      filters.maxNightlyPrice.trim().length > 0
        ? Number(filters.maxNightlyPrice)
        : null;

    if (
      (minNightlyPrice !== null &&
        (!Number.isFinite(minNightlyPrice) || minNightlyPrice <= 0)) ||
      (maxNightlyPrice !== null &&
        (!Number.isFinite(maxNightlyPrice) || maxNightlyPrice <= 0))
    ) {
      setError("Nightly budget must be a positive number.");
      setHotels([]);
      return;
    }

    if (
      minNightlyPrice !== null &&
      maxNightlyPrice !== null &&
      minNightlyPrice > maxNightlyPrice
    ) {
      setError("Minimum nightly budget cannot be greater than maximum nightly budget.");
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
        minNightlyPrice,
        maxNightlyPrice,
        hotelAmenities: filters.hotelAmenities,
        roomAmenities: filters.roomAmenities,
        mealOptions: filters.mealOptions,
      });

      setHotels(result);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setHotels([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    setSearched(true);
    await runSearch();
  }

  async function handleFilterSubmit(event: FormEvent) {
    event.preventDefault();
    setSearched(true);
    await runSearch();
  }

  function toggleFilter(
    key: keyof Pick<SearchFilters, "hotelAmenities" | "roomAmenities" | "mealOptions">,
    value: string
  ) {
    setFilters((current) => ({
      ...current,
      [key]: toggleValue(current[key], value),
    }));
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

        {searched && (
          <div className="search-results-layout">
            <form className="filter-panel panel stack" onSubmit={handleFilterSubmit}>
              <div>
                <p className="eyebrow">Filters</p>
                <h3>Refine your stay</h3>
              </div>
              <label>
                Nightly budget
                <div className="budget-range">
                  <input
                    inputMode="decimal"
                    min={1}
                    placeholder="From"
                    type="number"
                    value={filters.minNightlyPrice}
                    onChange={(event) =>
                      setFilters({
                        ...filters,
                        minNightlyPrice: event.target.value,
                      })
                    }
                  />
                  <input
                    inputMode="decimal"
                    min={1}
                    placeholder="To"
                    type="number"
                    value={filters.maxNightlyPrice}
                    onChange={(event) =>
                      setFilters({
                        ...filters,
                        maxNightlyPrice: event.target.value,
                      })
                    }
                  />
                </div>
              </label>
              <FilterGroup
                options={HOTEL_AMENITIES}
                selected={filters.hotelAmenities}
                title="Hotel amenities"
                onToggle={(value) => toggleFilter("hotelAmenities", value)}
              />
              <FilterGroup
                options={ROOM_AMENITIES}
                selected={filters.roomAmenities}
                title="Room amenities"
                onToggle={(value) => toggleFilter("roomAmenities", value)}
              />
              <FilterGroup
                options={MEAL_OPTIONS}
                selected={filters.mealOptions}
                title="Meals"
                onToggle={(value) => toggleFilter("mealOptions", value)}
              />
              <button className="button" disabled={loading} type="submit">
                Apply filters
              </button>
            </form>

            <div className="hotel-results">
              {!loading && hotels.length === 0 && !error && (
                <p className="muted">
                  No hotels match the selected city, dates, guests, and filters.
                </p>
              )}

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
          </div>
        )}
      </section>
    </main>
  );
}

function FilterGroup({
  options,
  selected,
  title,
  onToggle,
}: {
  options: AmenityOption[];
  selected: string[];
  title: string;
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset className="filter-group">
      <legend>{title}</legend>
      {options.map((option) => (
        <label className="filter-option" key={option.value}>
          <input
            checked={selected.includes(option.value)}
            type="checkbox"
            onChange={() => onToggle(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((current) => current !== value)
    : [...values, value];
}
