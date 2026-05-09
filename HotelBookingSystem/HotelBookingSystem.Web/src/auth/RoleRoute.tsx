import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Role } from "../types";
import { useAuth } from "./AuthContext";

export function RoleRoute({ allowed }: { allowed: Role[] }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const returnTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  if (!allowed.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
