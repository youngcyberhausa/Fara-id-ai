import { useLang } from "../i18n/LanguageContext";

const CURRENCIES = ["NGN", "USD", "GBP", "EUR", "SAR", "GHS"];

export default function StepEstate({ data, setData }) {
  const { t } = useLang();
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">{t.estateTitle}</h2>
      <p className="text-sm text-gray-500 mt-1">{t.estateDesc}</p>

      <div className="mt-5">
        <label className="text-sm font-medium text-gray-700">{t.estateAmountLabel}</label>
        <div className="mt-1.5 flex rounded-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-brand-500">
          <input
            type="number"
            min="0"
            value={data.estate_amount}
            onChange={(e) => setData({ ...data, estate_amount: Number(e.target.value) })}
            className="flex-1 px-4 py-3 text-sm outline-none"
            placeholder="0"
          />
          <select
            value={data.currency}
            onChange={(e) => setData({ ...data, currency: e.target.value })}
            className="bg-gray-50 text-sm text-gray-500 px-3 border-l border-gray-200 outline-none"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5">
        <label className="text-sm font-medium text-gray-700">{t.caseTitleLabel}</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          className="mt-1.5 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div className="mt-5 bg-brand-50 border border-brand-100 rounded-lg px-4 py-3 text-sm text-brand-800">
        {t.estateInfo}
      </div>
    </div>
  );
}
