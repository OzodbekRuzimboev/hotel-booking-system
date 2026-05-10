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
  stopPropagation?: boolean;
};

export function FavoriteButton({
  hotelId,
  className,
  stopPropagation = false,
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === Role.Admin;
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadFavoriteStatus() {
      if (!user || isAdmin || !hotelId) {
        setIsFavorite(false);
        return;
      }

      try {
        const result = await getFavoriteStatus(hotelId);
        setIsFavorite(result.isFavorite);
      } catch {
        setIsFavorite(false);
      }
    }

    loadFavoriteStatus();
  }, [hotelId, isAdmin, user]);

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

  if (isAdmin) {
    return null;
  }

  return (
    <button
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      className={`favorite-button ${isFavorite ? "selected" : ""} ${className ?? ""}`}
      disabled={loading}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      type="button"
      onClick={handleClick}
    >
      <span aria-hidden="true">{isFavorite ? "♥" : "♡"}</span>
    </button>
  );
}
