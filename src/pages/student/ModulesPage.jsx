/**
 * pages/student/ModulesPage.jsx
 */
import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { ModulesAPI, ProgressAPI, NotesAPI, BookmarksAPI, ClaudeAPI } from "../../backend/api.js";
import { Button, Badge, ProgressBar, Spinner, SectionHeader } from "../../components/ui/index.jsx";

const ToothModel3D = lazy(() => import("../../components/3d/ToothModel.jsx"));

// ── Module Quiz ──────────────────────────────────────────────────────────────
function ModuleQuiz({ questions, onDone }) {
  const [curr, setCurr] = useState(0);
  const [picked, setPicked] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [done, setDone] = useState(false);

  const q = questions[curr];

  const next = () => {
    const na = [...answers, picked];
    if (curr + 1 >= questions.length) { setAnswers(na); setDone(true); }
    else { setAnswers(na); setCurr(c => c + 1); setPicked(null); }
  };

  if (done) {
    const score = answers.filter((a, i) => a === questions[i].correct).length;
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-lg mx-auto text-center py-10 p-5 rounded-2xl" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}>
        <div className="text-6xl mb-3">{pct >= 60 ? "🎉" : "📚"}</div>
        <div className="text-4xl font-black mb-2" style={{ color: pct >= 60 ? "#10B981" : "#F59E0B" }}>{pct}%</div>
        <div className="text-sm mb-6" style={{ color: '#4a6080' }}>{score}/{questions.length} correct</div>
        <Button onClick={onDone}>← Back to Module</Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-5 rounded-2xl" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}>
      <div className="text-xs mb-4" style={{ color: '#4a6080' }}>Module Quiz · Q{curr + 1}/{questions.length}</div>
      <p className="text-base font-bold leading-relaxed mb-5" style={{ color: '#e8edf5' }}>{q.q}</p>
      <div className="space-y-2 mb-4">
        {q.options.map((opt, i) => {
          let stl = { background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(201,168,76,0.14)', color: '#e8edf5' };
          if (picked !== null) {
            if (i === q.correct) stl = { background: 'rgba(16,185,129,0.15)', borderColor: '#10B981', color: '#10B981' };
            else if (i === picked) stl = { background: 'rgba(239,68,68,0.15)', borderColor: '#EF4444', color: '#EF4444' };
          }
          return (
            <div key={i} onClick={() => picked === null && setPicked(i)}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all text-sm"
              style={{ border: '1px solid', ...stl }}>
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                style={{ border: '1px solid', ...stl }}>
                {["A","B","C","D"][i]}
              </span>
              {opt}
            </div>
          );
        })}
      </div>
      {picked !== null && q.explanation && (
        <div className="p-3 rounded-xl text-xs mb-4" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', color: '#4a6080' }}>
          💡 {q.explanation}
        </div>
      )}
      {picked !== null && (
        <Button className="w-full" onClick={next}>
          {curr + 1 < questions.length ? "Next →" : "Finish Quiz"}
        </Button>
      )}
    </div>
  );
}

// ── 3D Tooth Model (Three.js powered with lazy loading) ──────────────────────
function ToothModel({ color = "#c9a84c", moduleId, modelPath }) {
  const [use3D, setUse3D] = useState(false);
  const [showCyst, setShowCyst] = useState(false);
  const [showLabels, setShowLabels] = useState(true);

  // Fallback CSS 3D model
  const [rx, setRx] = useState(12);
  const [ry, setRy] = useState(-20);
  const [drag, setDrag] = useState(false);
  const last = useRef(null);
  const down = (e) => { setDrag(true); last.current = { x: e.clientX ?? e.touches?.[0]?.clientX, y: e.clientY ?? e.touches?.[0]?.clientY }; };
  const move = (e) => { if (!drag) return; const cx = e.clientX ?? e.touches?.[0]?.clientX; const cy = e.clientY ?? e.touches?.[0]?.clientY; setRy(r => r + (cx - last.current.x) * 0.55); setRx(r => r - (cy - last.current.y) * 0.55); last.current = { x: cx, y: cy }; };
  const up = () => setDrag(false);

  if (use3D) {
    return (
      <div className="space-y-2">
        <Suspense fallback={<div className="h-64 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)' }}><Spinner size={32} color="#c9a84c" /><span className="ml-2 text-xs" style={{ color: '#4a6080' }}>Loading 3D Engine...</span></div>}>
          <ToothModel3D height={260} modelPath={modelPath || "/models/tooth.glb"} showPulp={true} showLabels={showLabels} autoRotate={true} />
        </Suspense>
        <div className="flex gap-2">
          <button onClick={() => setShowLabels(!showLabels)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all`}
            style={showLabels ? { background: 'rgba(201,168,76,0.2)', borderColor: '#c9a84c', color: '#c9a84c' } : { borderColor: 'rgba(201,168,76,0.14)', color: '#4a6080' }}>
            {showLabels ? "Hide" : "Show"} Labels
          </button>
          <button onClick={() => setShowCyst(!showCyst)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all`}
            style={showCyst ? { background: 'rgba(139,92,246,0.2)', borderColor: '#8B5CF6', color: '#8B5CF6' } : { borderColor: 'rgba(201,168,76,0.14)', color: '#4a6080' }}>
            {showCyst ? "Hide" : "Show"} Cyst
          </button>
          <button onClick={() => setUse3D(false)} className="flex-1 py-1.5 rounded-lg text-[10px] font-bold border" style={{ borderColor: 'rgba(201,168,76,0.14)', color: '#4a6080' }}>
            Simple View
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up} onTouchStart={down} onTouchMove={move} onTouchEnd={up}
        className="relative w-full h-64 rounded-2xl flex items-center justify-center select-none overflow-hidden"
        style={{ background: "radial-gradient(ellipse at center, #1a2840 0%, #07090F 100%)", cursor: drag ? "grabbing" : "grab" }}>
        {[["top-3 left-3 border-t-2 border-l-2"],["top-3 right-3 border-t-2 border-r-2"],["bottom-3 left-3 border-b-2 border-l-2"],["bottom-3 right-3 border-b-2 border-r-2"]].map(([cls], i) => (
          <div key={i} className={`absolute w-5 h-5 ${cls}`} style={{ borderColor: color }} />
        ))}
        <div style={{ perspective: 600 }}>
          <div style={{ transform: `rotateX(${rx}deg) rotateY(${ry}deg)`, transformStyle: "preserve-3d", transition: drag ? "none" : "transform 0.4s ease" }}>
            <div className="relative mx-auto" style={{ width: 76, height: 54, background: "linear-gradient(135deg,#ede0c8,#c9b89a)", borderRadius: "38% 38% 24% 24%", boxShadow: "0 4px 20px rgba(0,0,0,0.55),inset 0 2px 8px rgba(255,255,255,0.3)" }}>
              {[0,1,2,3].map(i => (<div key={i} style={{ position: "absolute", width: 16, height: 13, background: "#d4c3a8", borderRadius: "50% 50% 20% 20%", top: -8, left: 4 + i * 17, boxShadow: "0 2px 4px rgba(0,0,0,0.35)" }} />))}
            </div>
            <div className="mx-auto" style={{ width: 58, height: 18, background: "linear-gradient(135deg,#c9b89a,#b8a888)", marginTop: -4, borderRadius: "0 0 30% 30%" }} />
            <div className="mx-auto" style={{ width: 20, height: 64, background: `linear-gradient(180deg,#b8a888,${color}bb)`, borderRadius: "8px 8px 50% 50%", boxShadow: `0 4px 20px ${color}44` }} />
          </div>
        </div>
        <div className="absolute top-3 left-3 text-xs opacity-70" style={{ color: '#c9a84c' }}>⟳ Drag</div>
        {[["Crown", "top-14 right-6", "#c9a84c"], ["CEJ", "top-28 right-6", "#8B5CF6"], ["Root", "bottom-10 right-6", color]].map(([l, pos, c]) => (
          <div key={l} className={`absolute text-xs font-bold px-2 py-0.5 rounded-full border ${pos}`} style={{ color: c, borderColor: `${c}55`, background: `${c}18` }}>{l}</div>
        ))}
      </div>
      <button onClick={() => setUse3D(true)} className="w-full py-2 rounded-lg text-xs font-bold border transition-all hover:opacity-90"
        style={{ borderColor: 'rgba(201,168,76,0.4)', color: '#c9a84c', background: 'rgba(201,168,76,0.1)' }}>
        🔬 Switch to Interactive 3D View (Three.js)
      </button>
    </div>
  );
}

// ── Module Detail ─────────────────────────────────────────────────────────────
function ModuleDetail({ mod, onBack, onQuiz }) {
  const { user, showToast } = useApp();
  const [notes, setNotes]       = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const [progress, setProgress]   = useState(0);
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    (async () => {
      const [n, bm, prog] = await Promise.all([
        NotesAPI.get(user.id, mod.id),
        BookmarksAPI.get(user.id),
        ProgressAPI.get(user.id),
      ]);
      setNotes(n);
      setBookmarks(bm);
      setProgress(prog[mod.id] || 0);
    })();
  }, [mod.id]);

  const saveNote = async () => {
    setSaving(true);
    await NotesAPI.save(user.id, mod.id, notes);
    setSaving(false);
    showToast("Notes saved!");
  };

  const toggleBookmark = async () => {
    const bm = await BookmarksAPI.toggle(user.id, mod.id);
    setBookmarks(bm);
    showToast(bm.includes(mod.id) ? "Bookmarked!" : "Bookmark removed");
  };

  const setProgressTo = async (pct) => {
    await ProgressAPI.set(user.id, mod.id, pct);
    setProgress(pct);
    showToast(`Progress set to ${pct}%`);
  };

  const isBookmarked = bookmarks.includes(mod.id);

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="text-xs">← Back</Button>
        {mod.image ? (
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <img src={mod.image} alt={mod.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <span className="text-3xl">{mod.emoji}</span>
        )}
        <div className="flex-1">
          <h1 className="font-display gold-text text-xl tracking-widest uppercase" style={{ color: mod.color }}>{mod.title}</h1>
          <p className="text-sm" style={{ color: '#4a6080' }}>{mod.desc}</p>
        </div>
        <button
          onClick={toggleBookmark}
          className="text-2xl hover:scale-110 transition-transform"
          title={isBookmarked ? "Remove bookmark" : "Bookmark"}
        >
          {isBookmarked ? "🔖" : "🏷️"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-5">
          {/* 3D Model */}
          <ToothModel color={mod.color} moduleId={mod.id} modelPath={mod.model} />

          {/* Progress */}
          <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}>
            <h3 className="text-sm font-black mb-3 uppercase tracking-widest" style={{ color: '#c9a84c' }}>📊 Track Your Progress</h3>
            <ProgressBar value={progress} color={mod.color} height="h-2" />
            <div className="flex gap-2 mt-3">
              {[25, 50, 75, 100].map(p => (
                <button
                  key={p}
                  onClick={() => setProgressTo(p)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border`}
                  style={progress >= p ? { background: mod.color, color: '#fff', borderColor: 'transparent' } : { color: '#4a6080', borderColor: 'rgba(201,168,76,0.14)' }}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* Study Content */}
          <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 rounded-full text-xs font-bold border" style={{ color: mod.color, borderColor: `${mod.color}44`, background: `${mod.color}18` }}>📖 Study Material</span>
            </div>
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {(mod.content || "").split("\n\n").map((para, i) => {
                const boldMatch = para.match(/^\*\*(.*?)\*\*\s*—\s*(.*)/);
                if (boldMatch) {
                  return (
                    <div key={i}>
                      <div className="text-sm font-black mb-1" style={{ color: mod.color }}>
                        {boldMatch[1]}
                      </div>
                      <div className="text-xs leading-relaxed" style={{ color: '#4a6080' }}>{boldMatch[2]}</div>
                    </div>
                  );
                }
                return <div key={i} className="text-xs leading-relaxed" style={{ color: '#4a6080' }}>{para}</div>;
              })}
            </div>
            <div className="flex gap-2 flex-wrap mt-4 pt-3" style={{ borderTop: '1px solid rgba(201,168,76,0.14)' }}>
              {(mod.tags || []).map(t => (
                <Badge key={t} color={mod.color}>{t}</Badge>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}>
            <h3 className="text-sm font-black mb-3 uppercase tracking-widest" style={{ color: '#c9a84c' }}>📝 My Notes</h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Write your personal study notes here…"
              className="w-full rounded-xl resize-none h-28 text-xs mb-3 p-3 outline-none placeholder-gray-500"
              style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
            />
            <Button variant="success" onClick={saveNote} disabled={saving} className="text-xs">
              {saving ? "Saving…" : "💾 Save Notes"}
            </Button>
          </div>

          {/* Quiz button for modules with embedded questions */}
          {mod.questions?.length > 0 && (
            <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}>
              <h3 className="text-sm font-black mb-2 uppercase tracking-widest" style={{ color: '#c9a84c' }}>🎯 Module Quiz</h3>
              <p className="text-xs mb-3" style={{ color: '#4a6080' }}>{mod.questions.length} questions generated for this module</p>
              <Button onClick={() => onQuiz && onQuiz(mod.questions)} className="w-full text-xs">
                Start {mod.questions.length}-Question Quiz
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Modules List ──────────────────────────────────────────────────────────────
export default function ModulesPage() {
  const { user, showToast } = useApp();
  const [modules, setModules]   = useState([]);
  const [progress, setProgress] = useState({});
  const [active, setActive]     = useState(null);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);

  // Generate module state
  const [genOpen, setGenOpen]       = useState(false);
  const [genTopic, setGenTopic]     = useState("");
  const [generating, setGenerating] = useState(false);
  // Module quiz state
  const [quizQs, setQuizQs]         = useState(null);

  useEffect(() => {
    (async () => {
      const [mods, prog] = await Promise.all([ModulesAPI.getAll(), ProgressAPI.get(user.id)]);
      setModules(mods);
      setProgress(prog);
      setLoading(false);
    })();
  }, [active]);

  const handleGenerate = async () => {
    if (!genTopic.trim() || genTopic.trim().length < 2) {
      showToast("Enter a topic (at least 2 characters)", "error");
      return;
    }
    setGenerating(true);
    try {
      const aiModule = await ClaudeAPI.generateModule(genTopic.trim());
      // Save as a real module
      const saved = await ModulesAPI.create({
        title: aiModule.title,
        emoji: aiModule.emoji || "📚",
        color: aiModule.color || "#3B82F6",
        desc: aiModule.desc || `AI-generated module on ${genTopic}`,
        tags: aiModule.tags || [],
        content: aiModule.content || "",
        questions: aiModule.questions || [],
        generated: true,
      });
      setModules(saved);
      setGenTopic("");
      setGenOpen(false);
      showToast(`Module "${aiModule.title}" generated with ${aiModule.questions?.length || 0} quiz questions!`);
    } catch (err) {
      showToast(err.message || "Failed to generate module", "error");
    } finally {
      setGenerating(false);
    }
  };

  // Show quiz for module-embedded questions
  if (quizQs) return <ModuleQuiz questions={quizQs} onDone={() => setQuizQs(null)} />;
  if (active) return <ModuleDetail mod={active} onBack={() => setActive(null)} onQuiz={(qs) => setQuizQs(qs)} />;
  if (loading) return <div className="flex justify-center py-16"><Spinner size={40} color="#c9a84c" /></div>;

  const filtered = modules.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-up">
      <SectionHeader title="3D Learning Modules" subtitle="Drag-to-rotate 3D models with full study content" />
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="🔍 Search modules…"
        className="mb-5 max-w-sm w-full rounded-xl p-3 text-sm outline-none placeholder-gray-500"
        style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
      />
      <div className="grid grid-cols-3 gap-4">
        {filtered.map(m => {
          const pct = progress[m.id] || 0;
          return (
            <div
              key={m.id}
              onClick={() => setActive(m)}
              className="p-5 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group"
              style={{ background: 'rgba(13,21,37,0.92)', border: `1px solid ${m.color}33` }}
            >
              {/* Module thumbnail */}
              {m.image ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden mb-3" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <img src={m.image} alt={m.title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {pct === 100 && <Badge color="#10B981">✓ Done</Badge>}
                    {pct > 0 && pct < 100 && <Badge color={m.color}>{pct}%</Badge>}
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start mb-3">
                  <span className="text-3xl">{m.emoji}</span>
                  {pct === 100 && <Badge color="#10B981">✓ Done</Badge>}
                  {pct > 0 && pct < 100 && <Badge color={m.color}>{pct}%</Badge>}
                </div>
              )}
              <h3 className="font-black text-sm mb-1 uppercase tracking-widest" style={{ color: '#c9a84c' }}>{m.title}</h3>
              <p className="text-xs mb-4" style={{ color: '#4a6080' }}>{m.desc}</p>
              <ProgressBar value={pct} color={m.color} />
              <div className="flex gap-2 mt-3 flex-wrap">
                {(m.tags || []).slice(0, 2).map(t => (
                  <Badge key={t} color={m.color} className="text-[10px]">{t}</Badge>
                ))}
              </div>
              <div className="text-xs mt-3 font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: m.color }}>
                Open Module →
              </div>
            </div>
          );
        })}

        {/* ── Generate Module Card ─────────────────────────────── */}
        <div
          onClick={() => setGenOpen(true)}
          className="p-5 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group flex flex-col items-center justify-center min-h-[220px]"
          style={{ background: 'rgba(13,21,37,0.92)', border: '1px dashed rgba(201,168,76,0.35)' }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
            style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))', border: '1px solid rgba(201,168,76,0.25)' }}>
            <span className="text-3xl">✨</span>
          </div>
          <h3 className="font-black text-sm mb-1 uppercase tracking-widest text-center" style={{ color: '#c9a84c' }}>
            Generate Module
          </h3>
          <p className="text-xs text-center" style={{ color: '#4a6080' }}>
            Enter any dental topic and AI will create a full study module with quiz
          </p>
          <div className="text-xs mt-3 font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#c9a84c' }}>
            Create with AI →
          </div>
        </div>
      </div>

      {/* ── Generate Module Modal ─────────────────────────────── */}
      {genOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => !generating && setGenOpen(false)}>
          <div className="w-full max-w-md p-6 rounded-2xl animate-fade-up" style={{ background: 'rgba(13,21,37,0.98)', border: '1px solid rgba(201,168,76,0.25)' }} onClick={e => e.stopPropagation()}>
            <h2 className="font-display text-lg tracking-widest uppercase mb-1" style={{ color: '#c9a84c' }}>
              ✨ Generate Study Module
            </h2>
            <p className="text-xs mb-5" style={{ color: '#4a6080' }}>
              Enter a dental/medical topic. AI will generate study content, key terms, and 5 quiz questions.
            </p>

            <input
              value={genTopic}
              onChange={e => setGenTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !generating && handleGenerate()}
              placeholder="e.g. Dental Implant Failures, Oral Candidiasis, TMJ Disorders…"
              disabled={generating}
              autoFocus
              className="w-full rounded-xl p-3 text-sm outline-none placeholder-gray-500 mb-4"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(201,168,76,0.2)', color: '#e8edf5' }}
            />

            {/* Topic suggestions */}
            <div className="flex flex-wrap gap-2 mb-5">
              {["Oral Cancer", "Dental Implants", "TMJ Disorders", "Periodontal Disease", "Cleft Lip & Palate", "Oral Candidiasis"].map(t => (
                <button
                  key={t}
                  onClick={() => !generating && setGenTopic(t)}
                  className="px-3 py-1 rounded-full text-[10px] font-bold transition-all hover:scale-105"
                  style={{
                    background: genTopic === t ? 'rgba(201,168,76,0.2)' : 'rgba(0,0,0,0.3)',
                    border: `1px solid ${genTopic === t ? '#c9a84c' : 'rgba(201,168,76,0.14)'}`,
                    color: genTopic === t ? '#c9a84c' : '#4a6080',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {generating && (
              <div className="flex items-center justify-center gap-3 py-4 mb-4 rounded-xl" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)' }}>
                <Spinner size={24} color="#c9a84c" />
                <div>
                  <div className="text-xs font-bold" style={{ color: '#c9a84c' }}>Generating module...</div>
                  <div className="text-[10px]" style={{ color: '#4a6080' }}>Creating content, terms & quiz questions</div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={handleGenerate} disabled={generating || !genTopic.trim()} className="flex-1">
                {generating ? "Generating…" : "🚀 Generate Module"}
              </Button>
              <button
                onClick={() => setGenOpen(false)}
                disabled={generating}
                className="px-4 py-2 rounded-lg text-xs font-bold border transition-all"
                style={{ borderColor: 'rgba(201,168,76,0.2)', color: '#4a6080' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
