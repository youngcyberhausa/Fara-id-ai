import { useState, useEffect } from "react";
import { useLang } from "../i18n/LanguageContext";
import { useAuth } from "../AuthContext";
import { api } from "../api";

export default function Home({ onNewCase, onHistory, onLearn, onRelations, onSearch }) {
  const { t } = useLang();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [caseCount, setCaseCount] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listCases()
      .then((data) => {
        if (!cancelled) setCaseCount(data.length);
      })
      .catch(() => {
        if (!cancelled) setCaseCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function submitSearch(e) {
    e.preventDefault();
    onSearch(query.trim());
  }

  return (
    <div>
      {/* Welcome */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-lg font-semibold text-gray-900">
            {t.welcomeBack} 👋
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{user?.email}</div>
        </div>
        {caseCount !== null && (
          <button
            onClick={onHistory}
            className="text-center bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm hover:border-brand-200"
          >
            <div className="text-lg font-bold text-brand-700 leading-none">{caseCount}</div>
            <div className="text-[10px] text-gray-400 mt-1">{t.tileHistory}</div>
          </button>
        )}
      </div>

      {/* Android download banner */}
      <a
        href="https://github.com/youngcyberhausa/Fara-id-ai/releases/download/latest/app-release.apk"
        className="flex items-center gap-3 bg-gray-900 text-white rounded-2xl px-4 py-3.5 mb-4 hover:bg-gray-800 transition"
      >
        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-lg shrink-0">
          📱
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">{t.downloadAndroid}</div>
          <div className="text-[11px] text-white/60 truncate">{t.downloadAndroidDesc}</div>
        </div>
        <div className="text-xs font-medium bg-white/15 rounded-full px-3 py-1.5 shrink-0">
          {t.downloadBtn}
        </div>
      </a>

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
          onClick={onRelations}
          className="col-span-2 text-left bg-gradient-to-r from-brand-700 to-brand-600 rounded-2xl p-4 shadow-sm hover:shadow-md transition text-white flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center text-lg shrink-0">
            🌐
          </div>
          <div>
            <div className="text-sm font-semibold">{t.tileRelations}</div>
            <div className="text-[11px] text-white/75 mt-0.5">{t.tileRelationsDesc}</div>
          </div>
        </button>

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
