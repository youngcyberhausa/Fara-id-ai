import { useState } from "react";
import { useLang } from "../i18n/LanguageContext";
import { authApi } from "../api";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";

export default function ResetPassword({ token, onDone }) {
  const { t } = useLang();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
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
            <Logo size={38} />
            <div>
              <div className="text-sm font-semibold text-gray-900">{t.appName}</div>
              <div className="text-[11px] text-gray-400">{t.tagline}</div>
            </div>
          </div>

          {done ? (
            <>
              <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-3">
                {t.resetSuccess}
              </div>
              <button
                onClick={onDone}
                className="w-full mt-4 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"
              >
                {t.backToLogin}
              </button>
            </>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-gray-900">{t.resetPasswordTitle}</h1>
              <p className="text-sm text-gray-500 mt-1">{t.resetPasswordDesc}</p>

              <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">{t.newPasswordLabel}</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                  />
                </div>

                {error && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {error === "This reset link is invalid or has expired." ? t.invalidResetLink : error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
                >
                  {busy ? "…" : t.resetPasswordBtn}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
