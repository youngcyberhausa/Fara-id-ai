import { useLang } from "../i18n/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, setLang, languages } = useLang();

  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      className="w-[110px] sm:w-[125px] min-w-0 text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 truncate"
      aria-label="Language"
    >
      {languages.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
