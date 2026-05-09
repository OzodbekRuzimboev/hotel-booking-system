import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { login, register } from "../api/authApi";
import { useAuth } from "../auth/AuthContext";
import { Role } from "../types";

export function PartnerPage() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  async function handlePartnerRegister(event: FormEvent) {
    event.preventDefault();
    setRegisterError("");
    setRegisterLoading(true);

    try {
      const auth = await register({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        role: Role.Owner,
      });
      loginUser(auth);
      navigate("/owner/hotels");
    } catch (err) {
      setRegisterError(getApiErrorMessage(err));
    } finally {
      setRegisterLoading(false);
    }
  }

  async function handlePartnerLogin(event: FormEvent) {
    event.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const auth = await login({ email: loginEmail, password: loginPassword });

      if (auth.role !== Role.Owner && auth.role !== Role.Admin) {
        setLoginError("This is not a partner account. Register as a partner to list a property.");
        return;
      }

      loginUser(auth);
      navigate(auth.role === Role.Admin ? "/admin/hotels" : "/owner/hotels");
    } catch (err) {
      setLoginError(getApiErrorMessage(err));
    } finally {
      setLoginLoading(false);
    }
  }

  return (
    <main className="page partner-page stack-lg">
      <div className="page-header">
        <div>
          <p className="eyebrow">Partner access</p>
          <h1>List your property</h1>
          <p className="lead">
            Create a partner account, then add your hotel, room types, rooms, and image URLs from the owner dashboard.
          </p>
        </div>
      </div>

      <div className="partner-grid">
        <section className="panel stack">
          <div>
            <p className="eyebrow">New partner</p>
            <h2>Register owner account</h2>
          </div>

          <form className="form" onSubmit={handlePartnerRegister}>
            <label>
              Name
              <input value={registerName} onChange={(event) => setRegisterName(event.target.value)} minLength={2} required />
            </label>
            <label>
              Email
              <input type="email" value={registerEmail} onChange={(event) => setRegisterEmail(event.target.value)} required />
            </label>
            <label>
              Password
              <input type="password" value={registerPassword} onChange={(event) => setRegisterPassword(event.target.value)} minLength={8} required />
            </label>
            {registerError && <p className="alert error">{registerError}</p>}
            <button className="button" disabled={registerLoading} type="submit">
              {registerLoading ? "Creating account..." : "Register as partner"}
            </button>
          </form>
        </section>

        <section className="panel stack">
          <div>
            <p className="eyebrow">Existing partner</p>
            <h2>Login to owner dashboard</h2>
          </div>

          <form className="form" onSubmit={handlePartnerLogin}>
            <label>
              Email
              <input type="email" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} required />
            </label>
            <label>
              Password
              <input type="password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} required />
            </label>
            {loginError && <p className="alert error">{loginError}</p>}
            <button className="button secondary" disabled={loginLoading} type="submit">
              {loginLoading ? "Logging in..." : "Login as partner"}
            </button>
          </form>

          <p className="muted small">
            Customer account? <Link to="/login">Use normal login</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
