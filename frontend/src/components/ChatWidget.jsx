import { useState, useRef, useEffect } from "react";
import { useLang } from "../i18n/LanguageContext";
import { supportApi } from "../api";

export default function ChatWidget() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]); // {role, content}
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  async function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setError(null);
    setInput("");
    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setBusy(true);
    try {
      const history = messages.slice(-10);
      const res = await supportApi.chat(text, history);
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch (e) {
      setError(
        e.message?.includes("not configured") ? t.chatNotConfigured : t.chatError
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-4 z-40 w-[92vw] max-w-sm h-[70vh] max-h-[520px] bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl flex flex-col overflow-hidden">
          <div className="bg-brand-700 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div>
              <div className="text-sm font-semibold">{t.chatTitle}</div>
              <div className="text-[10px] text-white/70">{t.chatDisclaimer}</div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white text-lg leading-none">
              ✕
            </button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
            {messages.length === 0 && (
              <div className="text-xs text-gray-400 text-center py-6">{t.chatWelcome}</div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] text-sm rounded-2xl px-3 py-2 leading-relaxed ${
                    m.role === "user"
                      ? "bg-brand-600 text-white rounded-br-sm"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-gray-400">
                  …
                </div>
              </div>
            )}
            {error && (
              <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
          </div>

          <form onSubmit={send} className="border-t border-gray-100 dark:border-gray-700 p-2.5 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.chatPlaceholder}
              className="flex-1 text-sm bg-gray-50 dark:bg-gray-900 rounded-full px-3.5 py-2 outline-none focus:ring-2 focus:ring-brand-300"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center disabled:opacity-40 shrink-0"
            >
              →
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-4 z-40 w-14 h-14 rounded-full bg-brand-700 text-white shadow-lg flex items-center justify-center text-xl hover:bg-brand-600"
        aria-label={t.chatTitle}
      >
        {open ? "✕" : "💬"}
      </button>
    </>
  );
}
