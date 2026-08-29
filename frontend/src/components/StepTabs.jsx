import { useLang } from "../i18n/LanguageContext";

const STEPS = ["estate", "deductions", "wasiyyah", "heirs", "result"];

export default function StepTabs({ current }) {
  const { t } = useLang();
  const currentIndex = STEPS.indexOf(current);

  return (
    <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-1 border-b border-gray-100">
      {STEPS.map((step, i) => {
        const active = i === currentIndex;
        const done = i < currentIndex;
        return (
          <div
            key={step}
            className={`flex items-center gap-2 pb-3 shrink-0 border-b-2 -mb-px transition-colors ${
              active ? "border-brand-600" : "border-transparent"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                active
                  ? "bg-brand-600 text-white"
                  : done
                  ? "bg-brand-100 text-brand-700"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {done ? "✓" : i + 1}
            </span>
            <div className="leading-tight">
              <div className={`text-sm font-medium ${active ? "text-gray-900" : "text-gray-500"}`}>
                {t[`step_${step}`]}
              </div>
              <div className="text-[11px] text-gray-400">{t[`step_${step}_sub`]}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { STEPS };
