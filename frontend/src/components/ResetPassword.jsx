import { useState } from "react";
import { useLang } from "../i18n/LanguageContext";
import { authApi } from "../api";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

export default function ResetPassword({
  token,
  onDone,
}) {
  const { t } = useLang();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      await authApi.resetPassword(
        token,
        password,
      );

      onDone();
    } catch (e) {
      setError(
        e.message ||
        "This reset link is invalid or has expired."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">

        <div className="flex justify-end gap-2 mb-3">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          <div className="flex items-center gap-3 mb-5">
            <Logo size={38} />

            <div>
              <div className="text-sm font-semibold text-gray-900">
                {t.appName}
              </div>

              <div className="text-[11px] text-gray-400">
                {t.tagline}
              </div>
            </div>
          </div>

          <h1 className="text-lg font-semibold text-gray-900">
            Create a new password
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Enter your new password below.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-5 space-y-4"
          >

            <div>
              <label className="text-xs font-medium text-gray-600">
                New password
              </label>

              <div className="relative mt-1">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((v) => !v)
                  }
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">
                Confirm new password
              </label>

              <div className="relative mt-1">
                <input
                  type={
                    showConfirm
                      ? "text"
                      : "password"
                  }
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirm((v) => !v)
                  }
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showConfirm ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
            >
              {busy
                ? "…"
                : "Reset password"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
