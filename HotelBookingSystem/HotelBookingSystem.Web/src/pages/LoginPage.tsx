import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { login } from "../api/authApi";
import { useAuth } from "../auth/AuthContext";
import { PasswordField } from "../components/PasswordField";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginUser } = useAuth();
  const returnTo = searchParams.get("returnTo") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const auth = await login({ email, password });
      loginUser(auth);
      navigate(returnTo);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card panel stack">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1>Sign in</h1>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <PasswordField
            autoComplete="current-password"
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error && <p className="alert error">{error}</p>}
          <button className="button" disabled={loading} type="submit">{loading ? "Signing in..." : "Sign in"}</button>
        </form>

        <p className="muted small">
          No account?{" "}
          <Link to={`/register?returnTo=${encodeURIComponent(returnTo)}`}>
            Register
          </Link>
        </p>
      </section>
    </main>
  );
}
