import { useState } from "react";
import { useLang } from "../i18n/LanguageContext";

const GROUPS = [
  { label: "Spouse", keys: ["husband", "wife"] },
  { label: "Children", keys: ["son", "daughter"] },
  { label: "Parents", keys: ["father", "mother"] },
  { label: "Grandparents", keys: ["paternal_grandfather", "paternal_grandmother", "maternal_grandmother"] },
  { label: "Full siblings", keys: ["full_brother", "full_sister"] },
  { label: "Paternal half-siblings", keys: ["consanguine_brother", "consanguine_sister"] },
  { label: "Maternal half-siblings", keys: ["uterine_brother", "uterine_sister"] },
];

export default function StepHeirs({ heirs, setHeirs }) {
  const { t } = useLang();
  const [namesOpen, setNamesOpen] = useState({});

  function getCount(type) {
    return heirs.find((h) => h.type === type)?.count || 0;
  }

  function getNames(type) {
    return heirs.find((h) => h.type === type)?.names || [];
  }

  function setCount(type, count) {
    const clamped = Math.max(0, count);
    const existing = heirs.find((h) => h.type === type);
    if (clamped === 0) {
      setHeirs(heirs.filter((h) => h.type !== type));
    } else if (existing) {
      const names = (existing.names || []).slice(0, clamped);
      setHeirs(heirs.map((h) => (h.type === type ? { ...h, count: clamped, names } : h)));
    } else {
      setHeirs([...heirs, { type, count: clamped, names: [] }]);
    }
  }

  function setNameAt(type, index, value) {
    const existing = heirs.find((h) => h.type === type);
    if (!existing) return;
    const names = [...(existing.names || [])];
    names[index] = value;
    setHeirs(heirs.map((h) => (h.type === type ? { ...h, names } : h)));
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">{t.heirsTitle}</h2>
      <p className="text-sm text-gray-500 mt-1">{t.heirsDesc}</p>

      <div className="mt-5 space-y-5">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              {group.label}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {group.keys.map((key) => {
                const count = getCount(key);
                const names = getNames(key);
                const open = !!namesOpen[key];
                return (
                  <div
                    key={key}
                    className={`rounded-lg border px-3 py-2.5 ${
                      count > 0 ? "border-brand-300 bg-brand-50" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{t.heirs[key]}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCount(key, count - 1)}
                          className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center hover:bg-gray-100"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm font-medium">{count}</span>
                        <button
                          type="button"
                          onClick={() => setCount(key, count + 1)}
                          className="w-7 h-7 rounded-full border border-brand-500 text-brand-600 flex items-center justify-center hover:bg-brand-100"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {count > 0 && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => setNamesOpen((prev) => ({ ...prev, [key]: !prev[key] }))}
                          className="text-[11px] text-brand-600 hover:underline"
                        >
                          {open ? "▾" : "▸"} {t.addNamesOptional || "Add names (optional)"}
                        </button>
                        {open && (
                          <div className="mt-1.5 space-y-1.5">
                            {Array.from({ length: count }).map((_, i) => (
                              <input
                                key={i}
                                type="text"
                                value={names[i] || ""}
                                onChange={(e) => setNameAt(key, i, e.target.value)}
                                placeholder={`${t.heirs[key]} ${i + 1}`}
                                className="w-full text-xs rounded-md border border-gray-200 px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-brand-500"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
