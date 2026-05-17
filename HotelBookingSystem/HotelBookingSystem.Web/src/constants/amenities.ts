export type AmenityOption = {
  value: string;
  label: string;
};

export const HOTEL_AMENITIES: AmenityOption[] = [
  { value: "restaurant", label: "Ресторан" },
  { value: "fitness-center", label: "Фитнес-центр" },
  { value: "free-wifi", label: "Бесплатный Wi-Fi" },
  { value: "free-parking", label: "Бесплатная парковка" },
  { value: "bar", label: "Бар" },
  { value: "airport-transfer", label: "Трансфер из аэропорта" },
  { value: "front-desk-24h", label: "Стойка регистрации 24/7" },
  { value: "pet-friendly", label: "Можно с питомцами" },
  { value: "spa", label: "Спа" },
  { value: "pool", label: "Бассейн" },
];

export const ROOM_AMENITIES: AmenityOption[] = [
  { value: "air-conditioning", label: "Кондиционер" },
  { value: "balcony", label: "Балкон" },
  { value: "soundproofing", label: "Звукоизоляция" },
  { value: "view", label: "Вид из окна" },
  { value: "kitchen", label: "Кухня / мини-кухня" },
  { value: "washing-machine", label: "Стиральная машина" },
  { value: "tv", label: "Телевизор" },
  { value: "coffee-maker", label: "Кофемашина" },
  { value: "bathtub", label: "Ванна" },
  { value: "minibar", label: "Мини-бар" },
];

export const MEAL_OPTIONS: AmenityOption[] = [
  { value: "breakfast-included", label: "Завтрак включен" },
  { value: "all-inclusive", label: "Все включено" },
  { value: "self-catering", label: "Самостоятельное питание" },
];

export function getAmenityLabel(value: string, options: AmenityOption[]) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function getAmenityLabels(values: string[] | undefined, options: AmenityOption[]) {
  return (values ?? []).map((value) => getAmenityLabel(value, options));
}
