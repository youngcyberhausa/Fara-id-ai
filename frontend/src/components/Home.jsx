import { useState } from "react";
import { useLang } from "../i18n/LanguageContext";

export default function Home({ onNewCase, onHistory, onLearn, onSearch }) {
  const { t } = useLang();
  const [query, setQuery] = useState("");

  function submitSearch(e) {
    e.preventDefault();
    onSearch(query.trim());
  }

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-700 to-brand-600 rounded-2xl p-6 text-white">
        <span className="inline-block text-[10px] font-semibold tracking-wide bg-white/15 rounded-full px-2.5 py-1 mb-3">
          ◆ {t.scholarAligned}
        </span>
        <h1 className="text-2xl font-bold leading-snug">{t.heroTitle}</h1>
        <p className="text-sm text-white/85 mt-2 leading-relaxed">{t.heroSubtitle}</p>
      </div>

      {/* Search */}
      <form onSubmit={submitSearch} className="mt-5">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-brand-300">
          <span className="text-gray-400">⌕</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="flex-1 text-sm outline-none placeholder:text-gray-400"
          />
          <button
            type="submit"
            className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm hover:bg-brand-700"
          >
            →
          </button>
        </div>
      </form>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mt-5">
        <button
          onClick={onNewCase}
          className="text-left bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-brand-200 transition"
        >
          <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center text-lg mb-2">
            ✚
          </div>
          <div className="text-sm font-semibold text-gray-900">{t.tileNewCase}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">{t.tileNewCaseDesc}</div>
        </button>

        <button
          onClick={onHistory}
          className="text-left bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-brand-200 transition"
        >
          <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center text-lg mb-2">
            ⏱
          </div>
          <div className="text-sm font-semibold text-gray-900">{t.tileHistory}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">{t.tileHistoryDesc}</div>
        </button>

        <button
          onClick={onLearn}
          className="text-left bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-brand-200 transition"
        >
          <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center text-lg mb-2">
            📖
          </div>
          <div className="text-sm font-semibold text-gray-900">{t.tileEvidence}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">{t.tileEvidenceDesc}</div>
        </button>

        <button
          onClick={onLearn}
          className="text-left bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-brand-200 transition"
        >
          <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center text-lg mb-2">
            🎓
          </div>
          <div className="text-sm font-semibold text-gray-900">{t.tileLearn}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">{t.tileLearnDesc}</div>
        </button>
      </div>
    </div>
  );
}
