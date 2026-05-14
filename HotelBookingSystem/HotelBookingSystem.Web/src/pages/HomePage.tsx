import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getPopularDestinations } from "../api/popularDestinationsApi";
import {
  SearchCard,
  type SearchCardValues,
} from "../components/SearchCard";
import type { PopularDestinationResponse } from "../types";
import { isValidStayRange, toDateInputValue } from "../utils/dates";

type Destination = Pick<
  PopularDestinationResponse,
  "city" | "country" | "imageUrl"
> & {
  id?: number;
};

const DEFAULT_POPULAR_DESTINATIONS: Destination[] = [
  {
    city: "Budapest",
    country: "Hungary",
    imageUrl:
      "https://images.unsplash.com/photo-1549877452-9c387954fbc2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    city: "Prague",
    country: "Czechia",
    imageUrl:
      "https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    city: "Istanbul",
    country: "Turkey",
    imageUrl:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1000&q=80",
  },
  {
    city: "Bucharest",
    country: "Romania",
    imageUrl:
      "https://images.unsplash.com/photo-1584646098378-0874589d76b1?auto=format&fit=crop&w=1000&q=80",
  },
  {
    city: "Paris",
    country: "France",
    imageUrl:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80",
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const [popularDestinations, setPopularDestinations] = useState<Destination[]>(
    DEFAULT_POPULAR_DESTINATIONS
  );
  const [searchDraft, setSearchDraft] = useState<SearchCardValues>({
    city: "",
    checkInDate: "",
    checkOutDate: "",
    guestsCount: 2,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadPopularDestinations() {
      try {
        const destinations = await getPopularDestinations();

        if (!ignore) {
          setPopularDestinations(destinations);
        }
      } catch {
        if (!ignore) {
          setPopularDestinations(DEFAULT_POPULAR_DESTINATIONS);
        }
      }
    }

    void loadPopularDestinations();

    return () => {
      ignore = true;
    };
  }, []);

  function openSearch(values: SearchCardValues) {
    const city = values.city.trim();

    if (!city) {
      setError("City is required.");
      return;
    }

    if (!isValidStayRange(values.checkInDate, values.checkOutDate)) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    const params = new URLSearchParams({
      city,
      checkInDate: values.checkInDate,
      checkOutDate: values.checkOutDate,
      guestsCount: values.guestsCount.toString(),
    });

    navigate(`/search?${params.toString()}`);
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    openSearch(searchDraft);
  }

  function handleDestinationSelect(city: string) {
    const stayDates = getDestinationStayDates(
      searchDraft.checkInDate,
      searchDraft.checkOutDate
    );
    const nextSearch = {
      ...searchDraft,
      city,
      checkInDate: stayDates.checkInDate,
      checkOutDate: stayDates.checkOutDate,
    };

    setSearchDraft(nextSearch);
    openSearch(nextSearch);
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

          <SearchCard
            values={searchDraft}
            onChange={(values) => {
              setError("");
              setSearchDraft(values);
            }}
            onSubmit={handleSearch}
          />
        </div>
      </section>

      <section className="page stack-lg results-section">
        {error && <p className="alert error">{error}</p>}

        <PopularDestinations
          destinations={popularDestinations}
          onSelect={handleDestinationSelect}
        />
      </section>
    </main>
  );
}

function PopularDestinations({
  destinations,
  onSelect,
}: {
  destinations: Destination[];
  onSelect: (city: string) => void;
}) {
  return (
    <section className="popular-destinations stack">
      <div>
        <p className="eyebrow">Explore</p>
        <h2>Popular destinations</h2>
      </div>
      <div className="destination-grid">
        {destinations.map((destination, index) => (
          <button
            aria-label={`Search hotels in ${destination.city}`}
            className={`destination-card ${index < 2 ? "featured" : ""}`}
            key={destination.id ?? `${destination.city}-${destination.country}`}
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(8, 33, 61, 0.72), rgba(8, 33, 61, 0.08) 44%, rgba(8, 33, 61, 0.5)), url("${destination.imageUrl}")`,
            }}
            type="button"
            onClick={() => onSelect(destination.city)}
          >
            <span className="destination-name">{destination.city}</span>
            <span className="destination-country">{destination.country}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function getDestinationStayDates(checkInDate: string, checkOutDate: string) {
  if (isValidStayRange(checkInDate, checkOutDate)) {
    return { checkInDate, checkOutDate };
  }

  return {
    checkInDate: toDateInputValue(addDays(new Date(), 1)),
    checkOutDate: toDateInputValue(addDays(new Date(), 2)),
  };
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}
