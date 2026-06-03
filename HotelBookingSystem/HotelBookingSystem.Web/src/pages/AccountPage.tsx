import { useEffect, useState, type FormEvent } from "react";
import {
  changePassword,
  getAccount,
  updateProfile,
} from "../api/accountApi";
import { getApiErrorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { ImageField } from "../components/ImageField";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { PasswordField } from "../components/PasswordField";
import { type UserAccountResponse } from "../types";

export function AccountPage() {
  const { updateUser } = useAuth();
  const [account, setAccount] = useState<UserAccountResponse | null>(null);
  const [profileDraft, setProfileDraft] = useState({
    name: "",
    phoneNumber: "",
    country: "",
    profileImageUrl: "",
  });
  const [passwordDraft, setPasswordDraft] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadAccount() {
    setError("");
    setLoading(true);

    try {
      const nextAccount = await getAccount();
      setAccount(nextAccount);
      setProfileDraft({
        name: nextAccount.name,
        phoneNumber: nextAccount.phoneNumber ?? "",
        country: nextAccount.country ?? "",
        profileImageUrl: nextAccount.profileImageUrl ?? "",
      });
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
        profileImageUrl: profileDraft.profileImageUrl || null,
      });
      setAccount(updated);
      updateUser({
        name: updated.name,
        profileImageUrl: updated.profileImageUrl ?? null,
      });
      setSuccess("Профиль обновлен.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (passwordDraft.newPassword !== passwordDraft.confirmPassword) {
      setError("Новый пароль и подтверждение не совпадают.");
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordDraft.currentPassword,
        newPassword: passwordDraft.newPassword,
      });
      setPasswordDraft({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccess("Пароль обновлен.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <main className="page stack-lg">
      <div className="page-header">
        <div>
          <h1>Личный кабинет</h1>
        </div>
      </div>

      {loading && <p className="muted">Загрузка аккаунта...</p>}
      {error && <p className="alert error">{error}</p>}
      {success && <p className="alert success">{success}</p>}

      {account && (
        <>
          <section className="account-summary panel">
            <div>
              <ImageWithFallback
                alt={account.name}
                className="avatar profile-avatar"
                src={account.profileImageUrl}
              />
            </div>
            <div className="account-identity">
              <h2>{account.name}</h2>
              <p className="muted">{account.email}</p>
              <div className="pill-row">
                {account.country && <span className="pill">{account.country}</span>}
              </div>
            </div>
          </section>

          <div className="account-grid">
            <section className="panel stack">
              <div>
                <h2>Личная информация</h2>
              </div>
              <form className="form" onSubmit={handleProfileSubmit}>
                <label>
                  Имя
                  <input
                    value={profileDraft.name}
                    onChange={(event) =>
                      setProfileDraft({ ...profileDraft, name: event.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  Телефон
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
                  Страна
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
                <div className="profile-photo-field">
                  <ImageField
                    label="Фото профиля"
                    maxImages={1}
                    previewAlt={profileDraft.name || "Фото профиля"}
                    values={
                      profileDraft.profileImageUrl
                        ? [profileDraft.profileImageUrl]
                        : []
                    }
                    onChange={(imageUrls) =>
                      setProfileDraft({
                        ...profileDraft,
                        profileImageUrl: imageUrls[0] ?? "",
                      })
                    }
                  />
                </div>
                <button className="button" type="submit">
                  Сохранить профиль
                </button>
              </form>
            </section>

            <section className="panel stack">
              <div>
                <h2>Пароль</h2>
              </div>
              <form className="form" onSubmit={handlePasswordSubmit}>
                <PasswordField
                  autoComplete="current-password"
                  label="Текущий пароль"
                  value={passwordDraft.currentPassword}
                  onChange={(event) =>
                    setPasswordDraft({
                      ...passwordDraft,
                      currentPassword: event.target.value,
                    })
                  }
                  required
                />
                <PasswordField
                  autoComplete="new-password"
                  label="Новый пароль"
                  value={passwordDraft.newPassword}
                  onChange={(event) =>
                    setPasswordDraft({
                      ...passwordDraft,
                      newPassword: event.target.value,
                    })
                  }
                  minLength={8}
                  required
                />
                <PasswordField
                  autoComplete="new-password"
                  label="Подтвердите новый пароль"
                  value={passwordDraft.confirmPassword}
                  onChange={(event) =>
                    setPasswordDraft({
                      ...passwordDraft,
                      confirmPassword: event.target.value,
                    })
                  }
                  minLength={8}
                  required
                />
                <button className="button secondary" type="submit">
                  Изменить пароль
                </button>
              </form>
            </section>

          </div>
        </>
      )}
    </main>
  );
}
