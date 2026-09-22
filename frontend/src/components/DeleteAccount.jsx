import { useState } from "react";
import { authApi } from "../api";
import LanguageSwitcher from "./LanguageSwitcher";

/**
 * Standalone, no-login-required page: /delete-account
 *
 * Google Play's Account Deletion policy requires a way for users to
 * request deletion of their account and data WITHOUT needing the app
 * installed. This page is the "Delete account URL" entered in Play
 * Console → App content → Data safety.
 *
 * Flow: enter email -> we email a 6-digit code -> enter code -> account
 * and all saved cases are permanently deleted server-side.
 */
export default function DeleteAccount() {
  const [step, setStep] = useState("email"); // email | otp | done
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function requestCode(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await authApi.requestAccountDeletion(email.trim());
      setStep("otp");
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await authApi.confirmAccountDeletion(email.trim(), otp.trim());
      setStep("done");
    } catch (err) {
      setError(err?.message || "That code is invalid or has expired.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-sm text-gray-600 hover:text-gray-800">
            ← Fara'id AI
          </a>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h1 className="text-xl font-bold text-gray-900">Delete your account</h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            This permanently deletes your Fara'id AI account and every saved
            case tied to it (estate, deductions, heirs, and results). This
            cannot be undone. You don't need the app installed to do this —
            just your account email.
          </p>

          <div className="mt-4 rounded-lg bg-amber-50 border border-amber-100 p-3 text-xs text-amber-800 space-y-1">
            <p className="font-medium">What gets deleted:</p>
            <p>Your account (email, name), all saved cases, and payment records.</p>
            <p className="font-medium mt-2">What may be kept:</p>
            <p>
              Anonymized transaction logs required for financial/legal
              record-keeping may be retained for a limited period, without
              being linked back to you.
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {step === "email" && (
            <form onSubmit={requestCode} className="mt-6 space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Account email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-red-600 text-white text-sm font-medium py-2.5 hover:bg-red-700 disabled:opacity-60"
              >
                {busy ? "Sending code…" : "Send confirmation code"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={confirmDelete} className="mt-6 space-y-3">
              <p className="text-sm text-gray-600">
                We sent a 6-digit code to <strong>{email}</strong>. Enter it
                below to permanently delete your account.
              </p>
              <input
                type="text"
                inputMode="numeric"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-red-600 text-white text-sm font-medium py-2.5 hover:bg-red-700 disabled:opacity-60"
              >
                {busy ? "Deleting…" : "Permanently delete my account"}
              </button>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full text-xs text-gray-400 hover:text-gray-600"
              >
                Use a different email
              </button>
            </form>
          )}

          {step === "done" && (
            <div className="mt-6 text-center py-6">
              <div className="text-emerald-600 text-3xl mb-2">✓</div>
              <p className="text-sm text-gray-700">
                Your account and all saved cases have been permanently
                deleted.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
