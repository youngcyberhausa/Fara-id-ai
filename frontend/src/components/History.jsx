import { useState, useEffect, useMemo } from "react";
import { useLang } from "../i18n/LanguageContext";
import { api } from "../api";
import StepResult from "./StepResult";

export default function History({ initialQuery = "", onBack, onNewCase }) {
  const { t } = useLang();
  const [cases, setCases] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(initialQuery);
  const [openCase, setOpenCase] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listCases()
      .then((data) => {
        if (!cancelled) setCases(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!cases) return [];
    const q = query.trim().toLowerCase();
    if (!q) return cases;
    return cases.filter((c) => (c.title || "").toLowerCase().includes(q));
  }, [cases, query]);

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await api.deleteCase(id);
      setCases((prev) => prev.filter((c) => c.id !== id));
      if (openCase?.id === id) setOpenCase(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  }

  if (openCase) {
    return (
      <div>
        <button
          onClick={() => setOpenCase(null)}
          className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1.5 mb-4"
        >
          ← {t.back}
        </button>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <h2 className="text-base font-semibold text-gray-900">
            {openCase.title || t.caseTitleLabel}
          </h2>
          <StepResult result={openCase.result} loading={false} error={null} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1.5">
          ← {t.back}
        </button>
        <button
          onClick={onNewCase}
          className="text-sm bg-brand-600 text-white rounded-lg px-3.5 py-1.5 hover:bg-brand-700"
        >
          + {t.newCaseBtn}
        </button>
      </div>

      <h1 className="text-lg font-semibold text-gray-900">{t.historyTitle}</h1>

      <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm mt-3 focus-within:ring-2 focus-within:ring-brand-300">
        <span className="text-gray-400">⌕</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="flex-1 text-sm outline-none placeholder:text-gray-400"
        />
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-4">
          {error}
        </div>
      )}

      {cases === null && !error && (
        <div className="text-sm text-gray-400 text-center py-10">…</div>
      )}

      {cases !== null && filtered.length === 0 && (
        <div className="text-sm text-gray-400 text-center py-10">{t.noCasesYet}</div>
      )}

      <div className="mt-4 space-y-2">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between hover:border-brand-200 transition"
          >
            <button onClick={() => setOpenCase(c)} className="text-left flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {c.title || t.caseTitleLabel}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                {c.estate_amount?.toLocaleString()} {c.currency}
              </div>
            </button>
            <button
              onClick={() => handleDelete(c.id)}
              disabled={deletingId === c.id}
              className="text-xs text-red-500 hover:text-red-700 px-2 py-1 disabled:opacity-40"
            >
              {deletingId === c.id ? "…" : "✕"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
