export type AmenityOption = {
  value: string;
  label: string;
};

export const HOTEL_AMENITIES: AmenityOption[] = [
  { value: "restaurant", label: "Restaurant" },
  { value: "fitness-center", label: "Fitness center" },
  { value: "free-wifi", label: "Free Wi-Fi" },
  { value: "free-parking", label: "Free parking" },
  { value: "bar", label: "Bar" },
  { value: "airport-transfer", label: "Airport transfer" },
  { value: "front-desk-24h", label: "24-hour front desk" },
  { value: "pet-friendly", label: "Pet-friendly" },
  { value: "spa", label: "Spa" },
  { value: "pool", label: "Pool" },
];

export const ROOM_AMENITIES: AmenityOption[] = [
  { value: "air-conditioning", label: "Air conditioning" },
  { value: "balcony", label: "Balcony" },
  { value: "soundproofing", label: "Soundproofing" },
  { value: "view", label: "View" },
  { value: "kitchen", label: "Kitchen / kitchenette" },
  { value: "washing-machine", label: "Washing machine" },
  { value: "tv", label: "TV" },
  { value: "coffee-maker", label: "Coffee maker" },
  { value: "bathtub", label: "Bathtub" },
  { value: "minibar", label: "Minibar" },
];

export const MEAL_OPTIONS: AmenityOption[] = [
  { value: "breakfast-included", label: "Breakfast included" },
  { value: "all-inclusive", label: "All-inclusive" },
  { value: "self-catering", label: "Self-catering" },
];

export function getAmenityLabel(value: string, options: AmenityOption[]) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function getAmenityLabels(values: string[] | undefined, options: AmenityOption[]) {
  return (values ?? []).map((value) => getAmenityLabel(value, options));
}
