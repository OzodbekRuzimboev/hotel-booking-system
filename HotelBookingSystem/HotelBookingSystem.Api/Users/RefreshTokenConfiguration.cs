using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HotelBookingSystem.Api.Users
{
    public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            builder.HasIndex(rt => rt.TokenHash).IsUnique();

            builder.Property(rt => rt.TokenHash).IsRequired().HasMaxLength(256);

            builder.Property(rt => rt.ReplacedByTokenHash).HasMaxLength(256);

            builder.HasOne(rt => rt.User).WithMany().HasForeignKey(rt => rt.UserId).OnDelete(DeleteBehavior.Cascade);
        }
    }
}
