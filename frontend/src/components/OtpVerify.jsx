import { useState, useRef, useEffect } from "react";
import { useLang } from "../i18n/LanguageContext";
import { authApi } from "../api";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";

const RESEND_SECONDS = 30;

export default function OtpVerify({ email, onVerified, onBack }) {
  const { t } = useLang();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function setDigitAt(index, value) {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleChange(index, raw) {
    const value = raw.replace(/\D/g, "");
    if (!value) {
      setDigitAt(index, "");
      return;
    }
    // Handle paste of the full code into one box.
    if (value.length > 1) {
      const chars = value.slice(0, 6).split("");
      setDigits((prev) => {
        const next = [...prev];
        chars.forEach((c, i) => {
          if (index + i < 6) next[index + i] = c;
        });
        return next;
      });
      const last = Math.min(index + chars.length, 5);
      inputRefs.current[last]?.focus();
      return;
    }
    setDigitAt(index, value);
    if (index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  const code = digits.join("");

  async function handleVerify(e) {
    e?.preventDefault();
    if (code.length !== 6) return;
    setError(null);
    setBusy(true);
    try {
      await authApi.verifyOtp(email, code);
      onVerified(code);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError(null);
    try {
      await authApi.forgotPassword(email);
      setSeconds(RESEND_SECONDS);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="flex justify-end mb-3">
          <LanguageSwitcher />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Logo size={30} />
            <span className="text-sm font-semibold text-gray-900">{t.appName}</span>
          </div>

          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-2xl shadow-sm mb-4">
            🔒
          </div>

          <h1 className="text-lg font-semibold text-gray-900">
            {t.otpTitle || "Verify Your OTP"}
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
            {(t.otpDesc || "We've sent a 6-digit verification code to").replace(
              "{email}",
              ""
            )}
            <br />
            <span className="font-medium text-gray-700">{email}</span>
          </p>

          <form onSubmit={handleVerify} className="mt-6">
            <div className="flex justify-center gap-2" dir="ltr">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-lg font-semibold rounded-xl border-2 outline-none transition ${
                    d
                      ? "border-brand-500 text-brand-700 bg-brand-50"
                      : "border-gray-200 text-gray-900 focus:border-brand-400"
                  }`}
                />
              ))}
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy || code.length !== 6}
              className="w-full mt-5 py-2.5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-semibold hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {busy ? "…" : (t.otpVerifyBtn || "VERIFY OTP")} {!busy && "→"}
            </button>
          </form>

          <div className="mt-4 text-xs text-gray-500">
            {seconds > 0 ? (
              <>
                {t.otpResendIn || "Resend OTP in"}{" "}
                <span className="font-semibold text-brand-700">{seconds}s</span>
              </>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-brand-700 font-medium hover:underline disabled:opacity-50"
              >
                {resending ? "…" : t.otpResendBtn || "Resend code"}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onBack}
            className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-5"
          >
            ← {t.backToLogin}
          </button>
        </div>
      </div>
    </div>
  );
}
