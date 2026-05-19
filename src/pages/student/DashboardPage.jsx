/**
 * pages/student/DashboardPage.jsx
 * Premium DentAI Learn student dashboard — gold/navy theme.
 */
import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { ModulesAPI, ProgressAPI, QuizAPI, AnnouncementsAPI } from "../../backend/api.js";
import { StatCard, ProgressBar, Spinner, Button, SectionHeader } from "../../components/ui/index.jsx";

export default function DashboardPage() {
  const { user, setPage } = useApp();
  const [modules, setModules]           = useState([]);
  const [progress, setProgress]         = useState({});
  const [quizHistory, setQuizHistory]   = useState([]);
  const [announcements, setAnn]         = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    (async () => {
      const [mods, prog, qh, ann] = await Promise.all([
        ModulesAPI.getAll(),
        ProgressAPI.get(user.id),
        QuizAPI.getHistory(user.id),
        AnnouncementsAPI.getAll(),
      ]);
      setModules(mods);
      setProgress(prog);
      setQuizHistory(qh);
      setAnn(ann);
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Spinner size={40} color="#c9a84c" /></div>
  );

  const totalPct   = modules.length ? Math.round(modules.reduce((s, m) => s + (progress[m.id] || 0), 0) / modules.length) : 0;
  const avgScore   = quizHistory.length ? Math.round(quizHistory.reduce((s, q) => s + q.pct, 0) / quizHistory.length) : 0;
  const inProgress = modules.filter(m => (progress[m.id] || 0) > 0 && (progress[m.id] || 0) < 100);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Hero Welcome */}
      <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a1428, #0d1a30)', border: '1px solid rgba(201,168,76,0.15)' }}>
        <div className="hex-bg" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0" style={{ background: 'linear-gradient(135deg, #1a2d50, #243d60)', border: '2px solid #c9a84c' }}>
            {user.avatar || "🧑‍⚕️"}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#4a6080' }}>Welcome back,</p>
            <h1 className="text-2xl font-black font-display gold-text tracking-tight">{user.name}</h1>
            <p className="text-xs mt-1" style={{ color: '#4a6080' }}>Roll: {user.roll} · Bahria University · Oral Pathology</p>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <span>🔔</span>
            <span className="text-xs font-bold" style={{ color: '#c9a84c' }}>{announcements.length}</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon="📈" value={`${totalPct}%`}          label="Course Progress" />
        <StatCard icon="📚" value={inProgress.length}        label="Modules Active" />
        <StatCard icon="🎯" value={quizHistory.length}       label="Quizzes Done" />
        <StatCard icon="🏆" value={quizHistory.length ? `${avgScore}%` : "—"} label="Avg Score" />
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Continue Learning */}
        <div className="card">
          <h3 className="text-sm font-black uppercase tracking-widest mb-4 pb-2" style={{ color: '#c9a84c', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>Continue Learning</h3>
          {inProgress.length === 0 ? (
            <div className="text-sm" style={{ color: '#4a6080' }}>
              No modules in progress.{" "}
              <button onClick={() => setPage("modules")} className="font-bold underline cursor-pointer bg-transparent border-none" style={{ color: '#c9a84c' }}>Start one →</button>
            </div>
          ) : (
            <div className="space-y-3">
              {inProgress.slice(0, 4).map(m => (
                <div
                  key={m.id}
                  onClick={() => setPage("modules")}
                  className="flex items-center gap-3 cursor-pointer -mx-2 px-3 py-2 rounded-xl transition-all"
                  style={{ background: 'rgba(0,0,0,0.3)' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ background: 'linear-gradient(135deg, #1a2d50, #243d60)' }}>
                    {m.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate" style={{ color: '#e8edf5' }}>{m.title}</div>
                    <ProgressBar value={progress[m.id] || 0} />
                    <div className="text-[10px] mt-1" style={{ color: '#c9a84c' }}>{progress[m.id] || 0}% complete</div>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full mt-2 text-xs" onClick={() => setPage("modules")}>
                View All Modules →
              </Button>
            </div>
          )}
        </div>

        {/* Explore 3D Models */}
        <div className="card">
          <h3 className="text-sm font-black uppercase tracking-widest mb-4 pb-2" style={{ color: '#c9a84c', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>Explore 3D Models</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "🦷", label: "Tooth Anatomy", page: "ar" },
              { icon: "🫁", label: "Oral Cysts", page: "ar" },
              { icon: "🦴", label: "Jaw Lesions", page: "ar" },
              { icon: "🔬", label: "Tumors", page: "ar" },
            ].map(a => (
              <div
                key={a.label}
                onClick={() => setPage(a.page)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer transition-all hover:border-[rgba(201,168,76,0.3)]"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid transparent' }}
              >
                <span className="text-2xl">{a.icon}</span>
                <span className="text-xs font-bold text-center" style={{ color: '#9aacbe' }}>{a.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz & AI Section */}
        <div className="card">
          <h3 className="text-sm font-black uppercase tracking-widest mb-4 pb-2" style={{ color: '#c9a84c', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>Quiz Section</h3>
          <button
            onClick={() => setPage("quiz")}
            className="w-full py-3 rounded-xl font-black text-sm text-white cursor-pointer mb-3"
            style={{ background: 'linear-gradient(135deg, #a07820, #c9a84c)', boxShadow: '0 4px 16px rgba(201,168,76,0.4)' }}
          >
            ▶ Start Quiz
          </button>
          <div className="text-xs mb-1" style={{ color: '#4a6080' }}>
            Previous score: <span className="font-bold" style={{ color: '#c9a84c' }}>{quizHistory.length ? `${quizHistory[quizHistory.length-1].pct}%` : "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs mt-3" style={{ color: '#4a6080' }}>
            🔥 Daily challenge
          </div>

          <h3 className="text-sm font-black uppercase tracking-widest mt-5 mb-3 pb-2" style={{ color: '#c9a84c', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>AI Chatbot</h3>
          <div className="text-center text-3xl mb-2">🤖</div>
          <button
            onClick={() => setPage("chatbot")}
            className="w-full py-2.5 rounded-xl font-bold text-sm cursor-pointer"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', color: '#c9a84c' }}
          >
            Ask DentAI
          </button>
        </div>

        {/* Announcements */}
        <div className="card">
          <h3 className="text-sm font-black uppercase tracking-widest mb-4 pb-2" style={{ color: '#c9a84c', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>Announcements</h3>
          <div className="space-y-3">
            {announcements.slice(0, 3).map(a => (
              <div
                key={a.id}
                className="p-3 rounded-xl"
                style={{ background: 'rgba(0,0,0,0.3)', borderLeft: `3px solid ${a.priority === "high" ? "#EF4444" : "#c9a84c"}` }}
              >
                <div className="text-sm font-bold" style={{ color: '#e8edf5' }}>{a.title}</div>
                <div className="text-xs mt-1 leading-relaxed" style={{ color: '#6a8aaa' }}>{a.body}</div>
                <div className="text-xs mt-1.5" style={{ color: '#3a5070' }}>{a.date}</div>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="text-sm" style={{ color: '#4a6080' }}>No announcements yet.</p>
            )}
          </div>

          {/* AR Quick Link */}
          <div className="mt-4 p-3 rounded-xl text-center cursor-pointer" onClick={() => setPage("ar")} style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <span className="text-sm font-black" style={{ color: '#c9a84c' }}>🥽 View in AR</span>
          </div>
        </div>
      </div>
    </div>
  );
}
