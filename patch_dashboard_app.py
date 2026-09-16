path = "frontend/src/App.jsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

edits = [
    (
        'const AdminDashboard = lazy(() => import("./components/AdminDashboard"));',
        'const AdminDashboard = lazy(() => import("./components/AdminDashboard"));\nconst Dashboard = lazy(() => import("./components/Dashboard"));'
    ),
    (
        '''  function goToAdmin() {
    setView("admin");
  }''',
        '''  function goToAdmin() {
    setView("admin");
  }
  function goToDashboard() {
    if (!user) {
      setPendingAction("dashboard");
      setShowLogin(true);
      return;
    }
    setView("dashboard");
  }'''
    ),
    (
        '''    if (action === "save") handleSave();
    else if (action === "history") setView("history");''',
        '''    if (action === "save") handleSave();
    else if (action === "history") setView("history");
    else if (action === "dashboard") setView("dashboard");'''
    ),
    (
        '''                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-lg z-20 overflow-hidden">
                      {user.is_admin && (''',
        '''                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-lg z-20 overflow-hidden">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          goToDashboard();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        📊 Dashboard
                      </button>
                      <div className="border-t border-gray-100" />
                      {user.is_admin && ('''
    ),
    (
        '''      <main className="max-w-5xl mx-auto px-4 py-6">
        {view === "home" && (''',
        '''      <main className="max-w-5xl mx-auto px-4 py-6">
        {view === "dashboard" && (
          <Suspense fallback={<div className="text-sm text-gray-400 text-center py-10">…</div>}>
            <Dashboard
              onHome={goToHome}
              onHistory={goToHistory}
              onNewCase={handleNewCase}
              onZakat={goToZakat}
              onMenu={() => {
                setView("home");
                setMenuOpen(true);
              }}
            />
          </Suspense>
        )}

        {view === "home" && ('''
    ),
]

for old, new in edits:
    if content.count(old) != 1:
        raise SystemExit(f"ERROR: found {content.count(old)} occurrence(s) of:\\n{old[:80]!r}")

for old, new in edits:
    content = content.replace(old, new, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK")
