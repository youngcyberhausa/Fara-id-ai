import { useEffect, useMemo, useState } from "react";

const KEY = "faraid_wealth_tracker_v1";
const initial = { cash: "", gold: "", silver: "", business: "", investments: "", debts: "" };

export default function WealthTracker({ onBack, onZakat }) {
  const [data, setData] = useState(() => {
    try { return { ...initial, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return initial; }
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(data)); }, [data]);
  const total = useMemo(() => Object.values(data).reduce((s, v) => s + (Number(v) || 0), 0) - (Number(data.debts) || 0), [data]);
  const set = (key, value) => { setData((d) => ({ ...d, [key]: value })); setSaved(false); };

  function save() { localStorage.setItem(KEY, JSON.stringify(data)); setSaved(true); }
  function clear() { if (window.confirm("Clear your saved wealth data?")) setData(initial); }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="text-sm text-brand-600 hover:underline mb-3">← Back</button>
      <div className="bg-gradient-to-br from-brand-700 to-brand-600 text-white rounded-2xl p-5 shadow-sm">
        <div className="text-xs text-white/70 uppercase tracking-wide">Fara'id AI</div>
        <h2 className="text-xl font-bold mt-1">💰 Wealth Tracker</h2>
        <p className="text-xs text-white/75 mt-1">Keep your Islamic wealth information ready for Zakat review.</p>
        <div className="mt-5 text-3xl font-bold">{Math.max(0, total).toLocaleString()} <span className="text-sm font-medium">NGN</span></div>
        <div className="text-xs text-white/70 mt-1">Estimated net wealth</div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <Field label="Cash & bank" value={data.cash} onChange={(v) => set("cash", v)} />
        <Field label="Gold value" value={data.gold} onChange={(v) => set("gold", v)} />
        <Field label="Silver value" value={data.silver} onChange={(v) => set("silver", v)} />
        <Field label="Business stock" value={data.business} onChange={(v) => set("business", v)} />
        <Field label="Investments" value={data.investments} onChange={(v) => set("investments", v)} />
        <Field label="Debts owed" value={data.debts} onChange={(v) => set("debts", v)} />
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={save} className="flex-1 rounded-xl bg-brand-600 text-white py-3 text-sm font-semibold">{saved ? "✓ Saved" : "Save wealth"}</button>
        <button onClick={onZakat} className="flex-1 rounded-xl border border-brand-200 text-brand-700 bg-white py-3 text-sm font-semibold">🕌 Review Zakat</button>
      </div>
      <button onClick={clear} className="w-full mt-3 text-xs text-red-500">Clear saved data</button>
      <p className="text-[11px] text-gray-400 mt-5 text-center">Stored on this device for now. This tracker is a planning tool, not a final Zakat ruling.</p>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return <label className="block bg-white rounded-xl border border-gray-100 p-3 shadow-sm"><span className="text-xs text-gray-500">{label}</span><input type="number" min="0" value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full outline-none text-sm font-semibold text-gray-900" placeholder="0" /></label>;
}
