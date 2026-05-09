import {
  assignHotelOwner,
  createHotel,
  createRoom,
  createRoomType,
  deactivateHotel,
  deactivateRoom,
  deactivateRoomType,
  getAdminHotels,
  updateHotel,
  updateRoom,
  updateRoomType,
} from "../../api/adminApi";
import { HotelManagement } from "../../components/HotelManagement";

export function AdminHotelsPage() {
  return (
    <HotelManagement
      title="Admin hotels"
      loadHotels={getAdminHotels}
      createHotel={createHotel}
      updateHotel={updateHotel}
      deactivateHotel={deactivateHotel}
      assignHotelOwner={assignHotelOwner}
      createRoomType={createRoomType}
      updateRoomType={updateRoomType}
      deactivateRoomType={deactivateRoomType}
      createRoom={createRoom}
      updateRoom={updateRoom}
      deactivateRoom={deactivateRoom}
    />
  );
}
