import { lazy, Suspense } from "react";
import { useLang } from "../i18n/LanguageContext";
import { exportResultPdf, exportResultDocx } from "../reportExport";

const Distribution3DChart = lazy(() => import("./Distribution3DChart"));

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
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{t.resultTitle}</h2>
          <p className="text-sm text-gray-500 mt-1">{t.resultDesc}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => exportResultPdf(result)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1"
            title="Download PDF"
          >
            📄 PDF
          </button>
          <button
            onClick={() => exportResultDocx(result)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1"
            title="Download Word"
          >
            📝 Word
          </button>
        </div>
      </div>

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

      {result.breakdown?.length > 0 && (
        <Suspense
          fallback={
            <div className="mt-6 h-[240px] rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-xs text-gray-400">
              …
            </div>
          }
        >
          <Distribution3DChart breakdown={result.breakdown} currency={result.currency} />
        </Suspense>
      )}

      <div className="mt-6 space-y-2">
        {result.breakdown.map((b) => (
          <div
            key={b.heir_type}
            className="rounded-lg border border-gray-200 px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-800">
                  {t.heirs?.[b.heir_type] || b.label} {b.count > 1 ? `× ${b.count}` : ""}
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
            {t.evidence?.[b.heir_type] && (
              <div className="mt-2 pt-2 border-t border-gray-100 text-[11px] text-gray-500 flex gap-1.5">
                <span aria-hidden="true">📖</span>
                <span>{t.evidence[b.heir_type]}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {t.evidenceGeneral && (
        <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
          <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-1.5">
            {t.evidenceTitle}
          </div>
          {t.evidenceIntro && (
            <div className="text-xs text-emerald-700 mb-2">{t.evidenceIntro}</div>
          )}
          <p className="text-xs text-emerald-800 leading-relaxed">{t.evidenceGeneral}</p>
        </div>
      )}

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
