def patch(path, old, new, label):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    c = content.count(old)
    if c != 1:
        raise SystemExit(f"ERROR ({label}): found {c} occurrence(s)")
    content = content.replace(old, new, 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"OK: {label}")

# --- Login.jsx ---
patch(
    "frontend/src/components/Login.jsx",
    '  const [password, setPassword] = useState("");',
    '  const [password, setPassword] = useState("");\n  const [showPassword, setShowPassword] = useState(false);',
    "Login.jsx state",
)

patch(
    "frontend/src/components/Login.jsx",
    '''              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
              />''',
    '''              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>''',
    "Login.jsx input",
)

# --- ResetPassword.jsx ---
patch(
    "frontend/src/components/ResetPassword.jsx",
    '  const [password, setPassword] = useState("");',
    '  const [password, setPassword] = useState("");\n  const [showPassword, setShowPassword] = useState(false);',
    "ResetPassword.jsx state",
)

patch(
    "frontend/src/components/ResetPassword.jsx",
    '''                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                  />''',
    '''                  <div className="relative mt-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                    >
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>''',
    "ResetPassword.jsx input",
)
