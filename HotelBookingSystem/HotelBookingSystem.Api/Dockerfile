FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY HotelBookingSystem.Api/HotelBookingSystem.Api.csproj HotelBookingSystem.Api/
RUN dotnet restore HotelBookingSystem.Api/HotelBookingSystem.Api.csproj

COPY HotelBookingSystem.Api/ HotelBookingSystem.Api/
RUN dotnet publish HotelBookingSystem.Api/HotelBookingSystem.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "HotelBookingSystem.Api.dll"]
