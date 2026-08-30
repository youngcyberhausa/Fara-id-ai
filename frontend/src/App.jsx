import { useState } from "react";
import { LanguageProvider, useLang } from "./i18n/LanguageContext";
import { useAuth } from "./AuthContext";
import LanguageSwitcher from "./components/LanguageSwitcher";
import IslamicWatermark from "./components/IslamicWatermark";
import Login from "./components/Login";
import StepTabs, { STEPS } from "./components/StepTabs";
import StepEstate from "./components/StepEstate";
import StepDeductions from "./components/StepDeductions";
import StepWasiyyah from "./components/StepWasiyyah";
import StepHeirs from "./components/StepHeirs";
import StepResult from "./components/StepResult";
import { api } from "./api";

function AppInner() {
  const { t } = useLang();
  const { user, loading: authLoading, logout } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState({
    title: "",
    estate_amount: 0,
    currency: "NGN",
    funeral_cost: 0,
    debts: 0,
    wasiyyah_amount: 0,
  });
  const [heirs, setHeirs] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedId, setSavedId] = useState(null);
  const [saving, setSaving] = useState(false);

  const step = STEPS[stepIndex];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
        {t.loadingAuth}
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  async function goNext() {
    if (step === "heirs") {
      setStepIndex(stepIndex + 1);
      setLoading(true);
      setError(null);
      try {
        const payload = { ...data, heirs };
        const res = await api.calculate(payload);
        setResult(res);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
      return;
    }
    setStepIndex(Math.min(stepIndex + 1, STEPS.length - 1));
  }

  function goBack() {
    setStepIndex(Math.max(stepIndex - 1, 0));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = { ...data, heirs };
      const res = await api.createCase(payload);
      setSavedId(res.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  function handleNewCase() {
    setData({
      title: "",
      estate_amount: 0,
      currency: "NGN",
      funeral_cost: 0,
      debts: 0,
      wasiyyah_amount: 0,
    });
    setHeirs([]);
    setResult(null);
    setSavedId(null);
    setStepIndex(0);
  }

  return (
    <div className="min-h-screen relative">
      <IslamicWatermark />

      {/* Header */}
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-700 text-white flex items-center justify-center font-bold text-sm">
              F
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 leading-tight">{t.appName}</div>
              <div className="text-[11px] text-gray-400 leading-tight">{t.tagline}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {user && (
              <button
                onClick={logout}
                className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5"
              >
                {t.logout}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Hero */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 bg-gradient-to-br from-brand-700 to-brand-600 rounded-2xl p-6 text-white">
            <span className="inline-block text-[10px] font-semibold tracking-wide bg-white/15 rounded-full px-2.5 py-1 mb-3">
              ◆ {t.scholarAligned}
            </span>
            <h1 className="text-2xl font-bold leading-snug">{t.heroTitle}</h1>
            <p className="text-sm text-white/85 mt-2 leading-relaxed">{t.heroSubtitle}</p>
          </div>
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center gap-2 text-sm font-semibold text-brand-700">
              <span>✓</span> {t.scholarBadge}
            </div>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">{t.scholarDesc}</p>
          </div>
        </div>

        {/* Wizard card */}
        <div className="mt-5 bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">{t.newCase}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{t.newCaseDesc}</p>

          <div className="mt-4">
            <StepTabs current={step} />
          </div>

          <div className="mt-6 min-h-[280px]">
            {step === "estate" && <StepEstate data={data} setData={setData} />}
            {step === "deductions" && <StepDeductions data={data} setData={setData} />}
            {step === "wasiyyah" && <StepWasiyyah data={data} setData={setData} />}
            {step === "heirs" && <StepHeirs heirs={heirs} setHeirs={setHeirs} />}
            {step === "result" && <StepResult result={result} loading={loading} error={error} />}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
            <button
              onClick={goBack}
              disabled={stepIndex === 0}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50"
            >
              ← {t.back}
            </button>

            {step !== "result" ? (
              <button
                onClick={goNext}
                className="px-5 py-2 text-sm rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700"
              >
                {step === "heirs" ? t.calculate : t.next} →
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleNewCase}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  {t.newCaseBtn}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !!savedId}
                  className="px-5 py-2 text-sm rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-50"
                >
                  {savedId ? "✓" : saving ? "…" : t.saveCase}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-[11px] text-gray-400 mt-8 pb-6">
          {t.appName} · {t.tagline} · {t.scholarBadge}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}
