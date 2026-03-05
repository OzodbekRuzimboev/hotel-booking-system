namespace HotelBookingSystem.Domain.Rooms
{
    public class RoomBedConfiguration
    {
        public Guid RoomId { get; private set; }
        public Room Room { get; private set; } = null!;

        public int BedTypeId { get; private set; }
        public BedType? BedType { get; private set; }

        public int Quantity { get; private set; }

        private RoomBedConfiguration() { }

        public RoomBedConfiguration(Room room, int bedTypeId, int quantity)
        {
            ArgumentNullException.ThrowIfNull(room);
            ArgumentOutOfRangeException.ThrowIfNegativeOrZero(bedTypeId);
            ArgumentOutOfRangeException.ThrowIfNegativeOrZero(quantity);

            Room = room;
            RoomId = room.Id;
            BedTypeId = bedTypeId;
            Quantity = quantity;
        }

        internal void IncreaseQuantity(int amount)
        {
            ArgumentOutOfRangeException.ThrowIfNegativeOrZero(amount);
            Quantity += amount;
        }

        internal void SetQuantity(int quantity)
        {
            ArgumentOutOfRangeException.ThrowIfNegativeOrZero(quantity);
            Quantity = quantity;
        }
    }
}
