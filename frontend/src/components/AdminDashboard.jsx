import { useState, useEffect } from "react";
import { adminApi } from "../api";

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
      <div className="text-[11px] text-gray-400">{label}</div>
      <div className="text-2xl font-bold text-brand-700 mt-0.5">{value}</div>
    </div>
  );
}

export default function AdminDashboard({ onBack }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState(null);
  const [announcements, setAnnouncements] = useState(null);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [posting, setPosting] = useState(false);

  function loadAll() {
    adminApi.getStats().then(setStats).catch((e) => setError(e.message));
    adminApi.listUsers().then(setUsers).catch((e) => setError(e.message));
    adminApi.listAnnouncements().then(setAnnouncements).catch((e) => setError(e.message));
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handlePost(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setPosting(true);
    try {
      await adminApi.createAnnouncement({
        title: title.trim(),
        message: message.trim() || null,
        video_url: videoUrl.trim() || null,
      });
      setTitle("");
      setMessage("");
      setVideoUrl("");
      loadAll();
    } catch (e) {
      setError(e.message);
    } finally {
      setPosting(false);
    }
  }

  async function handleDeactivate(id) {
    try {
      await adminApi.deactivateAnnouncement(id);
      loadAll();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <button onClick={onBack} className="text-sm text-brand-600 hover:underline mb-3">
        ← Koma
      </button>

      <h2 className="text-lg font-semibold text-gray-900">🛠 Admin Dashboard</h2>

      {error && (
        <div className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <StatCard label="Duk Users" value={stats ? stats.total_users : "…"} />
        <StatCard label="Sabbin Users (7d)" value={stats ? stats.new_users_7d : "…"} />
        <StatCard label="Premium Users" value={stats ? stats.premium_users : "…"} />
        <StatCard label="Duk Cases" value={stats ? stats.total_cases : "…"} />
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">📢 Sanya Sanarwa (Notification)</h3>
        <form onSubmit={handlePost} className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Take (Title) — misali: Sabon Feature!"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Saƙo (optional)"
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Video URL (YouTube link ko direct .mp4 link) — optional"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={posting}
            className="w-full bg-brand-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-brand-700 disabled:opacity-50"
          >
            {posting ? "…" : "Buga Sanarwa ga Duk Users"}
          </button>
        </form>
        <p className="text-[11px] text-gray-400 mt-2">
          Sanya sabon sanarwa zai kashe wanda ya gabata kansa — sanarwa ɗaya kawai ke aiki a lokaci guda.
        </p>
      </div>

      {announcements && announcements.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Tarihin Sanarwa</h3>
          <div className="space-y-2">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="bg-white rounded-lg border border-gray-100 px-4 py-3 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {a.title} {a.is_active && <span className="text-[10px] text-brand-600">● Live</span>}
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {new Date(a.created_at).toLocaleDateString()}
                  </div>
                </div>
                {a.is_active && (
                  <button
                    onClick={() => handleDeactivate(a.id)}
                    className="text-xs text-red-500 hover:text-red-700 shrink-0 ml-3"
                  >
                    Kashe
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Users na Kwanan Nan</h3>
        {users === null && <div className="text-sm text-gray-400">…</div>}
        <div className="space-y-1.5 max-h-96 overflow-y-auto">
          {users?.map((u) => (
            <div
              key={u.id}
              className="bg-white rounded-lg border border-gray-100 px-3 py-2 flex items-center justify-between text-sm"
            >
              <div className="min-w-0">
                <div className="text-gray-900 truncate">{u.email}</div>
                <div className="text-[11px] text-gray-400">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : ""}
                </div>
              </div>
              {u.is_premium && <span className="text-[10px] text-amber-600 shrink-0 ml-2">👑 Premium</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
