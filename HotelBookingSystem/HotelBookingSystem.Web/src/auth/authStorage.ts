import type { AuthResponse, Role } from "../types";

export type AuthUser = {
  userId: number;
  name: string;
  email: string;
  role: Role;
  profileImageUrl?: string | null;
};

const authChangedEvent = "hotel-booking-auth-changed";

function notifyAuthChanged() {
  window.dispatchEvent(new Event(authChangedEvent));
}

function authUserFromResponse(auth: AuthResponse): AuthUser {
  return {
    userId: auth.userId,
    name: auth.name,
    email: auth.email,
    role: auth.role,
    profileImageUrl: auth.profileImageUrl ?? null,
  };
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem("user");

  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getStoredAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem("refreshToken");
}

export function storeAuth(auth: AuthResponse): AuthUser {
  const nextUser = authUserFromResponse(auth);

  localStorage.setItem("accessToken", auth.accessToken);
  localStorage.setItem("refreshToken", auth.refreshToken);
  localStorage.setItem("user", JSON.stringify(nextUser));

  notifyAuthChanged();

  return nextUser;
}

export function updateStoredUser(user: AuthUser) {
  localStorage.setItem("user", JSON.stringify(user));
  notifyAuthChanged();
}

export function clearAuthStorage() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  notifyAuthChanged();
}

export function isAccessTokenExpired(token: string | null, skewSeconds = 30) {
  if (!token) return true;

  const [, payload] = token.split(".");
  if (!payload) return true;

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      "="
    );
    const parsed = JSON.parse(atob(paddedPayload)) as { exp?: number };

    if (!parsed.exp) return true;

    return parsed.exp * 1000 <= Date.now() + skewSeconds * 1000;
  } catch {
    return true;
  }
}

export function subscribeToAuthStorage(callback: () => void) {
  window.addEventListener(authChangedEvent, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(authChangedEvent, callback);
    window.removeEventListener("storage", callback);
  };
}
