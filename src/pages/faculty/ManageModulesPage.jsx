/**
 * pages/faculty/ManageModulesPage.jsx
 */
import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { ModulesAPI } from "../../backend/api.js";
import { Button, Badge, Modal, Spinner, SectionHeader } from "../../components/ui/index.jsx";

const BLANK = { title: "", emoji: "🦷", color: "#c9a84c", desc: "", content: "", tags: "" };

export default function ManageModulesPage() {
  const { showToast } = useApp();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [editId, setEditId]   = useState(null);
  const [form, setForm]       = useState(BLANK);

  useEffect(() => { ModulesAPI.getAll().then(m => { setModules(m); setLoading(false); }); }, []);

  const openAdd  = () => { setForm(BLANK); setEditId(null); setModal(true); };
  const openEdit = (m) => { setForm({ ...m, tags: (m.tags || []).join(", ") }); setEditId(m.id); setModal(true); };

  const save = async () => {
    if (!form.title.trim()) { showToast("Title is required", "error"); return; }
    const data = { ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) };
    if (editId) {
      const updated = await ModulesAPI.update(editId, data);
      setModules(updated);
      showToast("Module updated!");
    } else {
      const updated = await ModulesAPI.create(data);
      setModules(updated);
      showToast("Module created!");
    }
    setModal(false);
  };

  const del = async (id) => {
    const updated = await ModulesAPI.remove(id);
    setModules(updated);
    showToast("Module deleted");
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner size={40} color="#c9a84c" /></div>;

  return (
    <div className="animate-fade-up">
      <SectionHeader
        title={<span className="font-display gold-text">Manage Modules</span>}
        subtitle={`${modules.length} learning modules`}
        action={<Button onClick={openAdd} style={{ background: 'linear-gradient(135deg, #a07820, #c9a84c)', border: 'none', color: '#fff' }}>+ New Module</Button>}
      />

      <div className="grid grid-cols-3 gap-4">
        {modules.map(m => (
          <div key={m.id} style={{ background: 'rgba(13,21,37,0.92)', border: `1px solid ${m.color}33`, borderRadius: '1rem', padding: '1.25rem' }}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{m.emoji}</span>
              <div className="flex gap-2">
                <Button variant="ghost" className="text-xs px-2 py-1" onClick={() => openEdit(m)} style={{ color: '#c9a84c' }}>Edit</Button>
                <Button variant="danger" className="text-xs px-2 py-1" onClick={() => del(m.id)}>Del</Button>
              </div>
            </div>
            <div className="font-black text-sm mb-1 uppercase tracking-widest" style={{ color: m.color }}>{m.title}</div>
            <div className="text-xs mb-3 line-clamp-2" style={{ color: '#4a6080' }}>{m.desc}</div>
            <div className="flex gap-1.5 flex-wrap">
              {(m.tags || []).slice(0, 3).map(t => (
                <Badge key={t} color={m.color} className="text-[10px]">{t}</Badge>
              ))}
            </div>
          </div>
        ))}

        {/* Add card */}
        <div
          onClick={openAdd}
          className="flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[160px]"
          style={{ background: 'rgba(13,21,37,0.92)', border: '2px dashed rgba(201,168,76,0.25)', borderRadius: '1rem', padding: '1.25rem' }}
        >
          <div className="text-3xl mb-2" style={{ color: '#4a6080' }}>+</div>
          <div className="text-sm font-bold" style={{ color: '#4a6080' }}>Add Module</div>
        </div>
      </div>

      {modal && (
        <Modal title={editId ? "Edit Module" : "New Module"} onClose={() => setModal(false)} maxWidth="max-w-xl">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Emoji</label>
                <input
                  className="w-full text-center text-2xl rounded-lg px-3 py-2 outline-none"
                  style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
                  value={form.emoji}
                  onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                  maxLength={2}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Accent Color</label>
                <input
                  type="color"
                  className="w-full rounded-lg px-3 py-2 outline-none"
                  style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)' }}
                  value={form.color}
                  onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Tags (comma-sep)</label>
                <input
                  className="w-full text-xs rounded-lg px-3 py-2 outline-none"
                  style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="Cyst, Jaw, Tumor"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Title</label>
              <input
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Module title..."
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Short Description</label>
              <input
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
                value={form.desc}
                onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                placeholder="Brief module description..."
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Study Content</label>
              <textarea
                className="w-full resize-none h-40 text-xs font-mono rounded-lg px-3 py-2 outline-none"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder={"Use **Heading** — content for each section.\n\nExample:\n**Dentigerous Cyst** — Arises from reduced enamel epithelium..."}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={save} style={{ background: 'linear-gradient(135deg, #a07820, #c9a84c)', border: 'none', color: '#fff' }}>{editId ? "Save Changes" : "Create Module"}</Button>
              <Button variant="ghost" onClick={() => setModal(false)} style={{ color: '#4a6080', border: '1px solid rgba(201,168,76,0.18)' }}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
