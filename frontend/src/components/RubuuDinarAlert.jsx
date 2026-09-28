import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { notificationsApi, rubuuDinarApi } from "../api";
import {
  disablePushNotifications,
  isNativePushSupported,
  setupPushNotifications,
} from "../pushNotifications";

export default function RubuuDinarAlert({ onBack }) {
  const { user, refreshUser } = useAuth();
  const [price, setPrice] = useState(null);
  const [enabled, setEnabled] = useState(Boolean(user?.push_notifications_enabled));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      rubuuDinarApi.getCurrent(),
      notificationsApi.getPreferences(),
    ])
      .then(([current, prefs]) => {
        if (cancelled) return;
        setPrice(current);
        setEnabled(Boolean(prefs.enabled));
      })
      .catch(() => {
        if (!cancelled) setMessage("An samu matsala wajen samun farashin yanzu.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleNotifications() {
    const next = !enabled;
    setSaving(true);
    setMessage(null);

    try {
      if (next) {
        if (!isNativePushSupported()) {
          setMessage("Push alerts suna aiki a Android app; ba browser version ba.");
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

        await notificationsApi.updatePreferences(true);
        setEnabled(true);
      } else {
        await notificationsApi.updatePreferences(false);
        await disablePushNotifications();
        setEnabled(false);
      }

      await refreshUser();
    } catch (error) {
      setMessage(error.message || "An samu matsala wajen canza notification setting.");
    } finally {
      setSaving(false);
    }
  }

  function formatPrice(value) {
    return `${Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${price?.currency || "NGN"}`;
  }

  return (
    <div className="max-w-xl mx-auto">
      <button onClick={onBack} className="text-sm text-brand-600 hover:underline mb-4">
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

        <div className="mt-6 rounded-xl bg-gray-50 border border-gray-100 p-5">
          <div className="text-xs text-gray-500">Current Rubu'u Dinar</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">
            {loading ? "…" : price ? formatPrice(price.rubuu_dinar_price) : "—"}
          </div>
          {price && (
            <div className="text-xs text-gray-500 mt-2">
              Based on 1.0625g of gold · Gold: {formatPrice(price.gold_price_per_gram)}/g
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4">
          <div>
            <div className="text-sm font-medium text-gray-900">Automatic price alerts</div>
            <div className="text-xs text-gray-500 mt-0.5">
              ON by default. Za ka iya kashe shi duk lokacin da kake so.
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
