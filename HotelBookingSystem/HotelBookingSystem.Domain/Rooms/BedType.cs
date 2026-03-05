namespace HotelBookingSystem.Domain.Rooms
{
    public class BedType
    {
        public int Id { get; private set; }
        public string Name { get; private set; } = null!;
        public string? Description { get; private set; }

        private BedType() { }

        public BedType(string name, string? description = null)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Bed type name cannot be empty.", nameof(name));

            Name = name;
            Description = description;
        }
    }
}
