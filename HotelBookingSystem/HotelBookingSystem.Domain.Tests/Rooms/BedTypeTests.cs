using FluentAssertions;
using HotelBookingSystem.Domain.Rooms;

namespace HotelBookingSystem.Domain.Tests.Rooms
{
    public class BedTypeTests
    {
        [Fact]
        public void Ctor_ShouldCreateBedType()
        {
            var bedType = new BedType("King", "Nice bed");

            bedType.Name.Should().Be("King");
            bedType.Description.Should().Be("Nice bed");
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        public void Ctor_ShouldThrowArgumentException_WhenNameIsNullOrWhiteSpace(string name)
        {
            Action act = () => new BedType(name);

            act.Should().Throw<ArgumentException>();
        }
    }
}
