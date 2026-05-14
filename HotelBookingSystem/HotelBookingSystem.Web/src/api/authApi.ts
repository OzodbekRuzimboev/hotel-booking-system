import { api } from "./client";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../types";

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login", request);
  return response.data;
}

export async function register(request: RegisterRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/register", request);
  return response.data;
}

export async function refresh(refreshToken: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/refresh", {
    refreshToken,
  });
  return response.data;
}

export async function logout(refreshToken: string): Promise<void> {
  await api.post("/auth/logout", { refreshToken });
}
