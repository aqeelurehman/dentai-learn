/**
 * pages/student/CasesPage.jsx
 */
import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { CasesAPI } from "../../backend/api.js";
import { Button, Badge, DifficultyBadge, Spinner, SectionHeader, EmptyState } from "../../components/ui/index.jsx";

function CaseDetail({ c, solved, onBack, onSolve }) {
  const [guess, setGuess] = useState(null);
  const [submitted, setSubmitted] = useState(!!solved);
  const s = solved;

  const submit = () => {
    if (!guess) return;
    onSolve(c.id, { correct: guess === c.answer, guess, date: new Date().toLocaleDateString() });
    setSubmitted(true);
  };

  return (
    <div className="animate-fade-up space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack} className="text-xs">← All Cases</Button>
        <div className="flex gap-2 flex-wrap">
          {c.tags.map(t => <Badge key={t} color="#c9a84c">{t}</Badge>)}
          <DifficultyBadge level={c.difficulty} />
          {s && <Badge color={s.correct ? "#10B981" : "#EF4444"}>{s.correct ? "✓ Solved" : "✗ Attempted"}</Badge>}
        </div>
      </div>

      <h1 className="font-display gold-text text-xl tracking-widest uppercase">{c.title}</h1>

      <div className="grid grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}>
          <h3 className="text-sm font-black mb-3 uppercase tracking-widest" style={{ color: '#c9a84c' }}>📋 Patient History</h3>
          <p className="text-sm leading-relaxed" style={{ color: '#4a6080' }}>{c.history}</p>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}>
          <h3 className="text-sm font-black mb-3 uppercase tracking-widest" style={{ color: '#8B5CF6' }}>🩻 Clinical Findings</h3>
          <p className="text-sm leading-relaxed" style={{ color: '#4a6080' }}>{c.findings}</p>
        </div>
      </div>

      <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}>
        <h3 className="text-base font-black mb-4 uppercase tracking-widest" style={{ color: '#c9a84c' }}>🔍 Your Diagnosis</h3>
        {!submitted ? (
          <>
            <div className="space-y-2 mb-5">
              {c.ddx.map(d => (
                <div
                  key={d}
                  onClick={() => setGuess(d)}
                  className="p-3 rounded-xl cursor-pointer transition-all text-sm font-medium"
                  style={
                    guess === d
                      ? { border: '1px solid #c9a84c', background: 'rgba(201,168,76,0.15)', color: '#c9a84c' }
                      : { border: '1px solid rgba(201,168,76,0.14)', background: 'rgba(0,0,0,0.3)', color: '#e8edf5' }
                  }
                >
                  {d}
                </div>
              ))}
            </div>
            <Button onClick={submit} disabled={!guess} className={!guess ? "opacity-50 cursor-not-allowed" : ""}>
              Submit Diagnosis
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl" style={s?.correct ? { border: '1px solid rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.1)' } : { border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)' }}>
              <div className="font-black mb-1" style={{ color: s?.correct ? '#10B981' : '#EF4444' }}>
                {s?.correct ? "✅ Correct Diagnosis!" : `❌ Not quite — Answer: ${c.answer}`}
              </div>
              <div className="text-xs" style={{ color: '#4a6080' }}>Your answer: {s?.guess}</div>
            </div>
            <div className="p-4 rounded-xl" style={{ border: '1px solid rgba(201,168,76,0.25)', background: 'rgba(201,168,76,0.08)' }}>
              <div className="text-sm font-bold mb-2" style={{ color: '#c9a84c' }}>💡 Explanation</div>
              <div className="text-xs leading-relaxed" style={{ color: '#4a6080' }}>{c.explanation}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CasesPage() {
  const { user, showToast } = useApp();
  const [cases, setCases]   = useState([]);
  const [solved, setSolved] = useState({});
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [cs, sv] = await Promise.all([CasesAPI.getAll(), CasesAPI.getSolved(user.id)]);
      setCases(cs); setSolved(sv); setLoading(false);
    })();
  }, []);

  const handleSolve = async (caseId, data) => {
    const sv = await CasesAPI.saveSolved(user.id, caseId, data);
    setSolved(sv);
    showToast(data.correct ? "🎉 Correct diagnosis!" : `Answer: ${cases.find(c => c.id === caseId)?.answer}`, data.correct ? "success" : "error");
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner size={40} color="#c9a84c" /></div>;
  if (active) return <CaseDetail c={active} solved={solved[active.id]} onBack={() => setActive(null)} onSolve={handleSolve} />;

  const filtered = cases.filter(c =>
    filter === "all" ? true : filter === "solved" ? solved[c.id] : !solved[c.id]
  );

  return (
    <div className="animate-fade-up">
      <SectionHeader title="🔍 Clinical Case Studies" subtitle="Practice diagnosis with real clinical scenarios" />

      <div className="flex gap-2 mb-5">
        {[["all","All Cases"],["unsolved","Unsolved"],["solved","Solved"]].map(([v, l]) => (
          <Button key={v} variant={filter === v ? "primary" : "ghost"} onClick={() => setFilter(v)} className="text-xs">
            {l}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🔍" title="No cases found" desc="Try changing your filter" />
      ) : (
        <div className="space-y-3">
          {filtered.map(c => {
            const s = solved[c.id];
            return (
              <div
                key={c.id}
                onClick={() => setActive(c)}
                className="flex items-center gap-4 cursor-pointer transition-all p-5 rounded-2xl hover:shadow-lg"
                style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: 'linear-gradient(135deg, #a07820, #c9a84c)' }}>🔍</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm mb-2" style={{ color: '#e8edf5' }}>{c.title}</div>
                  <div className="flex gap-2 flex-wrap">
                    {c.tags.map(t => <Badge key={t} color="#c9a84c" className="text-[10px]">{t}</Badge>)}
                    <DifficultyBadge level={c.difficulty} />
                  </div>
                </div>
                {s
                  ? <Badge color={s.correct ? "#10B981" : "#EF4444"}>{s.correct ? "✓ Solved" : "✗ Attempted"}</Badge>
                  : <Button className="shrink-0 text-xs">Attempt →</Button>
                }
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
