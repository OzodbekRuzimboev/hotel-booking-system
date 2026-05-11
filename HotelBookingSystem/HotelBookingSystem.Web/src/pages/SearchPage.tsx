import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { searchHotels } from "../api/hotelsApi";
import { HotelCard } from "../components/HotelCard";
import {
  SearchCard,
  type SearchCardValues,
} from "../components/SearchCard";
import {
  HOTEL_AMENITIES,
  MEAL_OPTIONS,
  ROOM_AMENITIES,
  type AmenityOption,
} from "../constants/amenities";
import type { HotelSearchResponse } from "../types";
import { isValidStayRange } from "../utils/dates";

type SearchFilters = {
  minNightlyPrice: string;
  maxNightlyPrice: string;
  hotelAmenities: string[];
  roomAmenities: string[];
  mealOptions: string[];
};

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchDraft, setSearchDraft] = useState<SearchCardValues>(() =>
    getSearchValuesFromParams(searchParams)
  );
  const [filters, setFilters] = useState<SearchFilters>(() =>
    createEmptyFilters()
  );
  const [hotels, setHotels] = useState<HotelSearchResponse[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const runSearch = useCallback(
    async (values: SearchCardValues, nextFilters: SearchFilters) => {
      setError("");

      const city = values.city.trim();

      if (!city) {
        setSearched(false);
        setHotels([]);
        return;
      }

      setSearched(true);

      if (!isValidStayRange(values.checkInDate, values.checkOutDate)) {
        setError("Check-out date must be after check-in date.");
        setHotels([]);
        return;
      }

      const minNightlyPrice =
        nextFilters.minNightlyPrice.trim().length > 0
          ? Number(nextFilters.minNightlyPrice)
          : null;
      const maxNightlyPrice =
        nextFilters.maxNightlyPrice.trim().length > 0
          ? Number(nextFilters.maxNightlyPrice)
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
          city,
          checkInDate: values.checkInDate,
          checkOutDate: values.checkOutDate,
          guestsCount: values.guestsCount,
          minNightlyPrice,
          maxNightlyPrice,
          hotelAmenities: nextFilters.hotelAmenities,
          roomAmenities: nextFilters.roomAmenities,
          mealOptions: nextFilters.mealOptions,
        });

        setHotels(result);
      } catch (err) {
        setError(getApiErrorMessage(err));
        setHotels([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const nextSearch = getSearchValuesFromParams(searchParams);
    const nextFilters = createEmptyFilters();

    setSearchDraft(nextSearch);
    setFilters(nextFilters);

    void runSearch(nextSearch, nextFilters);
  }, [runSearch, searchParams]);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    setError("");

    const city = searchDraft.city.trim();

    if (!city) {
      setError("City is required.");
      return;
    }

    if (!isValidStayRange(searchDraft.checkInDate, searchDraft.checkOutDate)) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    setSearchParams(
      new URLSearchParams({
        city,
        checkInDate: searchDraft.checkInDate,
        checkOutDate: searchDraft.checkOutDate,
        guestsCount: searchDraft.guestsCount.toString(),
      })
    );
  }

  async function handleFilterSubmit(event: FormEvent) {
    event.preventDefault();
    await runSearch(searchDraft, filters);
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
    <main className="page stack-lg search-page">
      <section className="stack">
        <div>
          <p className="eyebrow">Find stays</p>
          <h1>Search hotels</h1>
        </div>
        <SearchCard
          className="search-page-card"
          loading={loading}
          values={searchDraft}
          onChange={(values) => {
            setError("");
            setSearchDraft(values);
          }}
          onSubmit={handleSearch}
        />
      </section>

      {error && <p className="alert error">{error}</p>}

      {searched && (
        <div className="page-header">
          <h2 className="results-summary-title">
            {searchDraft.city.trim()}: {hotels.length}{" "}
            {hotels.length === 1 ? "property" : "properties"} found
          </h2>
        </div>
      )}

      {!searched && (
        <p className="muted">Use the search card above to find available hotels.</p>
      )}

      {loading && <p className="muted">Searching hotels...</p>}

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
                checkInDate={searchDraft.checkInDate}
                checkOutDate={searchDraft.checkOutDate}
                guestsCount={searchDraft.guestsCount}
              />
            ))}
          </div>
        </div>
      )}
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

function getSearchValuesFromParams(params: URLSearchParams): SearchCardValues {
  const guestsCount = Number(params.get("guestsCount") ?? 2);

  return {
    city: params.get("city") ?? "",
    checkInDate: params.get("checkInDate") ?? "",
    checkOutDate: params.get("checkOutDate") ?? "",
    guestsCount:
      Number.isFinite(guestsCount) && guestsCount > 0
        ? Math.floor(guestsCount)
        : 2,
  };
}

function createEmptyFilters(): SearchFilters {
  return {
    minNightlyPrice: "",
    maxNightlyPrice: "",
    hotelAmenities: [],
    roomAmenities: [],
    mealOptions: [],
  };
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((current) => current !== value)
    : [...values, value];
}
