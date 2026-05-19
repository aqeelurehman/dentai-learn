/**
 * pages/faculty/AnnouncementsPage.jsx
 */
import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { AnnouncementsAPI } from "../../backend/api.js";
import { Button, Badge, Modal, Spinner, SectionHeader } from "../../components/ui/index.jsx";

export default function AnnouncementsPage() {
  const { showToast } = useApp();
  const [ann, setAnn]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState({ title: "", body: "", priority: "normal" });

  useEffect(() => { AnnouncementsAPI.getAll().then(a => { setAnn(a); setLoading(false); }); }, []);

  const save = async () => {
    if (!form.title.trim() || !form.body.trim()) { showToast("Fill all fields", "error"); return; }
    const updated = await AnnouncementsAPI.create(form);
    setAnn(updated);
    setForm({ title: "", body: "", priority: "normal" });
    setModal(false);
    showToast("Announcement posted!");
  };

  const del = async (id) => {
    const updated = await AnnouncementsAPI.remove(id);
    setAnn(updated);
    showToast("Announcement deleted");
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner size={40} color="#c9a84c" /></div>;

  return (
    <div className="animate-fade-up">
      <SectionHeader
        title={<span className="font-display gold-text">Announcements</span>}
        subtitle="Broadcast messages visible to all students"
        action={<Button onClick={() => setModal(true)} style={{ background: 'linear-gradient(135deg, #a07820, #c9a84c)', border: 'none', color: '#fff' }}>+ Post Announcement</Button>}
      />

      {ann.length === 0 ? (
        <div className="text-center py-16" style={{ color: '#4a6080' }}>
          <div className="text-5xl mb-4">📢</div>
          <div className="font-bold mb-2" style={{ color: '#e8edf5' }}>No announcements yet</div>
          <div className="text-sm mb-6" style={{ color: '#4a6080' }}>Post announcements to keep your students informed</div>
          <Button onClick={() => setModal(true)} style={{ background: 'linear-gradient(135deg, #a07820, #c9a84c)', border: 'none', color: '#fff' }}>Post First Announcement</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {ann.map(a => (
            <div
              key={a.id}
              className="flex items-start gap-4"
              style={{
                background: 'rgba(13,21,37,0.92)',
                border: '1px solid rgba(201,168,76,0.14)',
                borderLeft: `4px solid ${a.priority === "high" ? "#EF4444" : "#c9a84c"}`,
                borderRadius: '1rem',
                padding: '1.25rem',
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge color={a.priority === "high" ? "#EF4444" : "#c9a84c"} className="text-[10px]">
                    {a.priority === "high" ? "High Priority" : "Normal"}
                  </Badge>
                  <span className="text-xs" style={{ color: '#4a6080' }}>{a.date}</span>
                </div>
                <div className="font-black mb-2" style={{ color: '#e8edf5' }}>{a.title}</div>
                <div className="text-sm leading-relaxed" style={{ color: '#4a6080' }}>{a.body}</div>
              </div>
              <Button variant="danger" className="text-xs px-2.5 py-1.5 shrink-0" onClick={() => del(a.id)}>Del</Button>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title="Post Announcement" onClose={() => setModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Title</label>
              <input
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Quiz due this Friday at 11:59 PM"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Message</label>
              <textarea
                className="w-full resize-none h-28 rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                placeholder="Write your announcement here..."
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Priority</label>
              <select
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
              >
                <option value="normal">Normal</option>
                <option value="high">High Priority (shown in red)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={save} style={{ background: 'linear-gradient(135deg, #a07820, #c9a84c)', border: 'none', color: '#fff' }}>Post Now</Button>
              <Button variant="ghost" onClick={() => setModal(false)} style={{ color: '#4a6080', border: '1px solid rgba(201,168,76,0.18)' }}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
