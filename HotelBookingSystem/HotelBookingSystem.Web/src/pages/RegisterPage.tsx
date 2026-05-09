import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { register } from "../api/authApi";
import { useAuth } from "../auth/AuthContext";

export function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginUser } = useAuth();
  const returnTo = searchParams.get("returnTo") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const auth = await register({ name, email, password });
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
          <p className="eyebrow">Create account</p>
          <h1>Register</h1>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label>Name<input value={name} onChange={(event) => setName(event.target.value)} minLength={2} required /></label>
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /></label>
          {error && <p className="alert error">{error}</p>}
          <button className="button" disabled={loading} type="submit">{loading ? "Creating account..." : "Register"}</button>
        </form>

        <p className="muted small">
          Already registered?{" "}
          <Link to={`/login?returnTo=${encodeURIComponent(returnTo)}`}>
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
