import { useEffect, useState } from "react";
import { useLang } from "../i18n/LanguageContext";

const KEY = "faraid_my_family_v1";

export default function MyFamily({ onBack, onRelations }) {
  const { t } = useLang();
  const [members, setMembers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  });
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("son");

  useEffect(() => localStorage.setItem(KEY, JSON.stringify(members)), [members]);

  function add() {
    if (!name.trim()) return;
    setMembers((m) => [...m, { id: Date.now(), name: name.trim(), relation }]);
    setName("");
  }
  function remove(id) {
    setMembers((m) => m.filter((x) => x.id !== id));
  }

  const relationLabels = {
    husband: t.relHusband, wife: t.relWife, son: t.relSon, daughter: t.relDaughter,
    father: t.relFather, mother: t.relMother, brother: t.relBrother, sister: t.relSister,
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="text-sm text-brand-600 hover:underline mb-3">← {t.back || "Back"}</button>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="text-2xl">👨‍👩‍👧‍👦</div>
        <h2 className="text-xl font-bold text-gray-900 mt-1">{t.myFamilyTitle}</h2>
        <p className="text-sm text-gray-500 mt-1">{t.myFamilyDesc}</p>

        <div className="mt-4 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            className="flex-1 rounded-xl border border-gray-200 px-3 py-3 text-sm"
            placeholder={t.myFamilyNamePlaceholder}
          />
          <select
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            className="w-32 rounded-xl border border-gray-200 px-2 text-sm"
          >
            {Object.entries(relationLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <button onClick={add} className="rounded-xl bg-brand-600 text-white px-4 font-semibold">+</button>
        </div>

        <div className="mt-5 space-y-2">
          {members.length === 0 ? (
            <div className="text-sm text-gray-400 text-center py-8">{t.myFamilyEmpty}</div>
          ) : (
            members.map((m) => (
              <div key={m.id} className="flex items-center justify-between border border-gray-100 rounded-xl px-3 py-3">
                <div>
                  <div className="text-sm font-medium">{m.name}</div>
                  <div className="text-xs text-gray-400">{relationLabels[m.relation] || m.relation}</div>
                </div>
                <button onClick={() => remove(m.id)} className="text-xs text-red-500">{t.myFamilyRemove}</button>
              </div>
            ))
          )}
        </div>

        <button onClick={onRelations} className="w-full mt-4 rounded-xl border border-brand-200 text-brand-700 py-3 text-sm font-semibold">
          {t.myFamilyExplore}
        </button>
        <p className="text-[11px] text-gray-400 mt-4 text-center">{t.myFamilyStoredNote}</p>
      </div>
    </div>
  );
}
