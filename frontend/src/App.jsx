import { useState, useEffect, lazy, Suspense } from "react";
import { LanguageProvider, useLang } from "./i18n/LanguageContext";
import { useAuth } from "./AuthContext";
import Logo from "./components/Logo";
import LanguageSwitcher from "./components/LanguageSwitcher";
import ThemeToggle from "./components/ThemeToggle";
import { initAds, maybeShowInterstitial } from "./ads.js";
import IslamicWatermark from "./components/IslamicWatermark";
import Login from "./components/Login";
import ResetPassword from "./components/ResetPassword";
import AboutUs from "./components/AboutUs";
import Terms from "./components/Terms";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Disclaimer from "./components/Disclaimer";
import Home from "./components/Home";
import History from "./components/History";
import Learn from "./components/Learn";
import ChatWidget from "./components/ChatWidget";
const FamilyRelations = lazy(() => import("./components/FamilyRelations"));
const ZakatCalculator = lazy(() => import("./components/ZakatCalculator"));
const IntroSplash = lazy(() => import("./components/IntroSplash"));
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

  // Initialize native ads (AdMob) once auth has resolved. No-ops on web
  // automatically (see ads.js). There's no ad-free premium tier anymore,
  // so ads always run for every signed-in or guest user.
  useEffect(() => {
    if (authLoading) return;
    initAds();
  }, [authLoading]);
  const [showSplash, setShowSplash] = useState(true);

  // Load the AdSense script once, only when a publisher client ID is
  // configured (VITE_ADSENSE_CLIENT). No-ops silently otherwise.
  useEffect(() => {
    const client = import.meta.env.VITE_ADSENSE_CLIENT;
    if (!client) return;
    if (document.querySelector("script[data-adsbygoogle]")) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    script.crossOrigin = "anonymous";
    script.dataset.adsbygoogle = "true";
    document.head.appendChild(script);
  }, []);

  const [resetToken, setResetToken] = useState(
    () => new URLSearchParams(window.location.search).get("reset_token")
  );
  const [page, setPage] = useState(() => {
    const p = window.location.pathname;
    if (p === "/about") return "about";
    if (p === "/terms") return "terms";
    if (p === "/privacy") return "privacy";
    if (p === "/disclaimer") return "disclaimer";
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
  const [menuOpen, setMenuOpen] = useState(false);
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
  const [showLogin, setShowLogin] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // "save" | "history" | "premium"

  // Once a guest signs in through the login overlay, resume whatever they
  // were originally trying to do instead of just dropping them back on the
  // page they started from.
  useEffect(() => {
    if (!user || !pendingAction) return;
    const action = pendingAction;
    setPendingAction(null);
    setShowLogin(false);
    if (action === "save") handleSave();
    else if (action === "history") setView("history");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pendingAction]);

  const step = STEPS[stepIndex];

  if (showSplash) {
    return (
      <Suspense
        fallback={
          <div className="fixed inset-0 z-50 bg-[#020806] flex items-center justify-center">
            <div
              className="text-2xl font-bold animate-pulse"
              style={{ color: "#d9b65c", letterSpacing: "6px" }}
            >
              FARA'ID AI
            </div>
          </div>
        }
      >
        <IntroSplash onFinish={() => setShowSplash(false)} />
      </Suspense>
    );
  }

  if (page === "about") return <AboutUs onBack={goHome} />;
  if (page === "terms") return <Terms onBack={goHome} />;
  if (page === "privacy") return <PrivacyPolicy onBack={goHome} />;
  if (page === "disclaimer") return <Disclaimer onBack={goHome} />;

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

  // Login is optional: guests can use the calculator freely. showLogin only
  // pops up when a guest tries to do something that truly needs an account
  // (saving a case, viewing history, or going premium).

  async function goNext() {
    if (step === "heirs") {
      setStepIndex(stepIndex + 1);
      setLoading(true);
      setError(null);
      try {
        const payload = { ...data, heirs };
        const res = await api.calculate(payload);
        setResult(res);
        maybeShowInterstitial();
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
    if (!user) {
      setPendingAction("save");
      setShowLogin(true);
      return;
    }
    setSaving(true);
    try {
      const payload = { ...data, heirs };
      const res = await api.createCase(payload);
      setSavedId(res.id);
      maybeShowInterstitial();
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
    if (!user) {
      setPendingAction("history");
      setShowLogin(true);
      return;
    }
    setHistoryQuery(query);
    setView("history");
  }
  function goToLearn() {
    setView("learn");
  }
  function goToRelations() {
    setView("relations");
  }
  function goToZakat() {
    setView("zakat");
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
            <ThemeToggle />
            <LanguageSwitcher />
            {!user && (
              <button
                onClick={() => {
                  setPendingAction(null);
                  setShowLogin(true);
                }}
                className="px-3 py-1.5 text-sm rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700"
              >
                {t.loginBtn}
              </button>
            )}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                  aria-label="Menu"
                >
                  ☰
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-lg z-20 overflow-hidden">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          goToHistory();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        ⏱ {t.tileHistory}
                      </button>
                      <div className="border-t border-gray-100" />
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        ↪ {t.logout}
                      </button>
                    </div>
                  </>
                )}
              </div>
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
            onZakat={goToZakat}
            onSearch={(q) => goToHistory(q)}
          />
        )}

        {view === "zakat" && (
          <Suspense fallback={<div className="text-sm text-gray-400 text-center py-10">…</div>}>
            <ZakatCalculator onBack={goToHome} />
          </Suspense>
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
          {t.appName} · {t.scholarBadge}
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
          <span>·</span>
          <button onClick={() => navigate("/disclaimer", "disclaimer")} className="hover:text-gray-600">
            {t.footerDisclaimer}
          </button>
        </div>
      </main>

      {user && <ChatWidget />}

      {showLogin && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <button
            onClick={() => {
              setShowLogin(false);
              setPendingAction(null);
            }}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            ✕
          </button>
          <Login />
        </div>
      )}
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
