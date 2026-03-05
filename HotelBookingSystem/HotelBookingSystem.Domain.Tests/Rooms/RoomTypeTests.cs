using FluentAssertions;
using HotelBookingSystem.Domain.Rooms;

namespace HotelBookingSystem.Domain.Tests.Rooms
{
    public class RoomTypeTests
    {
        [Fact]
        public void Ctor_ShouldCreateRoomType()
        {
            var roomType = new RoomType("Deluxe", "Nice view");

            roomType.Name.Should().Be("Deluxe");
            roomType.Description.Should().Be("Nice view");
        }


        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        public void Ctor_ShouldThrowArgumentException_WhenNameIsNullOrWhiteSpace(string name)
        {
            Action act = () => new RoomType(name);

            act.Should().Throw<ArgumentException>();
        }
    }
}
