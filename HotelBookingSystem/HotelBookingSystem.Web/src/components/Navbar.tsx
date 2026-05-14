import { useState } from "react";
import { Link } from "react-router-dom";
import { Role } from "../types";
import { useAuth } from "../auth/AuthContext";
import { ImageWithFallback } from "./ImageWithFallback";

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

      <nav className="nav-links" aria-label="Main navigation" />

      <div className="auth-actions">
        {user ? (
          <>
            {user.role === Role.Owner && (
              <Link className="button secondary property-link" to="/owner/hotels">
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
                <ImageWithFallback
                  alt={user.name}
                  className="avatar nav-avatar"
                  src={user.profileImageUrl}
                />
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
                      <Link
                        to="/admin/popular-destinations"
                        onClick={() => setMenuOpen(false)}
                      >
                        Popular destinations
                      </Link>
                      <Link to="/admin/users" onClick={() => setMenuOpen(false)}>
                        Users
                      </Link>
                    </>
                  ) : (
                    <>
                      {user.role === Role.Owner && (
                        <>
                          <Link to="/owner/hotels" onClick={() => setMenuOpen(false)}>
                            Owner hotels
                          </Link>
                          <Link to="/owner/bookings" onClick={() => setMenuOpen(false)}>
                            Owner bookings
                          </Link>
                        </>
                      )}
                      <Link to="/account" onClick={() => setMenuOpen(false)}>
                        Personal account
                      </Link>
                      {user.role === Role.User && (
                        <>
                          <Link to="/favorites" onClick={() => setMenuOpen(false)}>
                            Favorites
                          </Link>
                          <Link to="/my-bookings" onClick={() => setMenuOpen(false)}>
                            My reservations
                          </Link>
                        </>
                      )}
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
            <Link className="button secondary property-link" to="/list-your-property">
              List your property
            </Link>
            <Link className="button" to="/register">
              Register
            </Link>
            <Link className="button secondary" to="/login">
              Sign in
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
