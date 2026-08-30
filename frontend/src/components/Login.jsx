import { useState, useRef, useEffect } from "react";
import { useLang } from "../i18n/LanguageContext";
import { useAuth } from "../AuthContext";
import { authApi } from "../api";
import LanguageSwitcher from "./LanguageSwitcher";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function Login() {
  const { t } = useLang();
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [busy, setBusy] = useState(false);
  const googleDivRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !window.google || !googleDivRef.current) return;
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          setError(null);
          setBusy(true);
          try {
            await loginWithGoogle(response.credential);
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleDivRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: mode === "register" ? "signup_with" : "signin_with",
      });
    } catch {
      // Google script not ready yet — ignore, button simply won't render.
    }
  }, [mode, loginWithGoogle]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "forgot") {
        await authApi.forgotPassword(email.trim());
        setInfo(t.resetLinkSent);
      } else if (mode === "register") {
        await register(email.trim(), password, name.trim() || undefined);
      } else {
        await login(email.trim(), password);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="flex justify-end mb-3">
          <LanguageSwitcher />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-brand-700 text-white flex items-center justify-center font-bold">
            F
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">{t.appName}</div>
            <div className="text-[11px] text-gray-400">{t.tagline}</div>
          </div>
        </div>

        <h1 className="text-lg font-semibold text-gray-900">
          {mode === "login" ? t.loginTitle : mode === "register" ? t.registerTitle : t.forgotPasswordTitle}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {mode === "login" ? t.loginDesc : mode === "register" ? t.registerDesc : t.forgotPasswordDesc}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          {mode === "register" && (
            <div>
              <label className="text-xs font-medium text-gray-600">{t.nameLabel}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-gray-600">{t.emailLabel}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          {mode !== "forgot" && (
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-600">{t.passwordLabel}</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setError(null);
                      setInfo(null);
                    }}
                    className="text-[11px] text-brand-700 font-medium"
                  >
                    {t.forgotPasswordLink}
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>
          )}

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          {info && (
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
          >
            {busy
              ? "…"
              : mode === "login"
              ? t.loginBtn
              : mode === "register"
              ? t.registerBtn
              : t.sendResetLink}
          </button>

          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
                setInfo(null);
              }}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-700"
            >
              ← {t.backToLogin}
            </button>
          )}
        </form>

        {mode !== "forgot" && (
        <>
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-[11px] text-gray-400">{t.orLabel}</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <div className="flex justify-center" ref={googleDivRef} />
        {!GOOGLE_CLIENT_ID && (
          <p className="text-[11px] text-gray-400 text-center mt-2">{t.googleUnavailable}</p>
        )}

        <div className="text-center text-xs text-gray-500 mt-5">
          {mode === "login" ? (
            <>
              {t.noAccount}{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-brand-700 font-medium"
              >
                {t.registerBtn}
              </button>
            </>
          ) : (
            <>
              {t.haveAccount}{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-brand-700 font-medium"
              >
                {t.loginBtn}
              </button>
            </>
          )}
        </div>
        </>
        )}
        </div>
        <div className="flex items-center justify-center gap-3 text-[11px] text-gray-400 mt-4">
          <a href="/about" className="hover:text-gray-600">{t.footerAbout}</a>
          <span>·</span>
          <a href="/terms" className="hover:text-gray-600">{t.footerTerms}</a>
          <span>·</span>
          <a href="/privacy" className="hover:text-gray-600">{t.footerPrivacy}</a>
        </div>
      </div>
    </div>
  );
}
