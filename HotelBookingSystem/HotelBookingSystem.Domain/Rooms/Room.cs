using System;
using System.Collections.Generic;
using System.Linq;

namespace HotelBookingSystem.Domain.Rooms
{
    public class Room
    {
        public Guid Id { get; private set; }
        public string Number { get; private set; } = null!;

        public int RoomTypeId { get; private set; }
        public RoomType? Type { get; private set; }

        public decimal Price { get; private set; }

        private readonly List<RoomBedConfiguration> _roomBeds = new();
        public IReadOnlyCollection<RoomBedConfiguration> RoomBeds => _roomBeds.AsReadOnly();

        private Room() { }

        public Room(string number, int roomTypeId, decimal price)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(number);
            ArgumentOutOfRangeException.ThrowIfNegativeOrZero(roomTypeId);
            ArgumentOutOfRangeException.ThrowIfNegative(price);

            Id = Guid.NewGuid();
            Number = number;
            RoomTypeId = roomTypeId;
            Price = price;
        }

        public void AddBed(int bedTypeId, int quantity)
        {
            ArgumentOutOfRangeException.ThrowIfNegativeOrZero(bedTypeId);
            ArgumentOutOfRangeException.ThrowIfNegativeOrZero(quantity);

            var existing = _roomBeds.FirstOrDefault(x => x.BedTypeId == bedTypeId);

            if (existing != null)
            {
                existing.IncreaseQuantity(quantity);
                return;
            }

            _roomBeds.Add(new RoomBedConfiguration(this, bedTypeId, quantity));
        }

        public void RemoveBed(int bedTypeId)
        {
            ArgumentOutOfRangeException.ThrowIfNegativeOrZero(bedTypeId);

            var existing = _roomBeds.FirstOrDefault(x => x.BedTypeId == bedTypeId);

            if (existing != null)
                _roomBeds.Remove(existing);
        }

        public void UpdateBedQuantity(int bedTypeId, int newQuantity)
        {
            ArgumentOutOfRangeException.ThrowIfNegativeOrZero(bedTypeId);

            var existing = _roomBeds.FirstOrDefault(x => x.BedTypeId == bedTypeId);

            if (existing == null)
                throw new InvalidOperationException("Bed configuration not found.");

            if (newQuantity <= 0)
            {
                _roomBeds.Remove(existing);
                return;
            }

            existing.SetQuantity(newQuantity);
        }

        public void ChangePrice(decimal newPrice)
        {
            ArgumentOutOfRangeException.ThrowIfNegative(newPrice);

            Price = newPrice;
        }
    }
}
