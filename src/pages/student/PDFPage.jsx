/**
 * pages/student/PDFPage.jsx
 */
import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { UploadsAPI, ClaudeAPI } from "../../backend/api.js";
import { Button, Badge, Spinner, SectionHeader } from "../../components/ui/index.jsx";

// ── PDF Quiz ──────────────────────────────────────────────────────────────────
function PDFQuiz({ questions, onDone }) {
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
      <div className="text-center py-10 p-5 rounded-2xl" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}>
        <div className="text-6xl mb-3">{pct >= 60 ? "🎉" : "📚"}</div>
        <div className="text-4xl font-black mb-2" style={{ color: pct >= 60 ? "#10B981" : "#F59E0B" }}>{pct}%</div>
        <div className="text-sm mb-6" style={{ color: '#4a6080' }}>{score}/{questions.length} correct</div>
        <Button onClick={onDone}>Back to Upload</Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg p-5 rounded-2xl" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}>
      <div className="text-xs mb-4" style={{ color: '#4a6080' }}>PDF Quiz · Q{curr + 1}/{questions.length}</div>
      <p className="text-base font-bold leading-relaxed mb-5" style={{ color: '#e8edf5' }}>{q.q}</p>
      <div className="space-y-2 mb-4">
        {q.options.map((opt, i) => {
          let stl = { background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(201,168,76,0.14)', color: '#e8edf5' };
          if (picked !== null) {
            if (i === q.correct) stl = { background: 'rgba(16,185,129,0.15)', borderColor: '#10B981', color: '#10B981' };
            else if (i === picked) stl = { background: 'rgba(239,68,68,0.15)', borderColor: '#EF4444', color: '#EF4444' };
          }
          return (
            <div
              key={i}
              onClick={() => picked === null && setPicked(i)}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all text-sm"
              style={{ border: '1px solid', ...stl }}
            >
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0" style={{ border: '1px solid', ...stl }}>
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

// ── Main PDF Page ─────────────────────────────────────────────────────────────
export default function PDFPage() {
  const { user, showToast } = useApp();
  const [phase, setPhase] = useState("idle"); // idle | analyzing | done | quiz
  const [analysis, setAnalysis] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    UploadsAPI.getAll(user.id).then(setUploads);
  }, []);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") {
      showToast("Please upload a valid PDF file", "error");
      return;
    }
    setFileName(file.name);
    setPhase("analyzing");
    setAnalysis(null);

    try {
      // Send the actual File to server → PaddleOCR → Groq AI
      const result = await ClaudeAPI.analyzePDF(file);
      setAnalysis(result);
      const updated = await UploadsAPI.add(user.id, {
        name: file.name,
        size: file.size,
        date: new Date().toLocaleDateString(),
        topics: result.topics || [],
      });
      setUploads(updated);
      setPhase("done");
      showToast(`PDF analysed! ${result.ocrChars ? `(${result.ocrChars} chars extracted via OCR)` : ""}`);
    } catch (err) {
      setAnalysis({
        summary: `Analysis failed: ${err.message}. Try again or upload a different PDF.`,
        topics: [],
        keyTerms: [],
        questions: [],
      });
      setPhase("done");
      showToast(err.message || "PDF analysis failed", "error");
    }
  };

  if (phase === "quiz" && analysis?.questions?.length) {
    return <PDFQuiz questions={analysis.questions} onDone={() => setPhase("done")} />;
  }

  return (
    <div className="animate-fade-up">
      <SectionHeader title="📄 PDF Upload & Study" subtitle="Upload study material for AI analysis and auto-generated quizzes" />

      <div className="grid grid-cols-2 gap-6">
        {/* Upload panel */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}>
            <h3 className="text-sm font-black mb-4 uppercase tracking-widest" style={{ color: '#c9a84c' }}>Upload PDF</h3>

            {phase === "idle" && (
              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors"
                style={{ borderColor: 'rgba(201,168,76,0.25)', background: 'rgba(0,0,0,0.3)' }}>
                <div className="text-4xl mb-3">📤</div>
                <div className="text-sm mb-3" style={{ color: '#4a6080' }}>Drop your PDF here or click to browse</div>
                <div className="px-4 py-2 rounded-lg text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #a07820, #c9a84c)' }}>Browse PDF</div>
                <input type="file" accept="application/pdf" onChange={handleFile} className="hidden" />
              </label>
            )}

            {phase === "analyzing" && (
              <div className="flex flex-col items-center justify-center py-14 gap-4">
                <Spinner size={52} color="#c9a84c" />
                <div className="font-bold" style={{ color: '#c9a84c' }}>Analysing PDF with PaddleOCR + Groq AI…</div>
                <div className="text-xs text-center" style={{ color: '#4a6080' }}>
                  OCR extracting text → Detecting topics<br />→ Generating quiz questions
                </div>
              </div>
            )}

            {phase === "done" && analysis && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <div className="text-xs font-bold mb-1" style={{ color: '#10B981' }}>✅ {fileName}</div>
                  <div className="text-xs leading-relaxed" style={{ color: '#4a6080' }}>{analysis.summary}</div>
                </div>

                <div>
                  <div className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: '#4a6080' }}>Detected Topics</div>
                  <div className="space-y-1">
                    {(analysis.topics || []).map(t => (
                      <div key={t} className="text-xs py-1.5" style={{ color: '#e8edf5', borderBottom: '1px solid rgba(201,168,76,0.14)' }}>📖 {t}</div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: '#4a6080' }}>Key Terms</div>
                  <div className="flex flex-wrap gap-2">
                    {(analysis.keyTerms || []).map(t => (
                      <Badge key={t} color="#c9a84c" className="text-[10px]">{t}</Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {analysis.questions?.length > 0 && (
                    <Button onClick={() => setPhase("quiz")} className="text-xs">
                      🎯 Start {analysis.questions.length}-Q Quiz
                    </Button>
                  )}
                  <label className="px-4 py-2 rounded-lg text-xs text-center cursor-pointer flex items-center justify-center border font-bold" style={{ borderColor: 'rgba(201,168,76,0.25)', color: '#c9a84c', background: 'transparent' }}>
                    📤 Upload Another
                    <input type="file" accept="application/pdf" onChange={(e) => { setPhase("idle"); setTimeout(() => handleFile(e), 100); }} className="hidden" />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload history */}
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}>
          <h3 className="text-sm font-black mb-4 uppercase tracking-widest" style={{ color: '#c9a84c' }}>📁 Upload History</h3>
          {uploads.length === 0 ? (
            <div className="text-sm py-8 text-center" style={{ color: '#4a6080' }}>
              <div className="text-3xl mb-2">📂</div>
              No uploads yet. Upload your first PDF!
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {uploads.map((u, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(201,168,76,0.14)' }}>
                  <div className="font-semibold text-sm mb-1 truncate" style={{ color: '#e8edf5' }}>📋 {u.name}</div>
                  <div className="text-xs mb-2" style={{ color: '#4a6080' }}>{u.date} · {(u.size / 1024).toFixed(1)} KB</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {(u.topics || []).slice(0, 2).map(t => (
                      <Badge key={t} color="#c9a84c" className="text-[10px]">{t}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
