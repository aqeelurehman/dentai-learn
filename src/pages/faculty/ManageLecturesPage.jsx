/**
 * pages/faculty/ManageLecturesPage.jsx
 * Faculty can add, edit, delete lectures with file attachments.
 */
import { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { LecturesAPI } from "../../backend/api.js";
import { Button, Badge, Modal, Spinner, SectionHeader, EmptyState } from "../../components/ui/index.jsx";

const BLANK = { title: "", subject: "", description: "", content: "", videoUrl: "", files: [] };

const SUBJECTS = [
  "Oral Pathology",
  "Oral Surgery",
  "Prosthodontics",
  "Orthodontics",
  "Endodontics",
  "Periodontics",
  "Pediatric Dentistry",
  "Community Dentistry",
  "Dental Anatomy",
  "Oral Medicine",
  "General",
];

const SUBJECT_COLORS = {
  "Oral Pathology":       "#c9a84c",
  "Oral Surgery":         "#EF4444",
  "Prosthodontics":       "#8B5CF6",
  "Orthodontics":         "#3B82F6",
  "Endodontics":          "#F59E0B",
  "Periodontics":         "#10B981",
  "Pediatric Dentistry":  "#EC4899",
  "Community Dentistry":  "#14B8A6",
  "Dental Anatomy":       "#F97316",
  "Oral Medicine":        "#6366F1",
  "General":              "#4a6080",
};

const FILE_ICONS = {
  pdf: "\u{1F4D5}",
  doc: "\u{1F4C4}", docx: "\u{1F4C4}",
  ppt: "\u{1F4CA}", pptx: "\u{1F4CA}",
  xls: "\u{1F4CA}", xlsx: "\u{1F4CA}",
  jpg: "\u{1F5BC}", jpeg: "\u{1F5BC}", png: "\u{1F5BC}", gif: "\u{1F5BC}", webp: "\u{1F5BC}",
  mp4: "\u{1F3AC}", mov: "\u{1F3AC}", avi: "\u{1F3AC}",
  zip: "\u{1F4E6}", rar: "\u{1F4E6}",
};

function getFileIcon(name) {
  const ext = name.split(".").pop().toLowerCase();
  return FILE_ICONS[ext] || "\u{1F4CE}";
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ManageLecturesPage() {
  const { user, showToast } = useApp();
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [editId, setEditId]     = useState(null);
  const [form, setForm]         = useState(BLANK);
  const [filter, setFilter]     = useState("All");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    LecturesAPI.getAll().then(l => { setLectures(l); setLoading(false); });
  }, []);

  const openAdd  = () => { setForm(BLANK); setEditId(null); setModal(true); };
  const openEdit = (l) => {
    setForm({
      title: l.title,
      subject: l.subject,
      description: l.description,
      content: l.content,
      videoUrl: l.videoUrl || "",
      files: l.files || [],
    });
    setEditId(l.id);
    setModal(true);
  };

  const handleFiles = async (e) => {
    const selected = Array.from(e.target.files);
    if (!selected.length) return;

    // 15 MB per file limit
    const tooBig = selected.find(f => f.size > 15 * 1024 * 1024);
    if (tooBig) {
      showToast(`"${tooBig.name}" exceeds 15 MB limit`, "error");
      return;
    }

    setUploading(true);
    try {
      const newFiles = await Promise.all(
        selected.map(async (f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
          data: await readFileAsBase64(f),
        }))
      );
      setForm(prev => ({ ...prev, files: [...(prev.files || []), ...newFiles] }));
      showToast(`${newFiles.length} file${newFiles.length > 1 ? "s" : ""} attached`);
    } catch {
      showToast("Failed to read file", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeFile = (idx) => {
    setForm(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== idx) }));
  };

  const save = async () => {
    if (!form.title.trim())   { showToast("Lecture title is required", "error"); return; }
    if (!form.subject)        { showToast("Please select a subject", "error"); return; }
    if (!form.content.trim()) { showToast("Lecture content is required", "error"); return; }

    const data = {
      ...form,
      faculty: user?.name || "Faculty",
    };

    if (editId) {
      const updated = await LecturesAPI.update(editId, data);
      setLectures(updated);
      showToast("Lecture updated!");
    } else {
      const updated = await LecturesAPI.create(data);
      setLectures(updated);
      showToast("Lecture added!");
    }
    setModal(false);
  };

  const del = async (id) => {
    const updated = await LecturesAPI.remove(id);
    setLectures(updated);
    showToast("Lecture deleted");
  };

  const filtered = filter === "All" ? lectures : lectures.filter(l => l.subject === filter);

  if (loading) return <div className="flex justify-center py-16"><Spinner size={40} color="#c9a84c" /></div>;

  return (
    <div className="animate-fade-up">
      <SectionHeader
        title={<span className="font-display gold-text">Manage Lectures</span>}
        subtitle={`${lectures.length} lecture${lectures.length !== 1 ? "s" : ""} uploaded`}
        action={
          <Button onClick={openAdd} style={{ background: 'linear-gradient(135deg, #a07820, #c9a84c)', border: 'none', color: '#fff' }}>
            + New Lecture
          </Button>
        }
      />

      {/* Subject filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["All", ...SUBJECTS].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-3 py-1 rounded-full text-[11px] font-bold transition-all"
            style={{
              background: filter === s ? 'rgba(201,168,76,0.2)' : 'rgba(0,0,0,0.3)',
              border: `1px solid ${filter === s ? '#c9a84c' : 'rgba(201,168,76,0.14)'}`,
              color: filter === s ? '#c9a84c' : '#4a6080',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="\u{1F393}"
          title="No Lectures Yet"
          desc={filter !== "All" ? `No lectures found for "${filter}"` : "Add your first lecture for students to study"}
          action={<Button onClick={openAdd} style={{ background: 'linear-gradient(135deg, #a07820, #c9a84c)', border: 'none', color: '#fff' }}>+ Add Lecture</Button>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(l => {
            const color = SUBJECT_COLORS[l.subject] || "#4a6080";
            const fileCount = (l.files || []).length;
            return (
              <div
                key={l.id}
                className="p-5 rounded-2xl transition-all hover:translate-x-1"
                style={{ background: 'rgba(13,21,37,0.92)', border: `1px solid ${color}33` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                        style={{ background: `${color}18`, border: `1px solid ${color}44` }}>
                        {"\u{1F393}"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-sm uppercase tracking-widest truncate" style={{ color }}>{l.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <Badge color={color} className="text-[10px]">{l.subject}</Badge>
                          <span className="text-[10px]" style={{ color: '#4a6080' }}>by {l.faculty}</span>
                          <span className="text-[10px]" style={{ color: '#3a5070' }}>{l.date}</span>
                          {fileCount > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                              style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6' }}>
                              {"\u{1F4CE}"} {fileCount} file{fileCount > 1 ? "s" : ""}
                            </span>
                          )}
                          {l.videoUrl && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                              style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6' }}>
                              {"\u{1F3AC}"} Video
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs line-clamp-2 ml-[52px]" style={{ color: '#4a6080' }}>{l.description}</p>
                  </div>
                  <div className="flex gap-2 ml-4 shrink-0">
                    <Button variant="ghost" className="text-xs px-2 py-1" onClick={() => openEdit(l)} style={{ color: '#c9a84c' }}>Edit</Button>
                    <Button variant="danger" className="text-xs px-2 py-1" onClick={() => del(l.id)}>Del</Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      {modal && (
        <Modal title={editId ? "Edit Lecture" : "New Lecture"} onClose={() => setModal(false)} maxWidth="max-w-2xl">
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Lecture Title *</label>
                <input
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Introduction to Oral Pathology"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Subject *</label>
                <select
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                >
                  <option value="">Select subject...</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Short Description</label>
              <input
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief overview of what this lecture covers..."
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Video URL (optional)</label>
              <input
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
                value={form.videoUrl}
                onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))}
                placeholder="https://youtube.com/watch?v=... or any video link"
              />
            </div>

            {/* ── File Upload ─────────────────────────────────────────────── */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>
                Attachments (PDF, PPTX, DOCX, Images &mdash; max 15 MB each)
              </label>

              {/* Drop zone / browse button */}
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#c9a84c'; }}
                onDragLeave={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)'; }}
                onDrop={e => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)';
                  if (e.dataTransfer.files.length) {
                    const dt = new DataTransfer();
                    Array.from(e.dataTransfer.files).forEach(f => dt.items.add(f));
                    fileRef.current.files = dt.files;
                    handleFiles({ target: fileRef.current });
                  }
                }}
                className="w-full rounded-xl p-5 text-center cursor-pointer transition-all hover:border-[#c9a84c]"
                style={{ background: 'rgba(0,0,0,0.25)', border: '2px dashed rgba(201,168,76,0.25)' }}
              >
                {uploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spinner size={20} color="#c9a84c" />
                    <span className="text-xs font-bold" style={{ color: '#c9a84c' }}>Reading files...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl mb-1">{"\u{1F4C1}"}</div>
                    <div className="text-xs font-bold mb-0.5" style={{ color: '#c9a84c' }}>
                      Click to browse or drag &amp; drop files
                    </div>
                    <div className="text-[10px]" style={{ color: '#4a6080' }}>
                      PDF, PPTX, DOCX, Images, ZIP &mdash; up to 15 MB per file
                    </div>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.zip,.rar,.mp4,.mov,.txt"
                onChange={handleFiles}
              />

              {/* Attached files list */}
              {form.files?.length > 0 && (
                <div className="mt-3 space-y-2">
                  {form.files.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(201,168,76,0.12)' }}>
                      <span className="text-lg">{getFileIcon(f.name)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate" style={{ color: '#e8edf5' }}>{f.name}</div>
                        <div className="text-[10px]" style={{ color: '#4a6080' }}>{formatSize(f.size)}</div>
                      </div>
                      <button
                        onClick={() => removeFile(idx)}
                        className="text-xs font-bold px-2 py-1 rounded transition-colors hover:bg-red-500/20"
                        style={{ color: '#EF4444' }}
                      >
                        {"✕"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#4a6080' }}>Lecture Content *</label>
              <textarea
                className="w-full resize-none h-48 text-xs rounded-lg px-3 py-2 outline-none leading-relaxed"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder={"Write lecture content here...\n\nUse **Heading** for section titles.\nUse bullet points with - for lists.\n\nExample:\n**Introduction**\nOral pathology is the study of diseases affecting...\n\n**Key Points**\n- Point one about the topic\n- Point two with clinical details"}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Button onClick={save} style={{ background: 'linear-gradient(135deg, #a07820, #c9a84c)', border: 'none', color: '#fff' }}>
                {editId ? "Save Changes" : "Add Lecture"}
              </Button>
              <Button variant="ghost" onClick={() => setModal(false)} style={{ color: '#4a6080', border: '1px solid rgba(201,168,76,0.18)' }}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
