import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { notificationsApi, rubuuDinarApi } from "../api";
import {
  disablePushNotifications,
  isNativePushSupported,
  setupPushNotifications,
} from "../pushNotifications";

const CURRENCIES = [
  { code: "NGN", flag: "🇳🇬", name: "Nigerian Naira" },
  { code: "USD", flag: "🇺🇸", name: "US Dollar" },
  { code: "GBP", flag: "🇬🇧", name: "British Pound" },
  { code: "SAR", flag: "🇸🇦", name: "Saudi Riyal" },
  { code: "AED", flag: "🇦🇪", name: "UAE Dirham" },
  { code: "EUR", flag: "🇪🇺", name: "Euro" },
];

export default function RubuuDinarAlert({ onBack, currency = "NGN" }) {
  const { user, refreshUser } = useAuth();

  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    try {
      return localStorage.getItem("faraid_rubuu_currency") || currency || "NGN";
    } catch {
      return currency || "NGN";
    }
  });

  const [price, setPrice] = useState(null);
  const [enabled, setEnabled] = useState(
    Boolean(user?.push_notifications_enabled)
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setMessage(null);

    rubuuDinarApi
      .getCurrent(selectedCurrency)
      .then((current) => {
        if (!cancelled) {
          setPrice(current);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMessage("An samu matsala wajen samun farashin yanzu.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCurrency]);

  function selectCurrency(code) {
    setSelectedCurrency(code);
    setCurrencyOpen(false);

    try {
      localStorage.setItem("faraid_rubuu_currency", code);
    } catch {
      // Ignore localStorage errors.
    }
  }

  async function toggleNotifications() {
    const next = !enabled;
    setSaving(true);
    setMessage(null);

    try {
      if (next) {
        if (!isNativePushSupported()) {
          setMessage(
            "Push alerts suna aiki a Android app; ba browser version ba."
          );
          return;
        }

        const result = await setupPushNotifications();

        if (!result.enabled) {
          setMessage(
            result.reason === "permission_denied"
              ? "An hana notification permission. Ka ba Fara'id AI permission a Android Settings."
              : "Ba a kunna push notifications ba."
          );
          return;
        }

        await notificationsApi.updatePreferences(true, selectedCurrency);
        setEnabled(true);
      } else {
        await notificationsApi.updatePreferences(false, selectedCurrency);
        await disablePushNotifications();
        setEnabled(false);
      }

      await refreshUser();
    } catch (error) {
      setMessage(
        error.message || "An samu matsala wajen canza notification setting."
      );
    } finally {
      setSaving(false);
    }
  }

  function formatPrice(value) {
    if (value === null || value === undefined) return "—";

    return Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const currentCurrency =
    CURRENCIES.find((item) => item.code === selectedCurrency) ||
    CURRENCIES[0];

  return (
    <div className="max-w-xl mx-auto">
      <button
        onClick={onBack}
        className="text-sm text-brand-600 hover:underline mb-4"
      >
        ← Back
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-2xl">🪙</div>

            <h2 className="text-lg font-semibold text-gray-900 mt-1">
              Rubu'u Dinar Price Alert
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Za ka iya samun notification idan farashin Rubu'u Dinar ya canza,
              ko da app ɗin ba a bude yake ba.
            </p>
          </div>
        </div>

        {/* Price Card */}
        <div className="mt-6 rounded-xl bg-gray-50 border border-gray-100 p-5">
          <div className="text-xs text-gray-500">
            Current Rubu'u Dinar
          </div>

          <div className="flex items-center justify-between gap-3 mt-1">
            <div className="text-3xl font-bold text-gray-900">
              {loading
                ? "…"
                : price
                ? formatPrice(price.rubuu_dinar_price)
                : "—"}
            </div>

            {/* Currency Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCurrencyOpen((open) => !open)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 active:bg-gray-100"
                aria-haspopup="listbox"
                aria-expanded={currencyOpen}
              >
                <span>{currentCurrency.flag}</span>
                <span>{selectedCurrency}</span>
                <span className="text-gray-400 text-xs">
                  {currencyOpen ? "▲" : "▼"}
                </span>
              </button>

              {currencyOpen && (
                <div className="absolute right-0 z-30 mt-2 w-52 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                  {CURRENCIES.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => selectCurrency(item.code)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-gray-50 ${
                        selectedCurrency === item.code
                          ? "bg-gray-50 font-semibold text-brand-600"
                          : "text-gray-700"
                      }`}
                    >
                      <span className="text-lg">{item.flag}</span>

                      <span className="flex-1">
                        <span className="block">{item.code}</span>
                        <span className="block text-[11px] text-gray-400">
                          {item.name}
                        </span>
                      </span>

                      {selectedCurrency === item.code && (
                        <span className="text-brand-600">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {price && (
            <div className="text-xs text-gray-500 mt-2">
              Based on 1.0625g of gold · Gold:{" "}
              {formatPrice(price.gold_price_per_gram)} {selectedCurrency}/g
            </div>
          )}
        </div>

        {/* Notification Toggle */}
        <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4">
          <div>
            <div className="text-sm font-medium text-gray-900">
              Automatic price alerts
            </div>

            <div className="text-xs text-gray-500 mt-0.5">
              ON by default. Za ka iya kashe shi duk lokacin da kake so.
            </div>

            <div className="text-[11px] text-gray-400 mt-1">
              Alerts: {currentCurrency.flag} {selectedCurrency}
            </div>
          </div>

          <button
            type="button"
            onClick={toggleNotifications}
            disabled={saving || loading}
            aria-pressed={enabled}
            className={`relative w-12 h-7 rounded-full transition ${
              enabled ? "bg-brand-600" : "bg-gray-300"
            } disabled:opacity-50`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition ${
                enabled ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>

        {message && (
          <div className="mt-4 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-800">
            {message}
          </div>
        )}

        <p className="text-[11px] text-gray-400 mt-5 leading-relaxed">
          Notification permission na Android dole ne a ba app damar aika
          notifications. Server ne ke duba farashin; saboda haka app ba sai yana
          bude ba lokacin da farashin ya canza.
        </p>
      </div>
    </div>
  );
}
