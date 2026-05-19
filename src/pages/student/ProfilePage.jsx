/**
 * pages/student/ProfilePage.jsx
 */
import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { ProgressAPI, QuizAPI, ModulesAPI, BookmarksAPI } from "../../backend/api.js";
import { Badge, ProgressBar, Spinner, SectionHeader, StatCard } from "../../components/ui/index.jsx";

export default function ProfilePage() {
  const { user } = useApp();
  const [progress, setProgress]     = useState({});
  const [quizHistory, setQH]        = useState([]);
  const [modules, setModules]       = useState([]);
  const [bookmarks, setBookmarks]   = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    (async () => {
      const [prog, qh, mods, bm] = await Promise.all([
        ProgressAPI.get(user.id),
        QuizAPI.getHistory(user.id),
        ModulesAPI.getAll(),
        BookmarksAPI.get(user.id),
      ]);
      setProgress(prog);
      setQH(qh);
      setModules(mods);
      setBookmarks(bm);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Spinner size={40} color="#c9a84c" /></div>;

  const avgScore     = quizHistory.length ? Math.round(quizHistory.reduce((s, q) => s + q.pct, 0) / quizHistory.length) : 0;
  const completedMods = modules.filter(m => (progress[m.id] || 0) === 100).length;
  const totalPct     = modules.length ? Math.round(modules.reduce((s, m) => s + (progress[m.id] || 0), 0) / modules.length) : 0;

  return (
    <div className="animate-fade-up">
      <SectionHeader title="👤 My Profile" />

      {/* Profile hero */}
      <div
        className="flex items-center gap-5 mb-6 p-5 rounded-2xl"
        style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(201,168,76,0.08))", border: '1px solid rgba(201,168,76,0.2)' }}
      >
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shrink-0" style={{ background: 'linear-gradient(135deg, #a07820, #c9a84c)' }}>
          {user.avatar}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-black" style={{ color: '#e8edf5' }}>{user.name}</h2>
          <div className="text-sm mt-0.5" style={{ color: '#4a6080' }}>{user.email}</div>
          <div className="flex gap-2 mt-2">
            <Badge color="#c9a84c">{user.roll}</Badge>
            <Badge color="#10B981">Student</Badge>
            <Badge color="#8B5CF6">Bahria University</Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black" style={{ color: totalPct >= 60 ? "#10B981" : "#F59E0B" }}>
            {totalPct}%
          </div>
          <div className="text-xs" style={{ color: '#4a6080' }}>Overall Progress</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard icon="📈" value={`${totalPct}%`}           label="Course Progress"    color="#c9a84c" />
        <StatCard icon="✅" value={`${completedMods}/${modules.length}`} label="Modules Done" color="#10B981" />
        <StatCard icon="📝" value={quizHistory.length}        label="Quizzes Taken"      color="#8B5CF6" />
        <StatCard icon="🏆" value={quizHistory.length ? `${avgScore}%` : "—"} label="Avg Quiz Score" color={avgScore >= 60 ? "#10B981" : "#F59E0B"} />
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Module Progress */}
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}>
          <h3 className="text-sm font-black mb-4 uppercase tracking-widest" style={{ color: '#c9a84c' }}>📚 Module Progress</h3>
          <div className="space-y-3">
            {modules.map(m => {
              const pct = progress[m.id] || 0;
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <span className="text-lg shrink-0">{m.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold mb-1.5 truncate" style={{ color: '#e8edf5' }}>{m.title}</div>
                    <ProgressBar value={pct} color={m.color} />
                  </div>
                  <span className="text-xs font-black shrink-0 w-9 text-right" style={{ color: m.color }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quiz History */}
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}>
          <h3 className="text-sm font-black mb-4 uppercase tracking-widest" style={{ color: '#c9a84c' }}>🎯 Quiz History ({quizHistory.length})</h3>
          {quizHistory.length === 0 ? (
            <div className="text-sm" style={{ color: '#4a6080' }}>No quizzes taken yet.</div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {[...quizHistory].reverse().map((r, i) => (
                <div key={i} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid rgba(201,168,76,0.14)' }}>
                  <span className="text-base">{r.pct >= 60 ? "✅" : "📚"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate" style={{ color: '#e8edf5' }}>{r.title}</div>
                    <div className="text-[11px]" style={{ color: '#4a6080' }}>{r.date} · {r.score}/{r.total} correct</div>
                  </div>
                  <span className="text-sm font-black shrink-0" style={{ color: r.pct >= 60 ? "#10B981" : "#EF4444" }}>
                    {r.pct}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bookmarks summary */}
        <div className="col-span-2 p-5 rounded-2xl" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}>
          <h3 className="text-sm font-black mb-4 uppercase tracking-widest" style={{ color: '#c9a84c' }}>🔖 Bookmarked Modules ({bookmarks.length})</h3>
          {bookmarks.length === 0 ? (
            <div className="text-sm" style={{ color: '#4a6080' }}>No bookmarks yet. Bookmark modules while studying!</div>
          ) : (
            <div className="flex gap-3 flex-wrap">
              {modules.filter(m => bookmarks.includes(m.id)).map(m => (
                <div key={m.id} className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold" style={{ borderColor: `${m.color}44`, background: `${m.color}10`, color: m.color }}>
                  {m.emoji} {m.title}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
