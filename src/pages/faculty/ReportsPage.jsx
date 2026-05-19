/**
 * pages/faculty/ReportsPage.jsx
 */
import { useState, useEffect } from "react";
import { QuizAPI, UsersAPI } from "../../backend/api.js";
import { StatCard, Badge, Spinner, Button, SectionHeader } from "../../components/ui/index.jsx";

export default function ReportsPage() {
  const [results, setResults]   = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [sort, setSort]         = useState("date");
  const [filter, setFilter]     = useState("all");
  const [search, setSearch]     = useState("");

  const load = async () => {
    setLoading(true);
    const [r, s] = await Promise.all([QuizAPI.getAllResults(), UsersAPI.getStudents()]);
    setResults(r); setStudents(s); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex justify-center py-16"><Spinner size={40} color="#c9a84c" /></div>;

  const avg    = results.length ? Math.round(results.reduce((s, r) => s + r.pct, 0) / results.length) : 0;
  const passed = results.filter(r => r.pct >= 60).length;

  let filtered = [...results];
  if (filter === "pass")   filtered = filtered.filter(r => r.pct >= 60);
  if (filter === "fail")   filtered = filtered.filter(r => r.pct < 60);
  if (search)              filtered = filtered.filter(r => r.name?.toLowerCase().includes(search.toLowerCase()) || r.roll?.toLowerCase().includes(search.toLowerCase()));
  if (sort === "score")    filtered.sort((a, b) => b.pct - a.pct);
  else if (sort === "name") filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  else                     filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Score distribution buckets 0-9,10-19,...,90-100
  const buckets = Array.from({ length: 10 }, (_, i) => ({
    label: `${i * 10}`,
    count: results.filter(r => r.pct >= i * 10 && r.pct < (i + 1) * 10 || (i === 9 && r.pct === 100)).length,
  }));
  const maxBucket = Math.max(...buckets.map(b => b.count), 1);

  return (
    <div className="animate-fade-up">
      <SectionHeader
        title={<span className="font-display gold-text">Student Reports</span>}
        subtitle="All student quiz performance data"
        action={<Button variant="ghost" className="text-xs" onClick={load} style={{ color: '#c9a84c' }}>Refresh</Button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard icon="👥" value={students.length}  label="Total Students"  color="#c9a84c" />
        <StatCard icon="📝" value={results.length}   label="Quiz Attempts"   color="#c9a84c" />
        <StatCard icon="✅" value={results.length ? `${Math.round(passed / results.length * 100)}%` : "—"} label="Pass Rate" color="#10B981" />
        <StatCard icon="📊" value={results.length ? `${avg}%` : "—"} label="Class Average" color={avg >= 60 ? "#10B981" : "#F59E0B"} />
      </div>

      {/* Distribution chart */}
      {results.length > 0 && (
        <div className="mb-6" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)', borderRadius: '1rem', padding: '1.25rem' }}>
          <h3 className="text-sm font-black mb-4 uppercase tracking-widest" style={{ color: '#c9a84c' }}>Score Distribution</h3>
          <div className="flex items-end gap-1.5 h-24">
            {buckets.map(b => (
              <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t transition-all"
                  style={{
                    height: `${(b.count / maxBucket) * 80}px`,
                    minHeight: b.count ? 4 : 0,
                    background: parseInt(b.label) >= 60 ? "#10B981" : "#EF4444",
                    opacity: 0.75,
                  }}
                />
                <span className="text-[9px] font-mono" style={{ color: '#4a6080' }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)', borderRadius: '1rem', padding: '1.25rem' }}>
        <div className="flex gap-3 mb-4 flex-wrap items-center">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or roll..."
            className="w-56 text-xs rounded-lg px-3 py-2 outline-none"
            style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
          />
          <div className="flex gap-2">
            {[["all","All"],["pass","Passed"],["fail","Failed"]].map(([v, l]) => (
              <button
                key={v}
                className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all"
                style={filter === v
                  ? { background: 'linear-gradient(135deg, #a07820, #c9a84c)', color: '#fff', border: '1px solid transparent' }
                  : { background: 'transparent', color: '#4a6080', border: '1px solid rgba(201,168,76,0.18)' }
                }
                onClick={() => setFilter(v)}
              >{l}</button>
            ))}
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="w-36 text-xs ml-auto rounded-lg px-3 py-2 outline-none"
            style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
          >
            <option value="date">Sort: Date</option>
            <option value="score">Sort: Score</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-14" style={{ color: '#4a6080' }}>
            <div className="text-4xl mb-3">📋</div>
            No quiz results yet. Students need to complete quizzes first.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                  {["Student","Roll No","Quiz","Score","Status","Date"].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-xs font-bold uppercase tracking-widest" style={{ color: '#c9a84c' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                    <td className="px-3 py-2.5 font-semibold" style={{ color: '#e8edf5' }}>{r.name}</td>
                    <td className="px-3 py-2.5 font-mono text-xs" style={{ color: '#4a6080' }}>{r.roll}</td>
                    <td className="px-3 py-2.5 text-xs" style={{ color: '#4a6080' }}>{r.quizTitle}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(201,168,76,0.14)' }}>
                          <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.pct >= 60 ? "#10B981" : "#EF4444" }} />
                        </div>
                        <span className="font-black text-xs" style={{ color: r.pct >= 60 ? "#10B981" : "#EF4444" }}>{r.pct}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge color={r.pct >= 60 ? "#10B981" : "#EF4444"} className="text-[10px]">
                        {r.pct >= 60 ? "Pass" : "Fail"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-xs" style={{ color: '#4a6080' }}>{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
