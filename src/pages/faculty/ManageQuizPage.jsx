/**
 * pages/faculty/ManageQuizPage.jsx
 */
import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { QuizAPI, ModulesAPI } from "../../backend/api.js";
import { Button, Badge, DifficultyBadge, Modal, Spinner, SectionHeader } from "../../components/ui/index.jsx";

const BLANK = { q: "", options: ["", "", "", ""], correct: 0, explanation: "", moduleId: "", difficulty: "Medium" };

export default function ManageQuizPage() {
  const { showToast } = useApp();
  const [bank, setBank]       = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [editId, setEditId]   = useState(null);
  const [form, setForm]       = useState(BLANK);
  const [filterMod, setFilterMod] = useState("all");

  useEffect(() => {
    Promise.all([QuizAPI.getBank(), ModulesAPI.getAll()]).then(([b, m]) => {
      setBank(b); setModules(m); setLoading(false);
    });
  }, []);

  const openAdd = () => {
    setForm({ ...BLANK, moduleId: modules[0]?.id || "" });
    setEditId(null);
    setModal(true);
  };

  const openEdit = (q) => {
    setForm({ ...q });
    setEditId(q.id);
    setModal(true);
  };

  const save = async () => {
    if (!form.q.trim() || form.options.some(o => !o.trim())) {
      showToast("Please fill in all fields", "error"); return;
    }
    if (editId) {
      const updated = await QuizAPI.updateQuestion(editId, form);
      setBank(updated);
      showToast("Question updated!");
    } else {
      const updated = await QuizAPI.addQuestion(form);
      setBank(updated);
      showToast("Question added!");
    }
    setModal(false);
  };

  const del = async (id) => {
    const updated = await QuizAPI.deleteQuestion(id);
    setBank(updated);
    showToast("Question deleted");
  };

  const setOpt = (i, val) => {
    const opts = [...form.options]; opts[i] = val;
    setForm(f => ({ ...f, options: opts }));
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner size={40} color="#c9a84c" /></div>;

  const filtered = filterMod === "all" ? bank : bank.filter(q => q.moduleId === filterMod);

  return (
    <div className="animate-fade-up">
      <SectionHeader
        title={<span className="font-display gold-text">Quiz Bank</span>}
        subtitle={`${bank.length} questions total`}
        action={<Button onClick={openAdd} style={{ background: 'linear-gradient(135deg, #a07820, #c9a84c)', border: 'none', color: '#fff' }}>+ Add Question</Button>}
      />

      {/* Filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button
          onClick={() => setFilterMod("all")}
          className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all"
          style={filterMod === "all"
            ? { background: 'linear-gradient(135deg, #a07820, #c9a84c)', color: '#fff', border: '1px solid transparent' }
            : { background: 'transparent', color: '#4a6080', border: '1px solid rgba(201,168,76,0.18)' }
          }
        >All</button>
        {modules.map(m => (
          <button
            key={m.id}
            onClick={() => setFilterMod(m.id)}
            className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all"
            style={filterMod === m.id
              ? { background: m.color, border: '1px solid transparent', color: '#fff' }
              : { background: 'transparent', color: '#4a6080', border: '1px solid rgba(201,168,76,0.18)' }
            }
          >
            {m.emoji} {m.title}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(q => {
          const mod = modules.find(m => m.id === q.moduleId);
          return (
            <div key={q.id} style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)', borderRadius: '1rem', padding: '1.25rem' }}>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {mod && <Badge color={mod.color}>{mod.emoji} {mod.title}</Badge>}
                    <DifficultyBadge level={q.difficulty} />
                  </div>
                  <p className="font-bold text-sm mb-3" style={{ color: '#e8edf5' }}>{q.q}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {q.options.map((o, i) => (
                      <div
                        key={i}
                        className="text-xs px-3 py-1.5 rounded-lg"
                        style={{
                          background: i === q.correct ? "#10B98122" : "rgba(0,0,0,0.3)",
                          color: i === q.correct ? "#10B981" : "#4a6080",
                          border: `1px solid ${i === q.correct ? "#10B98144" : "rgba(201,168,76,0.14)"}`,
                        }}
                      >
                        <span className="font-black mr-1.5">{["A","B","C","D"][i]}.</span>{o}
                        {i === q.correct && " ✓"}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div className="mt-2.5 text-xs rounded-lg px-3 py-2" style={{ color: '#4a6080', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(201,168,76,0.14)' }}>
                      {q.explanation}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="ghost" className="text-xs px-2.5 py-1.5" onClick={() => openEdit(q)} style={{ color: '#c9a84c' }}>Edit</Button>
                  <Button variant="danger" className="text-xs px-2.5 py-1.5" onClick={() => del(q.id)}>Del</Button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12" style={{ color: '#4a6080' }}>
            <div className="text-4xl mb-3">📝</div>
            No questions found. Add your first question!
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <Modal title={editId ? "Edit Question" : "Add Question"} onClose={() => setModal(false)} maxWidth="max-w-xl">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Module</label>
                <select
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
                  value={form.moduleId}
                  onChange={e => setForm(f => ({ ...f, moduleId: e.target.value }))}
                >
                  {modules.map(m => <option key={m.id} value={m.id}>{m.emoji} {m.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Difficulty</label>
                <select
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
                  value={form.difficulty}
                  onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                >
                  {["Easy","Medium","Hard"].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Question</label>
              <textarea
                className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none h-20"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
                value={form.q}
                onChange={e => setForm(f => ({ ...f, q: e.target.value }))}
                placeholder="Enter the question..."
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Answer Options (select correct one)</label>
              <div className="space-y-2">
                {form.options.map((o, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button
                      onClick={() => setForm(f => ({ ...f, correct: i }))}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 border-2 transition-all"
                      style={form.correct === i
                        ? { background: "#10B981", borderColor: "#10B981", color: "#fff" }
                        : { background: 'transparent', borderColor: 'rgba(201,168,76,0.18)', color: '#4a6080' }
                      }
                    >
                      {["A","B","C","D"][i]}
                    </button>
                    <input
                      className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                      style={{
                        background: 'rgba(0,0,0,0.35)',
                        border: form.correct === i ? '1px solid #10B981' : '1px solid rgba(201,168,76,0.18)',
                        color: '#e8edf5',
                      }}
                      value={o}
                      onChange={e => setOpt(i, e.target.value)}
                      placeholder={`Option ${["A","B","C","D"][i]}`}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs mt-1" style={{ color: '#4a6080' }}>Click the circle to mark the correct answer</p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Explanation</label>
              <textarea
                className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none h-20"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
                value={form.explanation}
                onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
                placeholder="Explain why the correct answer is correct..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Button onClick={save} style={{ background: 'linear-gradient(135deg, #a07820, #c9a84c)', border: 'none', color: '#fff' }}>{editId ? "Save Changes" : "Add Question"}</Button>
              <Button variant="ghost" onClick={() => setModal(false)} style={{ color: '#4a6080', border: '1px solid rgba(201,168,76,0.18)' }}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
