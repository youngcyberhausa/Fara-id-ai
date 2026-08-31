import { useState, lazy, Suspense } from "react";
import { LanguageProvider, useLang } from "./i18n/LanguageContext";
import { useAuth } from "./AuthContext";
import Logo from "./components/Logo";
import LanguageSwitcher from "./components/LanguageSwitcher";
import IslamicWatermark from "./components/IslamicWatermark";
import Login from "./components/Login";
import ResetPassword from "./components/ResetPassword";
import AboutUs from "./components/AboutUs";
import Terms from "./components/Terms";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Home from "./components/Home";
import History from "./components/History";
import Learn from "./components/Learn";
const FamilyRelations = lazy(() => import("./components/FamilyRelations"));
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
  const [resetToken, setResetToken] = useState(
    () => new URLSearchParams(window.location.search).get("reset_token")
  );
  const [page, setPage] = useState(() => {
    const p = window.location.pathname;
    if (p === "/about") return "about";
    if (p === "/terms") return "terms";
    if (p === "/privacy") return "privacy";
    return "app";
  });

  function navigate(path, name) {
    window.history.pushState({}, "", path);
    setPage(name);
  }
  function goHome() {
    window.history.pushState({}, "", "/");
    setPage("app");
  }
  const [view, setView] = useState("home"); // "home" | "wizard" | "history" | "learn" | "relations"
  const [historyQuery, setHistoryQuery] = useState("");
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

  if (page === "about") return <AboutUs onBack={goHome} />;
  if (page === "terms") return <Terms onBack={goHome} />;
  if (page === "privacy") return <PrivacyPolicy onBack={goHome} />;

  if (resetToken) {
    return (
      <ResetPassword
        token={resetToken}
        onDone={() => {
          window.history.replaceState({}, "", window.location.pathname);
          setResetToken(null);
        }}
      />
    );
  }

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
    setView("wizard");
  }

  function goToHome() {
    setView("home");
  }
  function goToHistory(query = "") {
    setHistoryQuery(query);
    setView("history");
  }
  function goToLearn() {
    setView("learn");
  }
  function goToRelations() {
    setView("relations");
  }

  return (
    <div className="min-h-screen relative">
      <IslamicWatermark />

      {/* Header */}
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={goToHome} className="flex items-center gap-3">
              <Logo size={34} />
              <div className="text-left">
                <div className="text-sm font-semibold text-gray-900 leading-tight">{t.appName}</div>
                <div className="text-[11px] text-gray-400 leading-tight">{t.tagline}</div>
              </div>
            </button>
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
        {view === "home" && (
          <Home
            onNewCase={handleNewCase}
            onHistory={() => goToHistory()}
            onLearn={goToLearn}
            onRelations={goToRelations}
            onSearch={(q) => goToHistory(q)}
          />
        )}

        {view === "relations" && (
          <Suspense fallback={<div className="text-sm text-gray-400 text-center py-10">…</div>}>
            <FamilyRelations onBack={goToHome} />
          </Suspense>
        )}

        {view === "history" && (
          <History
            initialQuery={historyQuery}
            onBack={goToHome}
            onNewCase={handleNewCase}
          />
        )}

        {view === "learn" && <Learn onBack={goToHome} />}

        {view === "wizard" && (
          <>
        {/* Wizard card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">{t.newCase}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{t.newCaseDesc}</p>
            </div>
            <button onClick={goToHome} className="text-sm text-gray-500 hover:text-gray-700 shrink-0">
              ← {t.back}
            </button>
          </div>

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
          </>
        )}

        <div className="text-center text-[11px] text-gray-400 mt-8 pb-2">
          {t.appName} · {t.tagline} · {t.scholarBadge}
        </div>
        <div className="flex items-center justify-center gap-4 text-[11px] text-gray-400 pb-6">
          <button onClick={() => navigate("/about", "about")} className="hover:text-gray-600">
            {t.footerAbout}
          </button>
          <span>·</span>
          <button onClick={() => navigate("/terms", "terms")} className="hover:text-gray-600">
            {t.footerTerms}
          </button>
          <span>·</span>
          <button onClick={() => navigate("/privacy", "privacy")} className="hover:text-gray-600">
            {t.footerPrivacy}
          </button>
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
