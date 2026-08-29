import { useLang } from "../i18n/LanguageContext";

export default function StepWasiyyah({ data, setData }) {
  const { t } = useLang();
  const netEstate = Math.max((data.estate_amount || 0) - (data.funeral_cost || 0) - (data.debts || 0), 0);
  const cap = netEstate / 3;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">{t.wasiyyahTitle}</h2>
      <p className="text-sm text-gray-500 mt-1">{t.wasiyyahDesc}</p>

      <div className="mt-5">
        <label className="text-sm font-medium text-gray-700">{t.wasiyyahLabel}</label>
        <input
          type="number"
          min="0"
          value={data.wasiyyah_amount}
          onChange={(e) => setData({ ...data, wasiyyah_amount: Number(e.target.value) })}
          className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="0"
        />
        <p className="text-xs text-gray-400 mt-1.5">
          {t.wasiyyahHint} ({cap.toLocaleString()} {data.currency})
        </p>
      </div>
    </div>
  );
}
