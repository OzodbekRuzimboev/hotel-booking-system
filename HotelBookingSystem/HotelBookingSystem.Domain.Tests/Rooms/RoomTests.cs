using FluentAssertions;
using HotelBookingSystem.Domain.Rooms;

namespace HotelBookingSystem.Domain.Tests.Rooms;
public class RoomTests
{    
    [Fact]
    public void Ctor_ShouldInitializeRoom()
    {
        var room = new Room("101", roomTypeId: 1, price: 120m);

        room.Id.Should().NotBe(Guid.Empty);
        room.Number.Should().Be("101");
        room.RoomTypeId.Should().Be(1);
        room.Price.Should().Be(120m);
        room.RoomBeds.Should().BeEmpty();
    }


    [Fact]
    public void AddBed_ShouldAddConfiguration_WhenBedTypeDoesNotExist()
    {
        var room = new Room("101", roomTypeId: 1, 100m);

        room.AddBed(bedTypeId: 1, quantity: 2);

        room.RoomBeds.Should().HaveCount(1);

        var cfg = room.RoomBeds.Single();
        cfg.BedTypeId.Should().Be(1);
        cfg.Quantity.Should().Be(2);
        cfg.RoomId.Should().Be(room.Id);
    }

    [Fact]
    public void AddBed_ShouldIncreaseQuantity_WhenSameBedTypeAddedAgain()
    {
        var room = new Room("101", roomTypeId: 1, price: 100m);

        room.AddBed(bedTypeId: 1, quantity: 2);
        room.AddBed(bedTypeId: 1, quantity: 3);

        room.RoomBeds.Should().HaveCount(1);
        room.RoomBeds.Single().Quantity.Should().Be(5);
    }


    [Fact]
    public void RemoveBed_ShouldRemoveConfiguration_WhenExists()
    {
        var room = new Room("101", roomTypeId: 1, price: 100m);

        room.AddBed(bedTypeId: 1, quantity: 1);
        room.AddBed(bedTypeId: 2, quantity: 1);

        room.RemoveBed(1);

        room.RoomBeds.Should().HaveCount(1);
        room.RoomBeds.Single().BedTypeId.Should().Be(2);
    }


    [Fact]
    public void UpdateBedQuantity_ShouldSetNewQuantity_WhenPositive()
    {
        var room = new Room("101", roomTypeId: 1, price: 100m);

        room.AddBed(bedTypeId: 1, quantity: 2);

        room.UpdateBedQuantity(1, 5);

        room.RoomBeds.Single().Quantity.Should().Be(5);
    }


    [Fact]
    public void UpdateBedQuantity_ShouldRemoveConfiguration_WhenNewQuantityIsZeroOrLess()
    {
        var room = new Room("101", roomTypeId: 1, price: 100m);

        room.AddBed(bedTypeId: 1, quantity: 2);

        room.UpdateBedQuantity(1, 0);

        room.RoomBeds.Should().BeEmpty();
    }


    [Fact]
    public void UpdateBedQuantity_ShouldThrowInvalidOperationException_WhenConfigurationNotFound()
    {
        var room = new Room("101", roomTypeId: 1, price: 100m);

        Action act = () => room.UpdateBedQuantity(123, 3);

        act.Should().Throw<InvalidOperationException>().WithMessage("Bed configuration not found.");
    }


    [Fact]
    public void ChangePrice_ShouldSetNewPrice_WhenNonNegative()
    {
        var room = new Room("101", roomTypeId: 1, price: 100m);

        room.ChangePrice(250m);

        room.Price.Should().Be(250m);
    }
}