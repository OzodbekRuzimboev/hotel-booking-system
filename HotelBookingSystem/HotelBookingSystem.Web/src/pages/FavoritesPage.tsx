import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFavorites } from "../api/accountApi";
import { getApiErrorMessage } from "../api/client";
import { ImageWithFallback } from "../components/ImageWithFallback";
import type { FavoriteHotelResponse } from "../types";

export function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteHotelResponse[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadFavorites() {
    setError("");
    setLoading(true);

    try {
      setFavorites(await getFavorites());
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <main className="page stack-lg">
      <div className="page-header">
        <div>
          <p className="eyebrow">Saved stays</p>
          <h1>Favorites</h1>
        </div>
      </div>

      {loading && <p className="muted">Loading favorites...</p>}
      {error && <p className="alert error">{error}</p>}

      {!loading && favorites.length === 0 ? (
        <section className="panel stack">
          <p className="muted">Save hotels from the hotel page to see them here.</p>
          <Link className="button inline-button" to="/">
            Find hotels
          </Link>
        </section>
      ) : (
        <div className="favorite-grid">
          {favorites.map((favorite) => (
            <Link
              className="favorite-card clickable-card"
              key={favorite.hotelId}
              to={`/hotels/${favorite.hotelId}?guestsCount=2`}
            >
              <ImageWithFallback
                alt={favorite.name}
                className="favorite-image"
                src={favorite.imageUrl}
              />
              <div className="stack-sm">
                <h3>{favorite.name}</h3>
                <p className="muted">
                  {favorite.city} - {favorite.address}
                </p>
                <div className="pill-row">
                  <span className="pill">
                    {favorite.reviewCount > 0
                      ? `${favorite.averageRating.toFixed(1)} review score`
                      : "No reviews yet"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
