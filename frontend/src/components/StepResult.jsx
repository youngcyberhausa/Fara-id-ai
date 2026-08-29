import { useLang } from "../i18n/LanguageContext";

export default function StepResult({ result, loading, error }) {
  const { t } = useLang();

  if (loading) {
    return <div className="py-10 text-center text-sm text-gray-400">…</div>;
  }
  if (error) {
    return (
      <div className="py-6 text-center text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
        {error}
      </div>
    );
  }
  if (!result) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">{t.resultTitle}</h2>
      <p className="text-sm text-gray-500 mt-1">{t.resultDesc}</p>

      {result.needs_scholar_review && (
        <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          ⚠ {t.scholarReviewWarning}
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
        <SummaryCard label={t.netEstate} value={result.net_estate} currency={result.currency} />
        <SummaryCard label={t.wasiyyahApplied} value={result.wasiyyah_applied} currency={result.currency} />
        <SummaryCard label={t.distributable} value={result.distributable_estate} currency={result.currency} highlight />
      </div>

      <div className="mt-6 space-y-2">
        {result.breakdown.map((b) => (
          <div
            key={b.heir_type}
            className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
          >
            <div>
              <div className="text-sm font-medium text-gray-800">
                {b.label} {b.count > 1 ? `× ${b.count}` : ""}
              </div>
              <div className="text-xs text-gray-400">
                {b.share_fraction} ({b.share_percent}%)
                {b.count > 1 ? ` — ${b.amount_per_person.toLocaleString()} ${result.currency} ${t.perPerson}` : ""}
              </div>
            </div>
            <div className="text-sm font-semibold text-brand-700">
              {b.amount_total.toLocaleString()} {result.currency}
            </div>
          </div>
        ))}
      </div>

      {result.notes?.length > 0 && (
        <div className="mt-6">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            {t.notesTitle}
          </div>
          <ul className="space-y-1.5">
            {result.notes.map((n, i) => (
              <li key={i} className="text-xs text-gray-500 bg-gray-50 rounded-md px-3 py-2">
                {n}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, currency, highlight }) {
  return (
    <div className={`rounded-lg border px-3 py-3 ${highlight ? "border-brand-300 bg-brand-50" : "border-gray-200"}`}>
      <div className="text-[11px] text-gray-400">{label}</div>
      <div className={`text-sm font-semibold mt-0.5 ${highlight ? "text-brand-700" : "text-gray-800"}`}>
        {Number(value).toLocaleString()} {currency}
      </div>
    </div>
  );
}
