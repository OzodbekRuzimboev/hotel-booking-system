FROM node:24-alpine AS build
WORKDIR /app

COPY HotelBookingSystem.Web/package*.json ./
RUN npm ci

COPY HotelBookingSystem.Web/ ./
RUN npm run build

FROM nginx:alpine AS final
COPY HotelBookingSystem.Web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
