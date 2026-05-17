import { useEffect, useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  addFavorite,
  getFavoriteStatus,
  removeFavorite,
} from "../api/accountApi";
import { useAuth } from "../auth/AuthContext";
import { Role } from "../types";

type FavoriteButtonProps = {
  hotelId: number;
  className?: string;
  initialIsFavorite?: boolean;
  stopPropagation?: boolean;
};

export function FavoriteButton({
  hotelId,
  className,
  initialIsFavorite = false,
  stopPropagation = false,
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canUseFavorites = !user || user.role === Role.User;
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [hotelId, initialIsFavorite]);

  useEffect(() => {
    let ignore = false;

    async function loadFavoriteStatus() {
      if (!user || user.role !== Role.User || !hotelId) {
        setIsFavorite(false);
        return;
      }

      try {
        const result = await getFavoriteStatus(hotelId);
        if (!ignore) {
          setIsFavorite(result.isFavorite);
        }
      } catch {
        if (!ignore) {
          setIsFavorite(false);
        }
      }
    }

    loadFavoriteStatus();

    return () => {
      ignore = true;
    };
  }, [hotelId, user]);

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (stopPropagation) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!user) {
      const returnTo = window.location.pathname + window.location.search;
      navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    setLoading(true);

    try {
      if (isFavorite) {
        await removeFavorite(hotelId);
        setIsFavorite(false);
      } else {
        await addFavorite(hotelId);
        setIsFavorite(true);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!canUseFavorites) {
    return null;
  }

  return (
    <button
      aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
      className={`favorite-button ${isFavorite ? "selected" : ""} ${className ?? ""}`}
      disabled={loading}
      title={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
      type="button"
      onClick={handleClick}
    >
      <span aria-hidden="true">{isFavorite ? "\u2665" : "\u2661"}</span>
    </button>
  );
}
