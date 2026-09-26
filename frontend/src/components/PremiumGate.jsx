import { useLang } from "../i18n/LanguageContext";

export default function PremiumGate({ title, description, onBack, onUpgrade }) {
  const { t } = useLang();

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <button
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1"
      >
        ← {t.back || "Back"}
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4 text-2xl">
          🔒
        </div>

        <span className="inline-block text-xs font-semibold tracking-wide uppercase bg-amber-100 text-amber-700 rounded-full px-3 py-1 mb-3">
          {t.premBadge || "Premium"}
        </span>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {title}
        </h2>

        {description && (
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            {description}
          </p>
        )}

        <button
          onClick={onUpgrade}
          className="w-full rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 transition-colors"
        >
          {t.tilePremium || "Go Premium"}
        </button>
      </div>
    </div>
  );
}
