import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Role } from "../types";
import { useAuth } from "../auth/AuthContext";

export function Navbar() {
  const { user, logoutUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    setMenuOpen(false);
    logoutUser();
  }

  return (
    <header className="site-header">
      <Link className="brand" to="/">
        StayFinder
      </Link>

      <nav className="nav-links" aria-label="Main navigation">
        {user?.role === Role.Owner && (
          <NavLink to="/owner/hotels">Owner hotels</NavLink>
        )}
        {user?.role === Role.Owner && (
          <NavLink to="/owner/bookings">Owner bookings</NavLink>
        )}
      </nav>

      <div className="auth-actions">
        {user ? (
          <>
            {user.role === Role.Owner && (
              <Link className="button secondary" to="/owner/hotels">
                List your property
              </Link>
            )}
            <div className="user-menu-wrap">
              <button
                aria-expanded={menuOpen}
                className="user-menu-button"
                onClick={() => setMenuOpen((open) => !open)}
                type="button"
              >
                <span className="user-name">{user.name}</span>
              </button>
              {menuOpen && (
                <div className="user-menu">
                  {user.role === Role.Admin ? (
                    <>
                      <Link to="/admin/hotels" onClick={() => setMenuOpen(false)}>
                        Admin hotels
                      </Link>
                      <Link to="/admin/bookings" onClick={() => setMenuOpen(false)}>
                        Admin bookings
                      </Link>
                      <Link to="/admin/users" onClick={() => setMenuOpen(false)}>
                        Users
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/account" onClick={() => setMenuOpen(false)}>
                        Personal account
                      </Link>
                      <Link to="/favorites" onClick={() => setMenuOpen(false)}>
                        Favorites
                      </Link>
                      <Link to="/my-bookings" onClick={() => setMenuOpen(false)}>
                        My reservations
                      </Link>
                    </>
                  )}
                  <button type="button" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
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
