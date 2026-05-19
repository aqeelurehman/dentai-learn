/**
 * pages/faculty/ManageCasesPage.jsx
 */
import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { CasesAPI } from "../../backend/api.js";
import { Button, Badge, DifficultyBadge, Modal, Spinner, SectionHeader } from "../../components/ui/index.jsx";

const BLANK = { title: "", history: "", findings: "", answer: "", ddx: "", explanation: "", difficulty: "Medium", tags: "" };

export default function ManageCasesPage() {
  const { showToast } = useApp();
  const [cases, setCases]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm]     = useState(BLANK);

  useEffect(() => { CasesAPI.getAll().then(c => { setCases(c); setLoading(false); }); }, []);

  const openAdd  = () => { setForm(BLANK); setEditId(null); setModal(true); };
  const openEdit = (c) => {
    setForm({ ...c, tags: (c.tags || []).join(", "), ddx: (c.ddx || []).join(", ") });
    setEditId(c.id); setModal(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.answer.trim()) { showToast("Title and answer are required", "error"); return; }
    const data = {
      ...form,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      ddx:  form.ddx.split(",").map(t => t.trim()).filter(Boolean),
    };
    if (editId) {
      const updated = await CasesAPI.update(editId, data);
      setCases(updated); showToast("Case updated!");
    } else {
      const updated = await CasesAPI.create(data);
      setCases(updated); showToast("Case added!");
    }
    setModal(false);
  };

  const del = async (id) => {
    const updated = await CasesAPI.remove(id);
    setCases(updated); showToast("Case deleted");
  };

  const F = (key) => ({ value: form[key], onChange: e => setForm(f => ({ ...f, [key]: e.target.value })) });

  if (loading) return <div className="flex justify-center py-16"><Spinner size={40} color="#c9a84c" /></div>;

  return (
    <div className="animate-fade-up">
      <SectionHeader
        title={<span className="font-display gold-text">Manage Cases</span>}
        subtitle={`${cases.length} clinical cases`}
        action={<Button onClick={openAdd} style={{ background: 'linear-gradient(135deg, #a07820, #c9a84c)', border: 'none', color: '#fff' }}>+ Add Case</Button>}
      />

      <div className="space-y-3">
        {cases.map(c => (
          <div key={c.id} className="flex items-start gap-4" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)', borderRadius: '1rem', padding: '1.25rem' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: 'linear-gradient(135deg, #a07820, #c9a84c)' }}>🔍</div>
            <div className="flex-1 min-w-0">
              <div className="flex gap-2 mb-2 flex-wrap">
                {(c.tags || []).map(t => <Badge key={t} color="#c9a84c" className="text-[10px]">{t}</Badge>)}
                <DifficultyBadge level={c.difficulty} />
              </div>
              <div className="font-bold text-sm mb-1" style={{ color: '#e8edf5' }}>{c.title}</div>
              <div className="text-xs" style={{ color: '#10B981' }}>Answer: {c.answer}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="ghost" className="text-xs px-2 py-1" onClick={() => openEdit(c)} style={{ color: '#c9a84c' }}>Edit</Button>
              <Button variant="danger" className="text-xs px-2 py-1" onClick={() => del(c.id)}>Del</Button>
            </div>
          </div>
        ))}
        {cases.length === 0 && (
          <div className="text-center py-12" style={{ color: '#4a6080' }}>
            <div className="text-4xl mb-3">🔍</div>
            No cases yet. Add your first clinical case!
          </div>
        )}
      </div>

      {modal && (
        <Modal title={editId ? "Edit Case" : "Add Case"} onClose={() => setModal(false)} maxWidth="max-w-2xl">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Case Title</label>
                <input
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
                  {...F("title")}
                  placeholder="e.g. 27-year-old with jaw swelling..."
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Difficulty</label>
                <select
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
                  {...F("difficulty")}
                >
                  {["Easy","Medium","Hard"].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Correct Answer</label>
                <input
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
                  {...F("answer")}
                  placeholder="e.g. Dentigerous Cyst"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Tags (comma-separated)</label>
                <input
                  className="w-full text-xs rounded-lg px-3 py-2 outline-none"
                  style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
                  {...F("tags")}
                  placeholder="Cyst, Mandible, Impacted"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Differential Diagnoses (comma-separated)</label>
              <input
                className="w-full text-xs rounded-lg px-3 py-2 outline-none"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
                {...F("ddx")}
                placeholder="Dentigerous Cyst, OKC, Ameloblastoma"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Patient History</label>
              <textarea
                className="w-full resize-none h-20 text-xs rounded-lg px-3 py-2 outline-none"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
                {...F("history")}
                placeholder="Age, symptoms, duration, associated features..."
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Clinical & Radiographic Findings</label>
              <textarea
                className="w-full resize-none h-20 text-xs rounded-lg px-3 py-2 outline-none"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
                {...F("findings")}
                placeholder="Describe radiographic appearance, size, margins, effects on adjacent structures..."
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Explanation / Teaching Points</label>
              <textarea
                className="w-full resize-none h-24 text-xs rounded-lg px-3 py-2 outline-none"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
                {...F("explanation")}
                placeholder="Explain why this is the correct diagnosis and the key differentiating features..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={save} style={{ background: 'linear-gradient(135deg, #a07820, #c9a84c)', border: 'none', color: '#fff' }}>{editId ? "Save Changes" : "Add Case"}</Button>
              <Button variant="ghost" onClick={() => setModal(false)} style={{ color: '#4a6080', border: '1px solid rgba(201,168,76,0.18)' }}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
