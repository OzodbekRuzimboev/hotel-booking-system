import { useEffect, useState, type FormEvent } from "react";
import { createUser, getUsers, updateUserRole } from "../../api/adminApi";
import { getApiErrorMessage } from "../../api/client";
import { PasswordField } from "../../components/PasswordField";
import { Role, type Role as RoleValue, type UserRoleResponse } from "../../types";

function roleName(role: number) {
  switch (role) {
    case Role.User:
      return "User";
    case Role.Owner:
      return "Owner";
    case Role.Admin:
      return "Admin";
    default:
      return "Unknown";
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
      setSuccess("User account created.");
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
      setSuccess("Role updated.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <main className="page stack-lg">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>User accounts</h1>
        </div>
      </div>

      {error && <p className="alert error">{error}</p>}
      {success && <p className="alert success">{success}</p>}

      <section className="panel stack">
        <div>
          <p className="eyebrow">Create account</p>
          <h2>Add user, owner, or admin</h2>
        </div>
        <form className="form-grid user-create-grid" onSubmit={handleCreate}>
          <label>
            Name
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
            Email
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
            label="Password"
            value={newUser.password}
            onChange={(event) =>
              setNewUser({ ...newUser, password: event.target.value })
            }
            required
            minLength={8}
          />
          <label>
            Role
            <select
              value={newUser.role}
              onChange={(event) =>
                setNewUser({
                  ...newUser,
                  role: Number(event.target.value) as RoleValue,
                })
              }
            >
              <option value={Role.User}>User</option>
              <option value={Role.Owner}>Owner</option>
              <option value={Role.Admin}>Admin</option>
            </select>
          </label>
          <button className="button" type="submit">
            Create account
          </button>
        </form>
      </section>

      <section className="panel stack">
        <div>
          <p className="eyebrow">Directory</p>
          <h2>Existing accounts</h2>
        </div>
        {loading && <p className="muted">Loading users...</p>}
        {users.length === 0 && !loading ? (
          <p className="muted">No users found.</p>
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
                  Role
                  <select
                    value={user.role}
                    onChange={(event) =>
                      handleRoleChange(
                        user.id,
                        Number(event.target.value) as RoleValue
                      )
                    }
                  >
                    <option value={Role.User}>User</option>
                    <option value={Role.Owner}>Owner</option>
                    <option value={Role.Admin}>Admin</option>
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
