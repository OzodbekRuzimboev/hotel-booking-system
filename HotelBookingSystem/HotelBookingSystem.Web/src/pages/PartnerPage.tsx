import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { login, register } from "../api/authApi";
import { useAuth } from "../auth/AuthContext";
import { Role } from "../types";

export function PartnerPage() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [mode, setMode] = useState<"register" | "login">("register");

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
      <h1 className="partner-title">List your hotel on StayFinder</h1>

      <section className="panel stack partner-access-card">
        {mode === "register" ? (
          <>
            <div>
              <p className="eyebrow">New partner</p>
              <h2>Register owner account</h2>
            </div>

            <form className="form" onSubmit={handlePartnerRegister}>
              <label>
                Name
                <input
                  value={registerName}
                  onChange={(event) => setRegisterName(event.target.value)}
                  minLength={2}
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(event) => setRegisterEmail(event.target.value)}
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(event) => setRegisterPassword(event.target.value)}
                  minLength={8}
                  required
                />
              </label>
              {registerError && <p className="alert error">{registerError}</p>}
              <button className="button" disabled={registerLoading} type="submit">
                {registerLoading ? "Creating account..." : "Register as partner"}
              </button>
            </form>

            <p className="partner-switch">
              Already a partner?{" "}
              <button
                className="partner-switch-button"
                type="button"
                onClick={() => {
                  setRegisterError("");
                  setMode("login");
                }}
              >
                Sign in
              </button>
            </p>
          </>
        ) : (
          <>
            <div>
              <p className="eyebrow">Existing partner</p>
              <h2>Sign in to owner dashboard</h2>
            </div>

            <form className="form" onSubmit={handlePartnerLogin}>
              <label>
                Email
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  required
                />
              </label>
              {loginError && <p className="alert error">{loginError}</p>}
              <button
                className="button secondary"
                disabled={loginLoading}
                type="submit"
              >
                {loginLoading ? "Signing in..." : "Sign in as partner"}
              </button>
            </form>

            <p className="partner-switch">
              New partner?{" "}
              <button
                className="partner-switch-button"
                type="button"
                onClick={() => {
                  setLoginError("");
                  setMode("register");
                }}
              >
                Register
              </button>
            </p>

            <p className="muted small">
              Customer account? <Link to="/login">Use normal sign in</Link>.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
