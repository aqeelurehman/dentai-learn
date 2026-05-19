/**
 * pages/faculty/ProfilePage.jsx
 */
import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { QuizAPI, ModulesAPI, UsersAPI, CasesAPI } from "../../backend/api.js";
import { Badge, Spinner, SectionHeader, StatCard } from "../../components/ui/index.jsx";

export default function FacultyProfilePage() {
  const { user } = useApp();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [results, mods, students, cases] = await Promise.all([
        QuizAPI.getAllResults(),
        ModulesAPI.getAll(),
        UsersAPI.getStudents(),
        CasesAPI.getAll(),
      ]);
      const avg    = results.length ? Math.round(results.reduce((s, r) => s + r.pct, 0) / results.length) : 0;
      const passed = results.filter(r => r.pct >= 60).length;
      setStats({ results, mods, students, cases, avg, passed });
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Spinner size={40} color="#c9a84c" /></div>;

  return (
    <div className="animate-fade-up">
      <SectionHeader title={<span className="font-display gold-text">Faculty Profile</span>} />

      {/* Profile hero */}
      <div
        className="flex items-center gap-5 mb-6"
        style={{
          background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(13,21,37,0.92))",
          border: "1px solid rgba(201,168,76,0.3)",
          borderRadius: "1rem",
          padding: "1.5rem",
        }}
      >
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shrink-0" style={{ background: "linear-gradient(135deg, #a07820, #c9a84c)" }}>
          {user.avatar}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-black" style={{ color: '#e8edf5' }}>{user.name}</h2>
          <div className="text-sm mt-0.5" style={{ color: '#4a6080' }}>{user.email}</div>
          <div className="flex gap-2 mt-2">
            <Badge color="#c9a84c">{user.roll}</Badge>
            <Badge color="#c9a84c">Faculty</Badge>
            <Badge color="#c9a84c">Oral Pathology</Badge>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard icon="👥" value={stats.students.length}  label="Students"         color="#c9a84c" />
        <StatCard icon="🦷" value={stats.mods.length}      label="Modules Created"  color="#10B981" />
        <StatCard icon="📝" value={stats.results.length}   label="Quiz Attempts"    color="#c9a84c" />
        <StatCard icon="🔍" value={stats.cases.length}     label="Clinical Cases"   color="#F59E0B" />
      </div>

      {/* Class performance */}
      <div className="grid grid-cols-2 gap-5">
        <div style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)', borderRadius: '1rem', padding: '1.25rem' }}>
          <h3 className="text-sm font-black mb-4 uppercase tracking-widest" style={{ color: '#c9a84c' }}>Class Performance Overview</h3>
          <div className="space-y-3">
            {[
              ["Class Average", `${stats.avg}%`, stats.avg >= 60 ? "#10B981" : "#F59E0B"],
              ["Pass Rate",     stats.results.length ? `${Math.round(stats.passed / stats.results.length * 100)}%` : "—", "#10B981"],
              ["Total Attempts",stats.results.length, "#c9a84c"],
              ["High Scorers (≥80%)", stats.results.filter(r => r.pct >= 80).length, "#c9a84c"],
              ["At Risk (<50%)",      stats.results.filter(r => r.pct < 50).length,  "#EF4444"],
            ].map(([l, v, c]) => (
              <div key={l} className="flex items-center justify-between py-2 last:border-0" style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                <span className="text-xs" style={{ color: '#4a6080' }}>{l}</span>
                <span className="text-sm font-black" style={{ color: c }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)', borderRadius: '1rem', padding: '1.25rem' }}>
          <h3 className="text-sm font-black mb-4 uppercase tracking-widest" style={{ color: '#c9a84c' }}>Module Overview</h3>
          <div className="space-y-2.5">
            {stats.mods.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: `${m.color}0F`, border: `1px solid ${m.color}22` }}>
                <span className="text-lg">{m.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate" style={{ color: m.color }}>{m.title}</div>
                  <div className="text-[10px]" style={{ color: '#4a6080' }}>{(m.tags || []).join(", ")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
