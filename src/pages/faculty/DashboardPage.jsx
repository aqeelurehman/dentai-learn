/**
 * pages/faculty/DashboardPage.jsx
 */
import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { UsersAPI, QuizAPI, ModulesAPI, AnnouncementsAPI } from "../../backend/api.js";
import { StatCard, Badge, Spinner, Button, SectionHeader } from "../../components/ui/index.jsx";

export default function FacultyDashboard() {
  const { user, setPage } = useApp();
  const [students, setStudents]   = useState([]);
  const [results, setResults]     = useState([]);
  const [modules, setModules]     = useState([]);
  const [ann, setAnn]             = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      const [stu, res, mods, a] = await Promise.all([
        UsersAPI.getStudents(),
        QuizAPI.getAllResults(),
        ModulesAPI.getAll(),
        AnnouncementsAPI.getAll(),
      ]);
      setStudents(stu); setResults(res); setModules(mods); setAnn(a);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Spinner size={40} /></div>;

  const avg    = results.length ? Math.round(results.reduce((s, r) => s + r.pct, 0) / results.length) : 0;
  const passed = results.filter(r => r.pct >= 60).length;

  return (
    <div className="animate-fade-up space-y-6">
      {/* Hero */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.04))',
          border: '1px solid rgba(201,168,76,0.2)',
        }}
      >
        <p
          className="text-xs font-bold uppercase tracking-widest mb-1"
          style={{ color: '#c9a84c' }}
        >
          Faculty Portal
        </p>
        <h1
          className="text-3xl font-black font-display gold-text"
          style={{ color: '#e8edf5' }}
        >
          Course Management Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: '#4a6080' }}>
          Dr. {user.name} · {user.roll} · Oral Pathology — Bahria University
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon="&#128101;" value={students.length}  label="Students"     color="#c9a84c" />
        <StatCard icon="&#128221;" value={results.length}   label="Quiz Attempts" color="#c9a84c" />
        <StatCard icon="&#9989;" value={results.length ? `${Math.round(passed / results.length * 100)}%` : "—"} label="Pass Rate" color="#10B981" />
        <StatCard icon="&#128202;" value={results.length ? `${avg}%` : "—"} label="Class Average" color={avg >= 60 ? "#10B981" : "#F59E0B"} />
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Quick Actions */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}>
          <h3
            className="text-base font-black mb-4 font-display"
            style={{ color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "View Reports",   icon: "📊", page: "reports",        color: "#c9a84c" },
              { label: "Add Question",   icon: "📝", page: "manage-quiz",    color: "#c9a84c" },
              { label: "New Module",     icon: "🦷", page: "manage-modules", color: "#c9a84c" },
              { label: "Announce",       icon: "📢", page: "announcements",  color: "#c9a84c" },
            ].map(a => (
              <button
                key={a.label}
                onClick={() => setPage(a.page)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-[1.03] cursor-pointer font-bold text-sm"
                style={{
                  border: '1px solid rgba(201,168,76,0.25)',
                  background: 'rgba(201,168,76,0.08)',
                  color: '#c9a84c',
                }}
              >
                <span className="text-2xl">{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-base font-black font-display"
              style={{ color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
              Announcements
            </h3>
            <Button variant="ghost" className="text-xs" onClick={() => setPage("announcements")} style={{ color: '#c9a84c' }}>Manage &rarr;</Button>
          </div>
          <div className="space-y-2.5">
            {ann.slice(0, 3).map(a => (
              <div
                key={a.id}
                className="p-2.5 rounded-xl"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  borderLeft: `3px solid ${a.priority === "high" ? "#EF4444" : "#c9a84c"}`,
                }}
              >
                <div className="text-xs font-bold" style={{ color: '#e8edf5' }}>{a.title}</div>
                <div className="text-[11px] mt-0.5" style={{ color: '#4a6080' }}>{a.date}</div>
              </div>
            ))}
            {ann.length === 0 && <div className="text-sm" style={{ color: '#4a6080' }}>No announcements yet.</div>}
          </div>
        </div>

        {/* Module Overview */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-base font-black font-display"
              style={{ color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
              Modules ({modules.length})
            </h3>
            <Button variant="ghost" className="text-xs" onClick={() => setPage("manage-modules")} style={{ color: '#c9a84c' }}>Manage &rarr;</Button>
          </div>
          <div className="space-y-2">
            {modules.slice(0, 5).map(m => (
              <div
                key={m.id}
                className="flex items-center gap-3 py-1.5 last:border-0"
                style={{ borderBottom: '1px solid rgba(201,168,76,0.14)' }}
              >
                <span className="text-lg">{m.emoji}</span>
                <div className="text-sm font-medium flex-1 truncate" style={{ color: '#e8edf5' }}>{m.title}</div>
                <div className="flex gap-1">
                  {(m.tags || []).slice(0, 1).map(t => (
                    <Badge key={t} color={m.color} className="text-[10px]">{t}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Quiz Results */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-base font-black font-display"
              style={{ color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
              Recent Results
            </h3>
            <Button variant="ghost" className="text-xs" onClick={() => setPage("reports")} style={{ color: '#c9a84c' }}>All Reports &rarr;</Button>
          </div>
          {results.length === 0 ? (
            <div className="text-sm" style={{ color: '#4a6080' }}>No quiz attempts yet.</div>
          ) : (
            <div className="space-y-2">
              {[...results].reverse().slice(0, 5).map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-1.5 last:border-0"
                  style={{ borderBottom: '1px solid rgba(201,168,76,0.14)' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate" style={{ color: '#e8edf5' }}>{r.name}</div>
                    <div className="text-[11px]" style={{ color: '#4a6080' }}>{r.quizTitle} · {r.date}</div>
                  </div>
                  <span className="text-sm font-black" style={{ color: r.pct >= 60 ? "#22c55e" : "#EF4444" }}>{r.pct}%</span>
                  <Badge color={r.pct >= 60 ? "#22c55e" : "#EF4444"} className="text-[10px]">{r.pct >= 60 ? "Pass" : "Fail"}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
