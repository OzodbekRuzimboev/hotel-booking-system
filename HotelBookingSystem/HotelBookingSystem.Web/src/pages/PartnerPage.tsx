import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { login, register } from "../api/authApi";
import { useAuth } from "../auth/AuthContext";
import { PasswordField } from "../components/PasswordField";
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
        setLoginError("Это не партнерский аккаунт. Зарегистрируйтесь как партнер, чтобы разместить объект.");
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
      <h1 className="partner-title">Разместите свой отель на StayFinder</h1>

      <section className="panel stack partner-access-card">
        {mode === "register" ? (
          <>
            <div>
              <p className="eyebrow">Новый партнер</p>
              <h2>Регистрация аккаунта владельца</h2>
            </div>

            <form className="form" onSubmit={handlePartnerRegister}>
              <label>
                Имя
                <input
                  value={registerName}
                  onChange={(event) => setRegisterName(event.target.value)}
                  minLength={2}
                  required
                />
              </label>
              <label>
                Электронная почта
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(event) => setRegisterEmail(event.target.value)}
                  required
                />
              </label>
              <PasswordField
                autoComplete="new-password"
                label="Пароль"
                value={registerPassword}
                onChange={(event) => setRegisterPassword(event.target.value)}
                minLength={8}
                required
              />
              {registerError && <p className="alert error">{registerError}</p>}
              <button className="button" disabled={registerLoading} type="submit">
                {registerLoading ? "Создание аккаунта..." : "Зарегистрироваться как партнер"}
              </button>
            </form>

            <p className="partner-switch">
              Уже партнер?{" "}
              <button
                className="partner-switch-button"
                type="button"
                onClick={() => {
                  setRegisterError("");
                  setMode("login");
                }}
              >
                Войти
              </button>
            </p>
          </>
        ) : (
          <>
            <div>
              <p className="eyebrow">Действующий партнер</p>
              <h2>Вход в панель владельца</h2>
            </div>

            <form className="form" onSubmit={handlePartnerLogin}>
              <label>
                Электронная почта
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  required
                />
              </label>
              <PasswordField
                autoComplete="current-password"
                label="Пароль"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                required
              />
              {loginError && <p className="alert error">{loginError}</p>}
              <button
                className="button secondary"
                disabled={loginLoading}
                type="submit"
              >
                {loginLoading ? "Вход..." : "Войти как партнер"}
              </button>
            </form>

            <p className="partner-switch">
              Новый партнер?{" "}
              <button
                className="partner-switch-button"
                type="button"
                onClick={() => {
                  setLoginError("");
                  setMode("register");
                }}
              >
                Зарегистрироваться
              </button>
            </p>

            <p className="muted small">
              Аккаунт гостя? <Link to="/login">Обычный вход</Link>.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
