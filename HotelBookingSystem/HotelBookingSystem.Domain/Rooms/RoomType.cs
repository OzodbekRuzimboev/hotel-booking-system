namespace HotelBookingSystem.Domain.Rooms
{
    public class RoomType
    {
        public int Id { get; private set; }
        public string Name { get; private set; } = null!;
        public string? Description { get; private set; }

        private RoomType() { }

        public RoomType(string name, string? description = null)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Room type name cannot be empty.", nameof(name));

            Name = name;
            Description = description;
        }
    }
}
