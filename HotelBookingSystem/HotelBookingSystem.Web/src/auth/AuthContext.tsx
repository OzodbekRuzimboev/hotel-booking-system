import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthResponse, Role } from "../types";
import { logout as logoutRequest } from "../api/authApi";

type AuthUser = {
  userId: number;
  name: string;
  email: string;
  role: Role;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  loginUser: (auth: AuthResponse) => void;
  updateUser: (user: Partial<AuthUser>) => void;
  logoutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem("user");

  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser());
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );

  function loginUser(auth: AuthResponse) {
    const nextUser: AuthUser = {
      userId: auth.userId,
      name: auth.name,
      email: auth.email,
      role: auth.role,
    };

    localStorage.setItem("accessToken", auth.accessToken);
    localStorage.setItem("refreshToken", auth.refreshToken);
    localStorage.setItem("user", JSON.stringify(nextUser));

    setUser(nextUser);
    setAccessToken(auth.accessToken);
  }

  function updateUser(userPatch: Partial<AuthUser>) {
    setUser((current) => {
      if (!current) return current;

      const nextUser = { ...current, ...userPatch };
      localStorage.setItem("user", JSON.stringify(nextUser));
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

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

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
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
