import { useLang } from "../i18n/LanguageContext";
import VoiceInputButton from "./VoiceInputButton";

export default function StepDeductions({ data, setData }) {
  const { t, lang } = useLang();
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">{t.deductionsTitle}</h2>
      <p className="text-sm text-gray-500 mt-1">{t.deductionsDesc}</p>

      <div className="mt-5 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">{t.funeralLabel}</label>
          <div className="mt-1.5 flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={data.funeral_cost}
              onChange={(e) => setData({ ...data, funeral_cost: Number(e.target.value) })}
              className="flex-1 min-w-0 rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="0"
            />
            <VoiceInputButton
              lang={lang}
              mode="number"
              onResult={(num) => setData({ ...data, funeral_cost: num })}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">{t.debtsLabel}</label>
          <div className="mt-1.5 flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={data.debts}
              onChange={(e) => setData({ ...data, debts: Number(e.target.value) })}
              className="flex-1 min-w-0 rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="0"
            />
            <VoiceInputButton
              lang={lang}
              mode="number"
              onResult={(num) => setData({ ...data, debts: num })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
