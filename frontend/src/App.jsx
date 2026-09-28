<header className="border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
  <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">

    <div className="flex items-center gap-3 min-w-0">
      <button
        onClick={goToHome}
        className="flex items-center gap-3 rounded-lg -mx-1 px-1 py-0.5 hover:opacity-80 min-w-0"
      >
        <Logo size={34} />

        <div className="text-left min-w-0">
          <div className="text-sm font-semibold text-gray-900 leading-tight truncate">
            {t.appName}
          </div>

          <div className="text-[11px] text-gray-400 leading-tight tracking-wide truncate">
            {t.tagline}
          </div>
        </div>
      </button>
    </div>

    <div className="flex items-center gap-1 sm:gap-2 shrink-0">

      <ThemeToggle />

      <div className="w-[115px] sm:w-[130px] shrink-0">
        <LanguageSwitcher />
      </div>

      {!user && (
        <button
          onClick={() => {
            setPendingAction(null);
            setShowLogin(true);
          }}
          className="px-2.5 sm:px-3.5 py-1.5 text-sm rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 whitespace-nowrap shrink-0"
        >
          {t.loginBtn}
        </button>
      )}

      {user && (
        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
            aria-label="Menu"
          >
            ☰
          </button>

          {menuOpen && createPortal(
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />

              <div className="fixed inset-y-0 left-0 w-[340px] max-w-[88vw] bg-white shadow-2xl z-50 flex flex-col overflow-hidden">

                <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-xl">
                      ⚖️
                    </div>

                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        Fara'id AI
                      </div>

                      <div className="text-xs text-gray-400">
                        Islamic Inheritance Intelligence
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setMenuOpen(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-2xl text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Close menu"
                  >
                    ×
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4">

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      goToDashboard();
                    }}
                    className="w-full text-left px-6 py-4 text-base font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-4"
                  >
                    <span className="w-8 text-center text-xl">📊</span>
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      goToPremium();
                    }}
                    className="w-full text-left px-6 py-4 text-base font-medium text-gray-700 hover:bg-amber-50 flex items-center gap-4"
                  >
                    <span className="w-8 text-center text-xl">
                      {user.is_premium &&
                      (!user.premium_expires_at ||
                        new Date(user.premium_expires_at) > new Date())
                        ? "👑"
                        : "⭐"}
                    </span>

                    <span>
                      {user.is_premium &&
                      (!user.premium_expires_at ||
                        new Date(user.premium_expires_at) > new Date())
                        ? "Premium"
                        : t.tilePremium}
                    </span>
                  </button>

                  <div className="border-t border-gray-100 my-3 mx-5" />

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      goToCalculator();
                    }}
                    className="w-full text-left px-6 py-4 text-base text-gray-700 hover:bg-brand-50 flex items-center gap-4"
                  >
                    <span className="w-8 text-center text-xl">⚖️</span>
                    <span>Inheritance Calculator</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      goToWealth();
                    }}
                    className="w-full text-left px-6 py-4 text-base text-gray-700 hover:bg-brand-50 flex items-center gap-4"
                  >
                    <span className="w-8 text-center text-xl">💰</span>
                    <span>Wealth &amp; Zakat</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      goToRubuuDinar();
                    }}
                    className="w-full text-left px-6 py-4 text-base text-gray-700 hover:bg-brand-50 flex items-center gap-4"
                  >
                    <span className="w-8 text-center text-xl">🪙</span>
                    <span>Rubu'u Dinar Alert</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      goToWasiyyah();
                    }}
                    className="w-full text-left px-6 py-4 text-base text-gray-700 hover:bg-brand-50 flex items-center gap-4"
                  >
                    <span className="w-8 text-center text-xl">📜</span>
                    <span>My Wasiyyah</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      goToMyFamily();
                    }}
                    className="w-full text-left px-6 py-4 text-base text-gray-700 hover:bg-brand-50 flex items-center gap-4"
                  >
                    <span className="w-8 text-center text-xl">👨‍👩‍👧‍👦</span>
                    <span>My Family</span>
                  </button>

                  <div className="border-t border-gray-100 my-3 mx-5" />

                  {user.is_admin && (
                    <>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          goToAdmin();
                        }}
                        className="w-full text-left px-6 py-4 text-base text-gray-700 hover:bg-brand-50 flex items-center gap-4"
                      >
                        <span className="w-8 text-center text-xl">🛠️</span>
                        <span>Admin Dashboard</span>
                      </button>

                      <div className="border-t border-gray-100 my-3 mx-5" />
                    </>
                  )}

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      goToHistory();
                    }}
                    className="w-full text-left px-6 py-4 text-base text-gray-700 hover:bg-brand-50 flex items-center gap-4"
                  >
                    <span className="w-8 text-center text-xl">⏱️</span>
                    <span>{t.tileHistory}</span>
                  </button>
                </div>

                <div className="border-t border-gray-100 bg-gray-50/70">

                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      await unregisterCurrentDevice();
                      logout();
                    }}
                    className="w-full text-left px-6 py-4 text-base text-red-600 hover:bg-red-50 flex items-center gap-4"
                  >
                    <span className="w-8 text-center text-xl">↪</span>
                    <span>{t.logout}</span>
                  </button>

                  <button
                    onClick={async () => {
                      setMenuOpen(false);

                      if (
                        !window.confirm(
                          "Permanently delete your account and all saved cases? This cannot be undone."
                        )
                      ) {
                        return;
                      }

                      try {
                        await authApi.deleteAccount();
                      } finally {
                        logout();
                      }
                    }}
                    className="w-full text-left px-6 py-4 text-sm text-red-500 hover:bg-red-50 flex items-center gap-4"
                  >
                    <span className="w-8 text-center text-xl">🗑️</span>
                    <span>Delete account</span>
                  </button>

                </div>
              </div>
            </>,
            document.body
          )}
        </div>
      )}
    </div>
  </div>
</header>









































