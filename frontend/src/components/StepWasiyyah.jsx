import { useLang } from "../i18n/LanguageContext";
import VoiceInputButton from "./VoiceInputButton";

export default function StepWasiyyah({ data, setData }) {
  const { t, lang } = useLang();
  const netEstate = Math.max((data.estate_amount || 0) - (data.funeral_cost || 0) - (data.debts || 0), 0);
  const cap = netEstate / 3;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">{t.wasiyyahTitle}</h2>
      <p className="text-sm text-gray-500 mt-1">{t.wasiyyahDesc}</p>

      <div className="mt-5">
        <label className="text-sm font-medium text-gray-700">{t.wasiyyahLabel}</label>
        <div className="mt-1.5 flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={data.wasiyyah_amount}
            onChange={(e) => setData({ ...data, wasiyyah_amount: Number(e.target.value) })}
            className="flex-1 min-w-0 rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="0"
          />
          <VoiceInputButton
            lang={lang}
            mode="number"
            onResult={(num) => setData({ ...data, wasiyyah_amount: num })}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          {t.wasiyyahHint} ({cap.toLocaleString()} {data.currency})
        </p>
      </div>
    </div>
  );
}
