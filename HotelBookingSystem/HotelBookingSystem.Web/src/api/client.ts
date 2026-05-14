import axios, { AxiosError } from "axios";
import type { ProblemDetails } from "../types";

const apiBaseURL = import.meta.env.VITE_API_BASE_URL?.trim() || "/api";

export const api = axios.create({
  baseURL: apiBaseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ProblemDetails>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }

    return Promise.reject(error);
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
