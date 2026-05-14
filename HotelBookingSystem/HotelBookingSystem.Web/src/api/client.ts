import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { AuthResponse, ProblemDetails } from "../types";
import {
  clearAuthStorage,
  getStoredAccessToken,
  getStoredRefreshToken,
  storeAuth,
} from "../auth/authStorage";

const apiBaseURL = import.meta.env.VITE_API_BASE_URL?.trim() || "/api";

export const api = axios.create({
  baseURL: apiBaseURL,
});

const authApi = axios.create({
  baseURL: apiBaseURL,
});

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let refreshPromise: Promise<AuthResponse> | null = null;

function isAuthRoute(url: string | undefined) {
  return url?.includes("/auth/") ?? false;
}

export async function refreshAuthSession() {
  if (!refreshPromise) {
    const refreshToken = getStoredRefreshToken();

    if (!refreshToken) {
      clearAuthStorage();
      throw new Error("No refresh token is available.");
    }

    refreshPromise = authApi
      .post<AuthResponse>("/auth/refresh", { refreshToken })
      .then((response) => {
        storeAuth(response.data);
        return response.data;
      })
      .catch((error) => {
        clearAuthStorage();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const token = getStoredAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ProblemDetails>) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const shouldRefresh =
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute(originalRequest.url) &&
      getStoredRefreshToken();

    if (!shouldRefresh) {
      if (error.response?.status === 401) {
        clearAuthStorage();
      }

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const auth = await refreshAuthSession();
      originalRequest.headers.Authorization = `Bearer ${auth.accessToken}`;
      return api(originalRequest);
    } catch {
      return Promise.reject(error);
    }
  }
);

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ProblemDetails>(error)) {
    const validationErrors = error.response?.data?.errors;
    const messages = validationErrors
      ? Object.entries(validationErrors).flatMap(([field, values]) =>
          values.map((message) => (field ? `${field}: ${message}` : message))
        )
      : [];

    if (messages.length > 0) {
      return messages.slice(0, 4).join(" ");
    }

    return (
      error.response?.data?.detail ||
      error.response?.data?.title ||
      error.message ||
      "Request failed."
    );
  }

  return "Unexpected error.";
}
