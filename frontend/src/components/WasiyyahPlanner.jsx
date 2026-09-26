import { useEffect, useMemo, useState } from "react";
import { useLang } from "../i18n/LanguageContext";

const KEY = "faraid_wasiyyah_planner_v1";
const blank = { name: "", executor: "", beneficiaries: "", notes: "" };

export default function WasiyyahPlanner({ onBack }) {
  const { t } = useLang();
  const [data, setData] = useState(() => {
    try { return { ...blank, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return blank; }
  });
  const [saved, setSaved] = useState(false);
  useEffect(() => localStorage.setItem(KEY, JSON.stringify(data)), [data]);
  const complete = useMemo(
    () => [data.name, data.executor, data.beneficiaries].filter(Boolean).length,
    [data]
  );
  const set = (k, v) => { setData((d) => ({ ...d, [k]: v })); setSaved(false); };
  function save() { localStorage.setItem(KEY, JSON.stringify(data)); setSaved(true); }
  function clear() { if (window.confirm(t.wpClearConfirm)) setData(blank); }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="text-sm text-brand-600 hover:underline mb-3">← {t.back || "Back"}</button>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="text-2xl">📜</div>
        <h2 className="text-xl font-bold text-gray-900 mt-1">{t.wpTitle}</h2>
        <p className="text-sm text-gray-500 mt-1">{t.wpDesc}</p>
        <div className="mt-4 h-2 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full bg-brand-600" style={{ width: `${(complete / 3) * 100}%` }} />
        </div>
        <div className="text-xs text-gray-400 mt-1">{complete}/3 {t.wpSectionsDone}</div>

        <Field label={t.wpFullName} value={data.name} onChange={(v) => set("name", v)} />
        <Field label={t.wpExecutor} value={data.executor} onChange={(v) => set("executor", v)} />
        <Field label={t.wpBeneficiaries} value={data.beneficiaries} onChange={(v) => set("beneficiaries", v)} />

        <label className="block mt-4">
          <span className="text-sm font-medium text-gray-700">{t.wpNotes}</span>
          <textarea
            value={data.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows="5"
            className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            placeholder={t.wpNotesPlaceholder}
          />
        </label>

        <button onClick={save} className="w-full mt-4 rounded-xl bg-brand-600 text-white py-3 text-sm font-semibold">
          {saved ? t.wpSaved : t.wpSave}
        </button>
        <button onClick={clear} className="w-full mt-3 text-xs text-red-500">{t.wpClear}</button>

        <div className="mt-5 rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-800">
          {t.wpFooterNote}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="block mt-4">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
      />
    </label>
  );
}
