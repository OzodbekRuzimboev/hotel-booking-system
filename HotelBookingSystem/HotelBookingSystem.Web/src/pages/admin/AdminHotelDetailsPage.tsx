import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  assignHotelOwner,
  createRoom,
  createRoomType,
  deactivateHotel,
  deactivateRoom,
  deactivateRoomType,
  getAdminHotel,
  updateHotel,
  updateRoom,
  updateRoomType,
} from "../../api/adminApi";
import { getApiErrorMessage } from "../../api/client";
import { ManagedHotelCard } from "../../components/HotelManagement";
import type { ManagedHotelResponse } from "../../types";

export function AdminHotelDetailsPage() {
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
      setHotel(await getAdminHotel(numericHotelId));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [numericHotelId]);

  useEffect(() => {
    loadHotel();
  }, [loadHotel]);

  async function runAction(action: () => Promise<unknown>, message: string) {
    setError("");
    setSuccess("");

    try {
      await action();
      setHotel(await getAdminHotel(numericHotelId));
      setSuccess(message);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <main className="page stack-lg">
      <div className="page-header">
        <div>
          <p className="eyebrow">Management</p>
          <h1>{hotel ? hotel.name : "Hotel details"}</h1>
        </div>
        <div className="row gap wrap">
          <Link className="button secondary" to="/admin/hotels">
            Back to admin hotels
          </Link>
        </div>
      </div>

      {loading && <p className="muted">Loading hotel...</p>}
      {error && <p className="alert error">{error}</p>}
      {success && <p className="alert success">{success}</p>}

      {hotel && (
        <ManagedHotelCard
          key={`${hotel.id}-${hotel.roomTypes.length}-${hotel.imageUrls.join("|")}`}
          hotel={hotel}
          updateHotel={updateHotel}
          createRoomType={createRoomType}
          updateRoomType={updateRoomType}
          deactivateRoomType={deactivateRoomType}
          createRoom={createRoom}
          updateRoom={updateRoom}
          deactivateRoom={deactivateRoom}
          deactivateHotel={deactivateHotel}
          assignHotelOwner={assignHotelOwner}
          runAction={runAction}
        />
      )}
    </main>
  );
}
