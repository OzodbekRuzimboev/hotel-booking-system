import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getFavorites } from "../api/accountApi";
import { getApiErrorMessage } from "../api/client";
import { FavoriteButton } from "../components/FavoriteButton";
import { ImageWithFallback } from "../components/ImageWithFallback";
import type { FavoriteHotelResponse } from "../types";

export function FavoritesPage() {
  const navigate = useNavigate();
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

  function getHotelUrl(favorite: FavoriteHotelResponse) {
    return `/hotels/${favorite.hotelId}?guestsCount=2`;
  }

  function openHotel(favorite: FavoriteHotelResponse) {
    navigate(getHotelUrl(favorite));
  }

  return (
    <main className="page stack-lg">
      <div className="page-header">
        <div>
          <p className="eyebrow">Сохраненные отели</p>
          <h1>Избранное</h1>
        </div>
      </div>

      {loading && <p className="muted">Загрузка избранного...</p>}
      {error && <p className="alert error">{error}</p>}

      {!loading && favorites.length === 0 ? (
        <section className="panel stack">
          <p className="muted">Сохраняйте отели со страницы отеля, чтобы видеть их здесь.</p>
          <Link className="button inline-button" to="/">
            Найти отели
          </Link>
        </section>
      ) : (
        <div className="favorite-grid">
          {favorites.map((favorite) => (
            <article
              className="favorite-card clickable-card"
              key={favorite.hotelId}
              role="link"
              tabIndex={0}
              onClick={() => openHotel(favorite)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openHotel(favorite);
                }
              }}
            >
              <div className="favorite-media">
                <ImageWithFallback
                  alt={favorite.name}
                  className="favorite-image"
                  src={favorite.imageUrl}
                />
                <FavoriteButton
                  className="favorite-card-button"
                  hotelId={favorite.hotelId}
                  initialIsFavorite
                  stopPropagation
                />
              </div>
              <div className="stack-sm">
                <h3>{favorite.name}</h3>
                <p className="muted">
                  {favorite.city} - {favorite.address}
                </p>
                <div className="pill-row">
                  <span className="pill">
                    {favorite.reviewCount > 0
                      ? `${favorite.averageRating.toFixed(1)} оценка по отзывам`
                      : "Пока нет отзывов"}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
