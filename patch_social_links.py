path = "frontend/src/App.jsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''        <div className="flex items-center justify-center gap-4 text-[11px] text-gray-400 pb-6">
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
        </div>'''

new = '''        <div className="flex items-center justify-center gap-4 text-[11px] text-gray-400 pb-3">
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
        <div className="flex items-center justify-center gap-4 pb-6">
          <a
            href="https://x.com/Faraid_AI"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter)"
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-700 hover:border-brand-300 transition"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61594245950066"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-700 hover:border-brand-300 transition"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z" />
            </svg>
          </a>
        </div>'''

if content.count(old) != 1:
    raise SystemExit(f"ERROR: expected exactly 1 occurrence of footer block, found {content.count(old)}")

content = content.replace(old, new, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK")
