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
        '    else if (action === "history") setView("history");',
        '    else if (action === "history") setView("history");\n    else if (action === "dashboard") setView("dashboard");'
    ),
    (
        '        {view === "home" && (',
        '''        {view === "dashboard" && (
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
    c = content.count(old)
    if c != 1:
        raise SystemExit(f"ERROR: found {c} occurrence(s) of:\n{old[:80]!r}")

for old, new in edits:
    content = content.replace(old, new, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK")
