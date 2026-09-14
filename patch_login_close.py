path = "frontend/src/App.jsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''  useEffect(() => {
    if (!user || !pendingAction) return;
    const action = pendingAction;
    setPendingAction(null);
    setShowLogin(false);
    if (action === "save") handleSave();
    else if (action === "history") setView("history");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pendingAction]);'''

new = '''  useEffect(() => {
    if (!user || !showLogin) return;
    setShowLogin(false);
    const action = pendingAction;
    setPendingAction(null);
    if (action === "save") handleSave();
    else if (action === "history") setView("history");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, showLogin]);'''

if old not in content:
    raise SystemExit("ERROR: anchor block not found — aborting without changes.")
if content.count(old) != 1:
    raise SystemExit("ERROR: anchor block found more than once — aborting.")

content = content.replace(old, new, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK: App.jsx patched successfully.")
