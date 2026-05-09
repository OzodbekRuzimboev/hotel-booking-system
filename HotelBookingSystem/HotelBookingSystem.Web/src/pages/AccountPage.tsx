import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  getAccount,
  getFavorites,
  updateProfile,
  updateSettings,
} from "../api/accountApi";
import { cancelMyBooking, getMyBookings } from "../api/bookingsApi";
import { getApiErrorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { BookingStatusBadge } from "../components/BookingStatus";
import { ImageWithFallback } from "../components/ImageWithFallback";
import {
  BookingDisplayStatus,
  Role,
  type AccountSettings,
  type BookingResponse,
  type FavoriteHotelResponse,
  type UserAccountResponse,
} from "../types";
import { getDefaultStayDates } from "../utils/dates";
import { formatCurrency, formatDateRange } from "../utils/format";

function roleLabel(role: Role) {
  switch (role) {
    case Role.Admin:
      return "Admin";
    case Role.Owner:
      return "Partner";
    default:
      return "Customer";
  }
}

export function AccountPage() {
  const { updateUser } = useAuth();
  const defaults = getDefaultStayDates();
  const [account, setAccount] = useState<UserAccountResponse | null>(null);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [favorites, setFavorites] = useState<FavoriteHotelResponse[]>([]);
  const [profileDraft, setProfileDraft] = useState({
    name: "",
    phoneNumber: "",
    country: "",
  });
  const [settingsDraft, setSettingsDraft] = useState<AccountSettings>({
    preferredCurrency: "USD",
    preferredLanguage: "en",
    emailNotificationsEnabled: true,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadAccount() {
    setError("");
    setLoading(true);

    try {
      const nextAccount = await getAccount();
      const [nextBookings, nextFavorites] = await Promise.all([
        nextAccount.role === Role.User ? getMyBookings() : Promise.resolve([]),
        getFavorites(),
      ]);

      setAccount(nextAccount);
      setBookings(nextBookings);
      setFavorites(nextFavorites);
      setProfileDraft({
        name: nextAccount.name,
        phoneNumber: nextAccount.phoneNumber ?? "",
        country: nextAccount.country ?? "",
      });
      setSettingsDraft(nextAccount.settings);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAccount();
  }, []);

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const updated = await updateProfile({
        name: profileDraft.name,
        phoneNumber: profileDraft.phoneNumber || null,
        country: profileDraft.country || null,
      });
      setAccount(updated);
      updateUser({ name: updated.name });
      setSuccess("Profile updated.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function handleSettingsSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const updated = await updateSettings(settingsDraft);
      setSettingsDraft(updated);
      setSuccess("Settings saved.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function handleCancel(id: number) {
    setError("");
    setSuccess("");

    try {
      await cancelMyBooking(id);
      setBookings(await getMyBookings());
      setSuccess("Booking cancelled.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <main className="page stack-lg">
      <div className="page-header">
        <div>
          <p className="eyebrow">Account</p>
          <h1>My account</h1>
        </div>
        <button className="button secondary" type="button" onClick={loadAccount}>
          Refresh
        </button>
      </div>

      {loading && <p className="muted">Loading account...</p>}
      {error && <p className="alert error">{error}</p>}
      {success && <p className="alert success">{success}</p>}

      {account && (
        <>
          <section className="account-summary panel">
            <div>
              <span className="avatar">{account.name.slice(0, 1).toUpperCase()}</span>
            </div>
            <div>
              <h2>{account.name}</h2>
              <p className="muted">{account.email}</p>
              <div className="pill-row">
                <span className="pill">{roleLabel(account.role)}</span>
                {account.country && <span className="pill">{account.country}</span>}
              </div>
            </div>
          </section>

          <div className="account-grid">
            <section className="panel stack">
              <div>
                <p className="eyebrow">Personal information</p>
                <h2>Profile</h2>
              </div>
              <form className="form" onSubmit={handleProfileSubmit}>
                <label>
                  Name
                  <input
                    value={profileDraft.name}
                    onChange={(event) =>
                      setProfileDraft({ ...profileDraft, name: event.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  Phone
                  <input
                    value={profileDraft.phoneNumber}
                    onChange={(event) =>
                      setProfileDraft({
                        ...profileDraft,
                        phoneNumber: event.target.value,
                      })
                    }
                    placeholder="+998 90 123 45 67"
                  />
                </label>
                <label>
                  Country
                  <input
                    value={profileDraft.country}
                    onChange={(event) =>
                      setProfileDraft({
                        ...profileDraft,
                        country: event.target.value,
                      })
                    }
                    placeholder="Uzbekistan"
                  />
                </label>
                <button className="button" type="submit">
                  Save profile
                </button>
              </form>
            </section>

            <section className="panel stack">
              <div>
                <p className="eyebrow">Preferences</p>
                <h2>Settings</h2>
              </div>
              <form className="form" onSubmit={handleSettingsSubmit}>
                <label>
                  Currency
                  <select
                    value={settingsDraft.preferredCurrency}
                    onChange={(event) =>
                      setSettingsDraft({
                        ...settingsDraft,
                        preferredCurrency: event.target.value,
                      })
                    }
                  >
                    <option value="USD">USD</option>
                    <option value="UZS">UZS</option>
                    <option value="EUR">EUR</option>
                  </select>
                </label>
                <label>
                  Language
                  <select
                    value={settingsDraft.preferredLanguage}
                    onChange={(event) =>
                      setSettingsDraft({
                        ...settingsDraft,
                        preferredLanguage: event.target.value,
                      })
                    }
                  >
                    <option value="en">English</option>
                    <option value="uz">Uzbek</option>
                    <option value="ru">Russian</option>
                  </select>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settingsDraft.emailNotificationsEnabled}
                    onChange={(event) =>
                      setSettingsDraft({
                        ...settingsDraft,
                        emailNotificationsEnabled: event.target.checked,
                      })
                    }
                  />
                  Email booking updates
                </label>
                <button className="button secondary" type="submit">
                  Save settings
                </button>
              </form>
            </section>
          </div>
        </>
      )}

      <section className="panel stack">
        <div>
          <p className="eyebrow">Reservations</p>
          <h2>My bookings</h2>
        </div>
        {bookings.length === 0 ? (
          <p className="muted">You have no bookings yet.</p>
        ) : (
          <div className="booking-list">
            {bookings.map((booking) => (
              <article className="booking-card account-booking" key={booking.id}>
                <div>
                  <h3>{booking.hotelName}</h3>
                  <p className="muted">{booking.roomTypeName}</p>
                  <p>{formatDateRange(booking.checkInDate, booking.checkOutDate)}</p>
                  <p>Guests: {booking.guestsCount}</p>
                </div>
                <div className="booking-side">
                  <BookingStatusBadge status={booking.status} />
                  <strong>{formatCurrency(booking.totalPrice)}</strong>
                  {booking.status === BookingDisplayStatus.Active && (
                    <button
                      className="button danger"
                      type="button"
                      onClick={() => handleCancel(booking.id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel stack">
        <div>
          <p className="eyebrow">Saved stays</p>
          <h2>Favorites</h2>
        </div>
        {favorites.length === 0 ? (
          <p className="muted">Save hotels from the hotel page to see them here.</p>
        ) : (
          <div className="favorite-grid">
            {favorites.map((favorite) => {
              const search = new URLSearchParams({
                checkInDate: defaults.checkInDate,
                checkOutDate: defaults.checkOutDate,
                guestsCount: "1",
              });

              return (
                <article className="favorite-card" key={favorite.hotelId}>
                  <ImageWithFallback
                    alt={favorite.name}
                    className="favorite-image"
                    src={favorite.imageUrl}
                  />
                  <div className="stack-sm">
                    <h3>{favorite.name}</h3>
                    <p className="muted">{favorite.city} - {favorite.address}</p>
                    <div className="pill-row">
                      <span className="pill">
                        {favorite.reviewCount > 0
                          ? `${favorite.averageRating.toFixed(1)} review score`
                          : "No reviews yet"}
                      </span>
                    </div>
                    <Link
                      className="button secondary inline-button"
                      to={`/hotels/${favorite.hotelId}?${search.toString()}`}
                    >
                      View hotel
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
