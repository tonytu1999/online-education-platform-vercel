import { useState, FormEvent } from "react";
import { apiLogin, apiRegister } from "../lib/api";

interface LoginProps {
  onLogin: (
    token: string,
    user: { id: number; name: string; role: string },
  ) => void;
}

export function ViewLogin({ onLogin }: LoginProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("TEACHER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiRegister(name, email, password, role);
      const data = await apiLogin(email, password);
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-mark">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3L4 7v5c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V7l-8-4z"
                fill="currentColor"
                fillOpacity=".9"
              />
              <path
                d="M9 12l2 2 4-4"
                stroke="#fff"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="auth-brand__name">Lumen</span>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab${tab === "login" ? " auth-tab--active" : ""}`}
            onClick={() => {
              setTab("login");
              setError("");
            }}
          >
            Sign in
          </button>
          <button
            className={`auth-tab${tab === "register" ? " auth-tab--active" : ""}`}
            onClick={() => {
              setTab("register");
              setError("");
            }}
          >
            Create account
          </button>
        </div>

        {tab === "login" ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <label className="auth-label">
              Email
              <input
                className="auth-input"
                type="email"
                autoComplete="email"
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="auth-label">
              Password
              <input
                className="auth-input"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {error && <p className="auth-error">{error}</p>}
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegister}>
            <label className="auth-label">
              Full name
              <input
                className="auth-input"
                type="text"
                autoComplete="name"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label className="auth-label">
              Email
              <input
                className="auth-input"
                type="email"
                autoComplete="email"
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="auth-label">
              Password
              <input
                className="auth-input"
                type="password"
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <label className="auth-label">
              Role
              <select
                className="auth-input auth-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="TEACHER">Teacher</option>
                <option value="SCHOOL_ADMIN">School Admin</option>
                <option value="STUDENT">Student</option>
                <option value="PARENT">Parent</option>
              </select>
            </label>
            {error && <p className="auth-error">{error}</p>}
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
