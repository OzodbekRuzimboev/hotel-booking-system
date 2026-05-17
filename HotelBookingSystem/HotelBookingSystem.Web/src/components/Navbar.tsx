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

      <nav className="nav-links" aria-label="Основная навигация" />

      <div className="auth-actions">
        {user ? (
          <>
            {user.role === Role.Owner && (
              <Link className="button secondary property-link" to="/owner/hotels">
                Разместить объект
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
                        Отели администратора
                      </Link>
                      <Link to="/admin/bookings" onClick={() => setMenuOpen(false)}>
                        Бронирования
                      </Link>
                      <Link
                        to="/admin/popular-destinations"
                        onClick={() => setMenuOpen(false)}
                      >
                        Популярные направления
                      </Link>
                      <Link to="/admin/users" onClick={() => setMenuOpen(false)}>
                        Пользователи
                      </Link>
                    </>
                  ) : (
                    <>
                      {user.role === Role.Owner && (
                        <>
                          <Link to="/owner/hotels" onClick={() => setMenuOpen(false)}>
                            Мои отели
                          </Link>
                          <Link to="/owner/bookings" onClick={() => setMenuOpen(false)}>
                            Бронирования отелей
                          </Link>
                        </>
                      )}
                      <Link to="/account" onClick={() => setMenuOpen(false)}>
                        Личный кабинет
                      </Link>
                      {user.role === Role.User && (
                        <>
                          <Link to="/favorites" onClick={() => setMenuOpen(false)}>
                            Избранное
                          </Link>
                          <Link to="/my-bookings" onClick={() => setMenuOpen(false)}>
                            Мои бронирования
                          </Link>
                        </>
                      )}
                    </>
                  )}
                  <button type="button" onClick={handleLogout}>
                    Выйти
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link className="button secondary property-link" to="/list-your-property">
              Разместить объект
            </Link>
            <Link className="button" to="/register">
              Регистрация
            </Link>
            <Link className="button secondary" to="/login">
              Войти
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
