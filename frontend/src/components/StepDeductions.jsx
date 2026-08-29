import { useLang } from "../i18n/LanguageContext";

export default function StepDeductions({ data, setData }) {
  const { t } = useLang();
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">{t.deductionsTitle}</h2>
      <p className="text-sm text-gray-500 mt-1">{t.deductionsDesc}</p>

      <div className="mt-5 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">{t.funeralLabel}</label>
          <input
            type="number"
            min="0"
            value={data.funeral_cost}
            onChange={(e) => setData({ ...data, funeral_cost: Number(e.target.value) })}
            className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="0"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">{t.debtsLabel}</label>
          <input
            type="number"
            min="0"
            value={data.debts}
            onChange={(e) => setData({ ...data, debts: Number(e.target.value) })}
            className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
}
