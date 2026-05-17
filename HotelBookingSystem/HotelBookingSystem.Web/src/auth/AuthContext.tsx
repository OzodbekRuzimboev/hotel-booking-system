import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthResponse } from "../types";
import { refreshAuthSession } from "../api/client";
import { logout as logoutRequest } from "../api/authApi";
import {
  clearAuthStorage,
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredUser,
  isAccessTokenExpired,
  storeAuth,
  subscribeToAuthStorage,
  updateStoredUser,
  type AuthUser,
} from "./authStorage";

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  loginUser: (auth: AuthResponse) => void;
  updateUser: (user: Partial<AuthUser>) => void;
  logoutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser());
  const [accessToken, setAccessToken] = useState<string | null>(getStoredAccessToken());

  useEffect(() => {
    const syncFromStorage = () => {
      setUser(getStoredUser());
      setAccessToken(getStoredAccessToken());
    };

    const unsubscribe = subscribeToAuthStorage(syncFromStorage);

    async function restoreSession() {
      const storedUser = getStoredUser();
      const storedAccessToken = getStoredAccessToken();
      const storedRefreshToken = getStoredRefreshToken();

      if (!storedUser) {
        if (storedAccessToken || storedRefreshToken) {
          clearAuthStorage();
        }

        return;
      }

      if (!storedRefreshToken) {
        clearAuthStorage();
        return;
      }

      if (!isAccessTokenExpired(storedAccessToken)) {
        return;
      }

      try {
        await refreshAuthSession();
      } catch {
        clearAuthStorage();
      }
    }

    void restoreSession();

    return unsubscribe;
  }, []);

  function loginUser(auth: AuthResponse) {
    const nextUser = storeAuth(auth);

    setUser(nextUser);
    setAccessToken(auth.accessToken);
  }

  function updateUser(userPatch: Partial<AuthUser>) {
    setUser((current) => {
      if (!current) return current;

      const nextUser = { ...current, ...userPatch };
      updateStoredUser(nextUser);
      return nextUser;
    });
  }

  async function logoutUser() {
    const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken) {
      try {
        await logoutRequest(refreshToken);
      } catch {
        // Still clear local state even if server logout fails.
      }
    }

    clearAuthStorage();

    setUser(null);
    setAccessToken(null);
  }

  const value = useMemo(
    () => ({ user, accessToken, loginUser, updateUser, logoutUser }),
    [user, accessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth должен использоваться внутри AuthProvider.");
  }

  return context;
}
