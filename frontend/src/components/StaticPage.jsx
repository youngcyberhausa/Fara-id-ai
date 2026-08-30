import { useLang } from "../i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

export default function StaticPage({ title, updated, children, onBack }) {
  const { t } = useLang();
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1.5"
          >
            ← {t.backToApp}
          </button>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {updated && <p className="text-xs text-gray-400 mt-1">{updated}</p>}
          <div className="mt-5 prose prose-sm max-w-none text-gray-700 space-y-4 leading-relaxed">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
