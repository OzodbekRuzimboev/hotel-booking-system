import { useEffect, useState, type FormEvent } from "react";
import { createUser, getUsers, updateUserRole } from "../../api/adminApi";
import { getApiErrorMessage } from "../../api/client";
import { PasswordField } from "../../components/PasswordField";
import { Role, type Role as RoleValue, type UserRoleResponse } from "../../types";

function roleName(role: number) {
  switch (role) {
    case Role.User:
      return "Пользователь";
    case Role.Owner:
      return "Владелец";
    case Role.Admin:
      return "Администратор";
    default:
      return "Неизвестно";
  }
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserRoleResponse[]>([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: Role.User as RoleValue,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadUsers() {
    setError("");
    setLoading(true);

    try {
      setUsers(await getUsers());
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await createUser(newUser);
      setNewUser({ name: "", email: "", password: "", role: Role.User });
      await loadUsers();
      setSuccess("Аккаунт пользователя создан.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function handleRoleChange(userId: number, role: RoleValue) {
    setError("");
    setSuccess("");

    try {
      await updateUserRole(userId, { role });
      await loadUsers();
      setSuccess("Роль обновлена.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <main className="page stack-lg">
      <div className="page-header">
        <div>
          <p className="eyebrow">Администратор</p>
          <h1>Аккаунты пользователей</h1>
        </div>
      </div>

      {error && <p className="alert error">{error}</p>}
      {success && <p className="alert success">{success}</p>}

      <section className="panel stack">
        <div>
          <p className="eyebrow">Создание аккаунта</p>
          <h2>Добавить пользователя, владельца или администратора</h2>
        </div>
        <form className="form-grid user-create-grid" onSubmit={handleCreate}>
          <label>
            Имя
            <input
              value={newUser.name}
              onChange={(event) =>
                setNewUser({ ...newUser, name: event.target.value })
              }
              required
              minLength={2}
            />
          </label>
          <label>
            Электронная почта
            <input
              type="email"
              value={newUser.email}
              onChange={(event) =>
                setNewUser({ ...newUser, email: event.target.value })
              }
              required
            />
          </label>
          <PasswordField
            autoComplete="new-password"
            label="Пароль"
            value={newUser.password}
            onChange={(event) =>
              setNewUser({ ...newUser, password: event.target.value })
            }
            required
            minLength={8}
          />
          <label>
            Роль
            <select
              value={newUser.role}
              onChange={(event) =>
                setNewUser({
                  ...newUser,
                  role: Number(event.target.value) as RoleValue,
                })
              }
            >
              <option value={Role.User}>Пользователь</option>
              <option value={Role.Owner}>Владелец</option>
              <option value={Role.Admin}>Администратор</option>
            </select>
          </label>
          <button className="button" type="submit">
            Создать аккаунт
          </button>
        </form>
      </section>

      <section className="panel stack">
        <div>
          <p className="eyebrow">Список</p>
          <h2>Существующие аккаунты</h2>
        </div>
        {loading && <p className="muted">Загрузка пользователей...</p>}
        {users.length === 0 && !loading ? (
          <p className="muted">Пользователи не найдены.</p>
        ) : (
          <div className="user-table">
            {users.map((user) => (
              <article className="user-row" key={user.id}>
                <div>
                  <strong>{user.name}</strong>
                  <p className="muted small">
                    #{user.id} - {user.email}
                  </p>
                  {(user.phoneNumber || user.country) && (
                    <p className="muted small">
                      {[user.phoneNumber, user.country].filter(Boolean).join(" - ")}
                    </p>
                  )}
                </div>
                <span className="pill">{roleName(user.role)}</span>
                <label>
                  Роль
                  <select
                    value={user.role}
                    onChange={(event) =>
                      handleRoleChange(
                        user.id,
                        Number(event.target.value) as RoleValue
                      )
                    }
                  >
                    <option value={Role.User}>Пользователь</option>
                    <option value={Role.Owner}>Владелец</option>
                    <option value={Role.Admin}>Администратор</option>
                  </select>
                </label>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
