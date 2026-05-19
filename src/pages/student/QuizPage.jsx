/**
 * pages/student/QuizPage.jsx
 * Premium DentAI Learn quiz — gold/navy theme with timer ring.
 */
import { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { QuizAPI, ModulesAPI } from "../../backend/api.js";
import { Button, Badge, DifficultyBadge, Spinner, SectionHeader, ProgressBar } from "../../components/ui/index.jsx";

function fmt(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }

// ── Quiz Config ───────────────────────────────────────────────────────────────
function QuizConfig({ bank, modules, onStart }) {
  const [cfg, setCfg] = useState({ module: "all", difficulty: "all", count: "5" });

  const pool = bank.filter(q =>
    (cfg.module === "all" || q.moduleId === cfg.module) &&
    (cfg.difficulty === "all" || q.difficulty === cfg.difficulty)
  );

  return (
    <div className="animate-fade-up max-w-lg">
      <SectionHeader title="Quiz Preparation" subtitle="Configure and test your knowledge" />
      <div className="card space-y-5">
        <div>
          <label className="label">Module</label>
          <select value={cfg.module} onChange={e => setCfg(c => ({ ...c, module: e.target.value }))} className="input-field">
            <option value="all">All Modules ({bank.length} questions)</option>
            {modules.map(m => (
              <option key={m.id} value={m.id}>{m.emoji} {m.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Difficulty</label>
          <select value={cfg.difficulty} onChange={e => setCfg(c => ({ ...c, difficulty: e.target.value }))} className="input-field">
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div>
          <label className="label">Number of Questions</label>
          <select value={cfg.count} onChange={e => setCfg(c => ({ ...c, count: e.target.value }))} className="input-field">
            {[3, 5, 7, 10].map(n => <option key={n} value={n}>{n} questions</option>)}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3 p-4 rounded-xl text-center" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(201,168,76,0.1)' }}>
          {[["Available", pool.length], ["You'll get", Math.min(pool.length, parseInt(cfg.count))], ["Pass mark", "60%"]].map(([l, v]) => (
            <div key={l}>
              <div className="text-lg font-black gold-text">{v}</div>
              <div className="text-xs" style={{ color: '#4a6080' }}>{l}</div>
            </div>
          ))}
        </div>

        <Button
          className="w-full py-3"
          onClick={() => pool.length ? onStart(pool.sort(() => Math.random() - 0.5).slice(0, parseInt(cfg.count))) : null}
          disabled={pool.length === 0}
        >
          {pool.length === 0 ? "No questions for this filter" : "🚀 Start Quiz"}
        </Button>
      </div>
    </div>
  );
}

// ── Quiz Taking ───────────────────────────────────────────────────────────────
function QuizTaking({ questions, onDone }) {
  const [curr, setCurr]     = useState(0);
  const [picked, setPicked] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer]   = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    ref.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(ref.current);
  }, []);

  const q = questions[curr];
  const prog = (curr / questions.length) * 100;

  const pick = (i) => { if (picked !== null) return; setPicked(i); };

  const next = () => {
    const na = [...answers, picked];
    if (curr + 1 >= questions.length) {
      clearInterval(ref.current);
      onDone(na, timer);
    } else {
      setAnswers(na);
      setCurr(c => c + 1);
      setPicked(null);
    }
  };

  return (
    <div className="max-w-xl animate-fade-up">
      {/* Header with timer ring */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="font-display font-bold text-sm gold-text tracking-widest">ORAL PATHOLOGY QUIZ</h2>
        </div>
        <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-sm" style={{ border: '2.5px solid #c9a84c', color: '#c9a84c', boxShadow: '0 0 14px rgba(201,168,76,0.3)' }}>
          {fmt(timer)}
        </div>
      </div>

      {/* Progress pips */}
      <div className="flex items-center gap-1.5 mb-4">
        {questions.map((_, i) => (
          <div key={i} className="rounded-md text-[10px] font-black flex items-center justify-center" style={{
            width: i === curr ? '28px' : '20px',
            height: '10px',
            background: i < curr ? 'rgba(201,168,76,0.4)' : i === curr ? 'linear-gradient(135deg, #a07820, #c9a84c)' : 'rgba(201,168,76,0.15)',
            color: i === curr ? '#fff' : '#4a6080'
          }}>
            {i === curr ? curr + 1 : ''}
          </div>
        ))}
        <span className="ml-auto text-[10px] font-bold" style={{ color: '#4a6080' }}>{curr + 1}/{questions.length}</span>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold" style={{ color: '#c9a84c' }}>Question {curr + 1}</span>
          <DifficultyBadge level={q.difficulty} />
        </div>
        <p className="text-base font-medium leading-relaxed mb-5" style={{ color: '#e8edf5' }}>{q.q}</p>

        <div className="space-y-2.5">
          {q.options.map((opt, i) => {
            let bg = 'rgba(13,21,37,0.9)';
            let bc = 'rgba(201,168,76,0.15)';
            let tc = '#c8d5e5';
            let lbg = 'rgba(201,168,76,0.15)';
            let lbc = 'rgba(201,168,76,0.3)';
            let lc = '#c9a84c';

            if (picked !== null) {
              if (i === q.correct) {
                bg = 'rgba(16,185,129,0.12)'; bc = '#10B981'; tc = '#10B981';
                lbg = '#10B981'; lbc = '#10B981'; lc = '#fff';
              } else if (i === picked) {
                bg = 'rgba(239,68,68,0.12)'; bc = '#EF4444'; tc = '#EF4444';
                lbg = '#EF4444'; lbc = '#EF4444'; lc = '#fff';
              }
            } else if (i === picked) {
              bc = '#c9a84c'; bg = 'rgba(201,168,76,0.1)'; tc = '#f0d080';
              lbg = 'linear-gradient(135deg, #a07820, #c9a84c)'; lbc = '#c9a84c'; lc = '#fff';
            }

            return (
              <div
                key={i}
                onClick={() => pick(i)}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200"
                style={{ background: bg, border: `1px solid ${bc}`, color: tc }}
              >
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0" style={{ background: lbg, border: `1px solid ${lbc}`, color: lc }}>
                  {["A","B","C","D"][i]}
                </span>
                <span className="text-sm flex-1">{opt}</span>
                {picked !== null && i === q.correct && <span>✓</span>}
                {picked !== null && i === picked && picked !== q.correct && <span>✗</span>}
              </div>
            );
          })}
        </div>

        {picked !== null && (
          <div className="mt-4 p-3 rounded-xl text-xs leading-relaxed" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.18)', color: '#9aacbe' }}>
            <span className="font-bold" style={{ color: '#c9a84c' }}>💡 Explanation: </span>
            {q.explanation}
          </div>
        )}
      </div>

      {picked !== null && (
        <Button className="w-full mt-4 py-3" onClick={next}>
          {curr + 1 < questions.length ? "Next Question →" : "View Results"}
        </Button>
      )}
    </div>
  );
}

// ── Quiz Results with Score Ring ──────────────────────────────────────────────
function QuizResults({ questions, answers, timer, onRetake }) {
  const score = answers.filter((a, i) => a === questions[i].correct).length;
  const pct   = Math.round((score / questions.length) * 100);

  return (
    <div className="max-w-xl animate-fade-up">
      <h2 className="text-center font-display font-black text-lg gold-text tracking-widest mb-5">QUIZ RESULTS</h2>

      <div className="card text-center mb-5">
        {/* Score Ring */}
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{
            background: `conic-gradient(#c9a84c 0% ${pct}%, rgba(201,168,76,0.1) ${pct}% 100%)`,
            boxShadow: '0 0 24px rgba(201,168,76,0.3)'
          }}>
            <div className="w-[78px] h-[78px] rounded-full flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a1428, #0d1e38)' }}>
              <span className="text-2xl font-black gold-text leading-none">{pct}%</span>
              <span className="text-[10px]" style={{ color: '#4a6080' }}>Score</span>
            </div>
          </div>
        </div>
        <div className="text-sm font-bold" style={{ color: '#c9a84c' }}>
          {pct >= 80 ? "🏆 Excellent!" : pct >= 60 ? "✅ Passed" : "📚 Keep Studying"}
        </div>
      </div>

      {/* Analytics grid */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[["✅", score, "Correct"], ["❌", questions.length - score, "Wrong"], ["⏱", fmt(timer), "Time"], ["📊", `${pct}%`, "Score"]].map(([icon, v, l]) => (
          <div key={l} className="card text-center p-3">
            <div className="text-lg">{icon}</div>
            <div className="text-lg font-black gold-text">{v}</div>
            <div className="text-[10px]" style={{ color: '#4a6080' }}>{l}</div>
          </div>
        ))}
      </div>

      <div className="card mb-5">
        <h3 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>Answer Review</h3>
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {questions.map((q, i) => (
            <div key={i} className="flex gap-3 items-start py-2" style={{ borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
              <span className="text-lg mt-0.5">{answers[i] === q.correct ? "✅" : "❌"}</span>
              <div className="text-xs">
                <div className="font-bold mb-1" style={{ color: '#e8edf5' }}>{q.q}</div>
                <div style={{ color: answers[i] === q.correct ? "#10B981" : "#EF4444" }}>
                  Your answer: {q.options[answers[i]]}
                </div>
                {answers[i] !== q.correct && (
                  <div style={{ color: '#10B981' }}>Correct: {q.options[q.correct]}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button onClick={onRetake}>Try Another Quiz</Button>
        <Button variant="ghost" onClick={onRetake}>Back to Config</Button>
      </div>
    </div>
  );
}

// ── Main Quiz Page ────────────────────────────────────────────────────────────
export default function QuizPage() {
  const { user, showToast } = useApp();
  const [bank, setBank]       = useState([]);
  const [modules, setModules] = useState([]);
  const [phase, setPhase]     = useState("config");
  const [questions, setQs]    = useState([]);
  const [answers, setAnswers] = useState([]);
  const [time, setTime]       = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([QuizAPI.getBank(), ModulesAPI.getAll()]).then(([b, m]) => {
      setBank(b); setModules(m); setLoading(false);
    });
  }, []);

  const handleStart = (qs) => { setQs(qs); setPhase("taking"); };

  const handleDone = async (ans, t) => {
    const score = ans.filter((a, i) => a === questions[i].correct).length;
    const pct   = Math.round((score / questions.length) * 100);
    setAnswers(ans);
    setTime(t);
    await QuizAPI.saveResult(user.id, {
      title: "Mixed Quiz",
      score, total: questions.length, pct,
      userId: user.id, name: user.name, roll: user.roll,
      quizTitle: "Mixed Quiz",
    });
    showToast(pct >= 60 ? "🎉 Quiz passed!" : "Quiz complete — keep studying!");
    setPhase("result");
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner size={40} color="#c9a84c" /></div>;

  if (phase === "taking") return <QuizTaking questions={questions} onDone={handleDone} />;
  if (phase === "result") return <QuizResults questions={questions} answers={answers} timer={time} onRetake={() => setPhase("config")} />;
  return <QuizConfig bank={bank} modules={modules} onStart={handleStart} />;
}
