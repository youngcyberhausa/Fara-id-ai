import { useEffect, useMemo, useState } from "react";
import { useLang } from "../i18n/LanguageContext";

const KEY = "faraid_wealth_tracker_v1";
const initial = { cash: "", gold: "", silver: "", business: "", investments: "", debts: "" };

export default function WealthTracker({ onBack, onZakat }) {
  const { t } = useLang();
  const [data, setData] = useState(() => {
    try { return { ...initial, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return initial; }
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(data)); }, [data]);
  const total = useMemo(
    () => Object.values(data).reduce((s, v) => s + (Number(v) || 0), 0) - (Number(data.debts) || 0),
    [data]
  );
  const set = (key, value) => { setData((d) => ({ ...d, [key]: value })); setSaved(false); };

  function save() { localStorage.setItem(KEY, JSON.stringify(data)); setSaved(true); }
  function clear() { if (window.confirm(t.wealthClearConfirm)) setData(initial); }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="text-sm text-brand-600 hover:underline mb-3">← {t.back || "Back"}</button>
      <div className="bg-gradient-to-br from-brand-700 to-brand-600 text-white rounded-2xl p-5 shadow-sm">
        <div className="text-xs text-white/70 uppercase tracking-wide">{t.appName}</div>
        <h2 className="text-xl font-bold mt-1">💰 {t.wealthTitle}</h2>
        <p className="text-xs text-white/75 mt-1">{t.wealthDesc}</p>
        <div className="mt-5 text-3xl font-bold">
          {Math.max(0, total).toLocaleString()} <span className="text-sm font-medium">NGN</span>
        </div>
        <div className="text-xs text-white/70 mt-1">{t.wealthEstimatedNet}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <Field label={t.wealthCash} value={data.cash} onChange={(v) => set("cash", v)} />
        <Field label={t.wealthGold} value={data.gold} onChange={(v) => set("gold", v)} />
        <Field label={t.wealthSilver} value={data.silver} onChange={(v) => set("silver", v)} />
        <Field label={t.wealthBusiness} value={data.business} onChange={(v) => set("business", v)} />
        <Field label={t.wealthInvestments} value={data.investments} onChange={(v) => set("investments", v)} />
        <Field label={t.wealthDebts} value={data.debts} onChange={(v) => set("debts", v)} />
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={save} className="flex-1 rounded-xl bg-brand-600 text-white py-3 text-sm font-semibold">
          {saved ? t.wealthSaved : t.wealthSave}
        </button>
        <button onClick={onZakat} className="flex-1 rounded-xl border border-brand-200 text-brand-700 bg-white py-3 text-sm font-semibold">
          {t.wealthReviewZakat}
        </button>
      </div>
      <button onClick={clear} className="w-full mt-3 text-xs text-red-500">{t.wealthClear}</button>
      <p className="text-[11px] text-gray-400 mt-5 text-center">{t.wealthFooterNote}</p>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="block bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
      <span className="text-xs text-gray-500">{label}</span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full outline-none text-sm font-semibold text-gray-900"
        placeholder="0"
      />
    </label>
  );
}
