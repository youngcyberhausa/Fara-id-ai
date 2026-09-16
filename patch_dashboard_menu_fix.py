path = "frontend/src/App.jsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-gray-100 shadow-lg z-20 overflow-hidden py-1">
                      {user.is_admin && ('''

new = '''                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-gray-100 shadow-lg z-20 overflow-hidden py-1">
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

if content.count(old) != 1:
    raise SystemExit(f"ERROR: found {content.count(old)} occurrence(s)")

content = content.replace(old, new, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK")
