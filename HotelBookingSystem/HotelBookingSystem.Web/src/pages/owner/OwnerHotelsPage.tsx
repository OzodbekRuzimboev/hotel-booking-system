import {
  createOwnerHotel,
  createOwnerRoom,
  createOwnerRoomType,
  deactivateOwnerRoom,
  deactivateOwnerRoomType,
  getOwnerHotels,
  updateOwnerHotel,
  updateOwnerRoom,
  updateOwnerRoomType,
} from "../../api/ownerApi";
import { HotelManagement } from "../../components/HotelManagement";

export function OwnerHotelsPage() {
  return (
    <HotelManagement
      title="Мои отели"
      loadHotels={getOwnerHotels}
      updateHotel={updateOwnerHotel}
      createHotel={createOwnerHotel}
      createRoomType={createOwnerRoomType}
      updateRoomType={updateOwnerRoomType}
      deactivateRoomType={deactivateOwnerRoomType}
      createRoom={createOwnerRoom}
      updateRoom={updateOwnerRoom}
      deactivateRoom={deactivateOwnerRoom}
      hotelDetailsPath={(hotel) => `/owner/hotels/${hotel.id}`}
    />
  );
}
