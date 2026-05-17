import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  createOwnerRoom,
  createOwnerRoomType,
  deactivateOwnerRoom,
  deactivateOwnerRoomType,
  getOwnerHotel,
  updateOwnerHotel,
  updateOwnerRoom,
  updateOwnerRoomType,
} from "../../api/ownerApi";
import { getApiErrorMessage } from "../../api/client";
import { ManagedHotelCard, type ActionFeedbackOptions } from "../../components/HotelManagement";
import type { ManagedHotelResponse } from "../../types";

export function OwnerHotelDetailsPage() {
  const { hotelId } = useParams();
  const numericHotelId = Number(hotelId);
  const [hotel, setHotel] = useState<ManagedHotelResponse | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const loadHotel = useCallback(async () => {
    if (!numericHotelId) return;

    setError("");
    setLoading(true);

    try {
      setHotel(await getOwnerHotel(numericHotelId));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [numericHotelId]);

  useEffect(() => {
    loadHotel();
  }, [loadHotel]);

  async function runAction(
    action: () => Promise<unknown>,
    message: string,
    feedback?: ActionFeedbackOptions
  ) {
    setError("");
    setSuccess("");

    try {
      await action();
      setHotel(await getOwnerHotel(numericHotelId));
      if (feedback?.onSuccess) {
        feedback.onSuccess(message);
      } else {
        setSuccess(message);
      }
      return true;
    } catch (err) {
      const errorMessage = getApiErrorMessage(err);
      if (feedback?.onError) {
        feedback.onError(errorMessage);
      } else {
        setError(errorMessage);
      }
      return false;
    }
  }

  return (
    <main className="page stack-lg">
      <div className="page-header">
        <div>
          <p className="eyebrow">Управление</p>
          <h1>{hotel ? hotel.name : "Детали отеля"}</h1>
        </div>
        <div className="row gap wrap">
          <Link className="button secondary" to="/owner/hotels">
            Назад к моим отелям
          </Link>
        </div>
      </div>

      {loading && <p className="muted">Загрузка отеля...</p>}
      {error && <p className="alert error">{error}</p>}
      {success && <p className="alert success">{success}</p>}

      {hotel && (
        <ManagedHotelCard
          key={`${hotel.id}-${hotel.roomTypes.length}-${hotel.imageUrls.join("|")}`}
          hotel={hotel}
          updateHotel={updateOwnerHotel}
          createRoomType={createOwnerRoomType}
          updateRoomType={updateOwnerRoomType}
          deactivateRoomType={deactivateOwnerRoomType}
          createRoom={createOwnerRoom}
          updateRoom={updateOwnerRoom}
          deactivateRoom={deactivateOwnerRoom}
          runAction={runAction}
        />
      )}
    </main>
  );
}
