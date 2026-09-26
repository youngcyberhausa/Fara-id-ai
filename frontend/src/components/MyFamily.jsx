import { useEffect, useState } from "react";
const KEY = "faraid_my_family_v1";
export default function MyFamily({ onBack, onRelations }) {
  const [members, setMembers] = useState(() => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } });
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("son");
  useEffect(() => localStorage.setItem(KEY, JSON.stringify(members)), [members]);
  function add() { if (!name.trim()) return; setMembers((m) => [...m, { id: Date.now(), name: name.trim(), relation }]); setName(""); }
  function remove(id) { setMembers((m) => m.filter((x) => x.id !== id)); }
  return <div className="max-w-2xl mx-auto">
    <button onClick={onBack} className="text-sm text-brand-600 hover:underline mb-3">← Back</button>
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="text-2xl">👨‍👩‍👧‍👦</div><h2 className="text-xl font-bold text-gray-900 mt-1">My Family</h2>
      <p className="text-sm text-gray-500 mt-1">Save common family relationships on this device for quicker future inheritance cases.</p>
      <div className="mt-4 flex gap-2"><input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} className="flex-1 rounded-xl border border-gray-200 px-3 py-3 text-sm" placeholder="Family member name" /><select value={relation} onChange={(e) => setRelation(e.target.value)} className="w-32 rounded-xl border border-gray-200 px-2 text-sm"><option value="husband">Husband</option><option value="wife">Wife</option><option value="son">Son</option><option value="daughter">Daughter</option><option value="father">Father</option><option value="mother">Mother</option><option value="brother">Brother</option><option value="sister">Sister</option></select><button onClick={add} className="rounded-xl bg-brand-600 text-white px-4 font-semibold">+</button></div>
      <div className="mt-5 space-y-2">{members.length === 0 ? <div className="text-sm text-gray-400 text-center py-8">No family members saved yet.</div> : members.map((m) => <div key={m.id} className="flex items-center justify-between border border-gray-100 rounded-xl px-3 py-3"><div><div className="text-sm font-medium">{m.name}</div><div className="text-xs text-gray-400 capitalize">{m.relation}</div></div><button onClick={() => remove(m.id)} className="text-xs text-red-500">Remove</button></div>)}</div>
      <button onClick={onRelations} className="w-full mt-4 rounded-xl border border-brand-200 text-brand-700 py-3 text-sm font-semibold">Explore inheritance relationships →</button>
      <p className="text-[11px] text-gray-400 mt-4 text-center">Family data is currently stored locally on this device.</p>
    </div>
  </div>;
}
