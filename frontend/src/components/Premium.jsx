import { useState, useEffect } from "react";
import { useLang } from "../i18n/LanguageContext";
import { useAuth } from "../AuthContext";
import { paymentsApi } from "../api";

export default function Premium({ onBack }) {
  const { t } = useLang();
  const { user, refreshUser } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // If Paystack just redirected back here with a reference, verify it.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");
    if (!reference) return;

    setVerifying(true);
    paymentsApi
      .verify(reference)
      .then(async () => {
        await refreshUser();
      })
      .catch(() => {})
      .finally(() => {
        setVerifying(false);
        window.history.replaceState({}, "", window.location.pathname);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleUpgrade() {
    setError(null);
    setBusy(true);
    try {
      const res = await paymentsApi.initialize();
      window.location.href = res.authorization_url;
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  const isPremium =
    user?.is_premium && (!user.premium_expires_at || new Date(user.premium_expires_at) > new Date());

  const features = [
    { icon: "📄", title: t.premFeaturePdf, desc: t.premFeaturePdfDesc },
    { icon: "🤖", title: t.premFeatureAi, desc: t.premFeatureAiDesc },
    { icon: "🚫", title: t.premFeatureAds, desc: t.premFeatureAdsDesc },
    { icon: "🕌", title: t.premFeatureZakat, desc: t.premFeatureZakatDesc },
    { icon: "👨‍👩‍👧", title: t.premFeatureFamily, desc: t.premFeatureFamilyDesc },
    { icon: "⚖️", title: t.premFeatureComplex, desc: t.premFeatureComplexDesc },
  ];

  return (
    <div>
      <button onClick={onBack} className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1.5 mb-4">
        ← {t.back}
      </button>

      {verifying && (
        <div className="bg-blue-50 border border-blue-100 text-blue-700 text-sm rounded-lg px-4 py-3 mb-4">
          {t.premVerifying}
        </div>
      )}

      {isPremium ? (
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white mb-5">
          <div className="text-2xl">👑</div>
          <h1 className="text-lg font-bold mt-2">{t.premActiveTitle}</h1>
          <p className="text-sm text-white/85 mt-1">
            {t.premActiveDesc}{" "}
            {user.premium_expires_at &&
              new Date(user.premium_expires_at).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-brand-700 to-brand-600 rounded-2xl p-6 text-white mb-5">
          <span className="inline-block text-[10px] font-semibold tracking-wide bg-white/15 rounded-full px-2.5 py-1 mb-3">
            ⭐ {t.premBadge}
          </span>
          <h1 className="text-xl font-bold leading-snug">{t.premTitle}</h1>
          <p className="text-sm text-white/85 mt-2">{t.premSubtitle}</p>
        </div>
      )}

      <div className="space-y-2.5 mb-5">
        {features.map((f, i) => (
          <div key={i} className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
            <div className="text-xl shrink-0">{f.icon}</div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{f.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {!isPremium && (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <div className="text-3xl font-bold text-gray-900">
              ₦1,500<span className="text-sm font-normal text-gray-400">/{t.premPerMonth}</span>
            </div>
            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-3">
                {error}
              </div>
            )}
            <button
              onClick={handleUpgrade}
              disabled={busy}
              className="w-full mt-4 py-3 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
            >
              {busy ? "…" : t.premUpgradeBtn}
            </button>
            <p className="text-[11px] text-gray-400 mt-3">{t.premSecureNote}</p>
          </div>
        </>
      )}
    </div>
  );
}
