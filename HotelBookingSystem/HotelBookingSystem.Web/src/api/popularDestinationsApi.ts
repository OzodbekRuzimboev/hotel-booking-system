import { api } from "./client";
import type { PopularDestinationResponse } from "../types";

export async function getPopularDestinations(): Promise<PopularDestinationResponse[]> {
  const response = await api.get<PopularDestinationResponse[]>("/popular-destinations");
  return response.data;
}
