import { Link, NavLink } from "react-router-dom";
import { Role } from "../types";
import { useAuth } from "../auth/AuthContext";

export function Navbar() {
  const { user, logoutUser } = useAuth();

  return (
    <header className="site-header">
      <Link className="brand" to="/">
        StayFinder
      </Link>

      <nav className="nav-links" aria-label="Main navigation">
        <NavLink to="/">Search</NavLink>
        {user && <NavLink to="/account">My account</NavLink>}
        {user?.role === Role.Owner && (
          <NavLink to="/owner/hotels">Owner hotels</NavLink>
        )}
        {user?.role === Role.Owner && (
          <NavLink to="/owner/bookings">Owner bookings</NavLink>
        )}
        {user?.role === Role.Admin && (
          <NavLink to="/admin/hotels">Admin hotels</NavLink>
        )}
        {user?.role === Role.Admin && (
          <NavLink to="/admin/bookings">Admin bookings</NavLink>
        )}
        {user?.role === Role.Admin && <NavLink to="/admin/users">Users</NavLink>}
      </nav>

      <div className="auth-actions">
        {user ? (
          <>
            {user.role === Role.Owner && (
              <Link className="button secondary" to="/owner/hotels">
                List your property
              </Link>
            )}
            <span className="muted small user-name">{user.name}</span>
            <button className="button secondary" onClick={logoutUser} type="button">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="button secondary" to="/list-your-property">
              List your property
            </Link>
            <Link className="button secondary" to="/login">
              Login
            </Link>
            <Link className="button" to="/register">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
