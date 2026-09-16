import { useState, useEffect, useMemo } from "react";
import { useLang } from "../i18n/LanguageContext";
import { useAuth } from "../AuthContext";
import { api } from "../api";
import Logo from "./Logo";

function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(d) {
  return d.toLocaleDateString(undefined, { month: "short" });
}

export default function Dashboard({ onHome, onHistory, onNewCase, onZakat, onMenu }) {
  const { t } = useLang();
  const { user } = useAuth();
  const [cases, setCases] = useState(null);
  const [error, setError] = useState(null);

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

  const stats = useMemo(() => {
    if (!cases) return null;

    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: monthKey(d), label: monthLabel(d), count: 0 });
    }
    const monthMap = Object.fromEntries(months.map((m) => [m.key, m]));

    let thisMonthCount = 0;
    let totalDistributed = 0;
    const thisMonthKey = monthKey(now);

    cases.forEach((c) => {
      const created = new Date(c.created_at || Date.now());
      const key = monthKey(created);
      if (monthMap[key]) monthMap[key].count += 1;
      if (key === thisMonthKey) thisMonthCount += 1;
      totalDistributed += c.result?.distributable_estate || 0;
    });

    const maxCount = Math.max(1, ...months.map((m) => m.count));
    const totalCases = cases.length;
    const monthPercent = totalCases > 0 ? Math.round((thisMonthCount / totalCases) * 100) : 0;

    return { months, maxCount, totalCases, thisMonthCount, monthPercent, totalDistributed };
  }, [cases]);

  const recent = cases ? cases.slice(0, 4) : [];

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col z-30">
      <div className="bg-gradient-to-br from-brand-700 to-brand-600 px-4 pt-5 pb-8 rounded-b-3xl shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={30} />
            <span className="text-white font-semibold text-sm">{t.appName}</span>
          </div>
          <button
            onClick={onMenu}
            aria-label="Menu"
            className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white"
          >
            ☰
          </button>
        </div>
        <div className="mt-4">
          <div className="text-white/80 text-xs">{t.welcomeBack}</div>
          <div className="text-white text-lg font-semibold">{user?.email || t.appName}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 -mt-5 pb-24">
        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col items-center">
            <svg viewBox="0 0 80 80" className="w-20 h-20">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#ecfdf3" strokeWidth="10" />
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke="#0f7a3b"
                strokeWidth="10"
                strokeDasharray={`${((stats?.monthPercent || 0) / 100) * 201} 201`}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
              />
              <text x="40" y="45" textAnchor="middle" fontSize="16" fontWeight="700" fill="#0c5f2f">
                {stats ? `${stats.monthPercent}%` : "…"}
              </text>
            </svg>
            <div className="text-[11px] text-gray-400 mt-1 text-center">{t.dashboardThisMonth}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="text-[11px] text-gray-400 mb-2">{t.dashboardTrend}</div>
            <svg viewBox="0 0 120 60" className="w-full h-16">
              {stats?.months.map((m, i) => {
                const barW = 120 / stats.months.length - 4;
                const barH = (m.count / stats.maxCount) * 44;
                const x = i * (120 / stats.months.length) + 2;
                return (
                  <rect
                    key={m.key}
                    x={x}
                    y={54 - barH}
                    width={barW}
                    height={Math.max(barH, 2)}
                    rx="2"
                    fill={i === stats.months.length - 1 ? "#0f7a3b" : "#a7f3c8"}
                  />
                );
              })}
            </svg>
            <div className="flex justify-between text-[9px] text-gray-400 mt-1">
              {stats?.months.map((m) => (
                <span key={m.key}>{m.label}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="text-[11px] text-gray-400">{t.tileHistory}</div>
            <div className="text-xl font-bold text-brand-700 mt-0.5">{stats ? stats.totalCases : "…"}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="text-[11px] text-gray-400">{t.distributable}</div>
            <div className="text-sm font-bold text-brand-700 mt-0.5 truncate">
              {stats ? stats.totalDistributed.toLocaleString() : "…"}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            {t.dashboardRecent}
          </div>
          {recent.length === 0 && cases !== null && (
            <div className="text-sm text-gray-400 text-center py-6">{t.noCasesYet}</div>
          )}
          <div className="space-y-2">
            {recent.map((c) => (
              <button
                key={c.id}
                onClick={onHistory}
                className="w-full bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between text-left"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {c.title || t.caseTitleLabel}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {c.estate_amount?.toLocaleString()} {c.currency}
                  </div>
                </div>
                <span className="text-gray-300">›</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="shrink-0 bg-white border-t border-gray-100 px-2 pb-safe pt-2 flex items-center justify-around">
        <button onClick={onHome} className="flex flex-col items-center gap-0.5 px-3 py-1 text-brand-700">
          <span className="text-lg">🏠</span>
          <span className="text-[10px]">Home</span>
        </button>
        <button onClick={onHistory} className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-400">
          <span className="text-lg">⏱</span>
          <span className="text-[10px]">{t.tileHistory}</span>
        </button>
        <button
          onClick={onNewCase}
          className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center text-2xl -mt-4 shadow-lg"
          aria-label="New case"
        >
          +
        </button>
        <button onClick={onZakat} className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-400">
          <span className="text-lg">🕌</span>
          <span className="text-[10px]">Zakat</span>
        </button>
        <button onClick={onMenu} className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-400">
          <span className="text-lg">☰</span>
          <span className="text-[10px]">Menu</span>
        </button>
      </div>
    </div>
  );
}
