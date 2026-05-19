/**
 * pages/student/LecturesPage.jsx
 * Students can browse, read lectures, and download attached files.
 */
import { useState, useEffect } from "react";
import { LecturesAPI } from "../../backend/api.js";
import { Button, Badge, Spinner, SectionHeader, EmptyState } from "../../components/ui/index.jsx";

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
  pdf: "📕",
  doc: "📄", docx: "📄",
  ppt: "📊", pptx: "📊",
  xls: "📊", xlsx: "📊",
  jpg: "🖼️", jpeg: "🖼️", png: "🖼️", gif: "🖼️", webp: "🖼️",
  mp4: "🎬", mov: "🎬", avi: "🎬",
  zip: "📦", rar: "📦",
};

function getFileIcon(name) {
  const ext = name.split(".").pop().toLowerCase();
  return FILE_ICONS[ext] || "📎";
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getExt(name) {
  return name.split(".").pop().toLowerCase();
}

function isImage(name) {
  return ["jpg", "jpeg", "png", "gif", "webp"].includes(getExt(name));
}

function isPdf(name) {
  return getExt(name) === "pdf";
}

function downloadFile(file) {
  const a = document.createElement("a");
  a.href = file.data;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/* ── File Preview Modal ─────────────────────────────────────────────────────── */
function FilePreview({ file, onClose }) {
  if (!file) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={onClose}>
      <div className="w-full max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'rgba(13,21,37,0.98)', border: '1px solid rgba(201,168,76,0.25)' }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid rgba(201,168,76,0.12)' }}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg">{getFileIcon(file.name)}</span>
            <span className="text-sm font-bold truncate" style={{ color: '#e8edf5' }}>{file.name}</span>
            <span className="text-[10px] shrink-0" style={{ color: '#4a6080' }}>{formatSize(file.size)}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <button onClick={() => downloadFile(file)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
              style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c' }}>
              {"⬇️"} Download
            </button>
            <button onClick={onClose}
              className="px-2 py-1.5 rounded-lg text-xs font-bold transition-colors"
              style={{ color: '#4a6080' }}>
              {"✕"}
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4" style={{ background: '#050a14' }}>
          {isImage(file.name) && (
            <img src={file.data} alt={file.name} className="max-w-full max-h-full object-contain rounded-lg" />
          )}
          {isPdf(file.name) && (
            <iframe src={file.data} title={file.name} className="w-full h-full min-h-[60vh] rounded-lg" style={{ border: 'none' }} />
          )}
          {!isImage(file.name) && !isPdf(file.name) && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">{getFileIcon(file.name)}</div>
              <div className="text-sm font-bold mb-1" style={{ color: '#e8edf5' }}>{file.name}</div>
              <div className="text-xs mb-4" style={{ color: '#4a6080' }}>{formatSize(file.size)}</div>
              <button onClick={() => downloadFile(file)}
                className="px-5 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #a07820, #c9a84c)', color: '#fff' }}>
                {"⬇️"} Download File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Lecture Detail View ────────────────────────────────────────────────────── */
function LectureDetail({ lecture, onBack }) {
  const color = SUBJECT_COLORS[lecture.subject] || "#4a6080";
  const [previewFile, setPreviewFile] = useState(null);

  const renderContent = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-3" />;
      const headingMatch = trimmed.match(/^\*\*(.+?)\*\*/);
      if (headingMatch) {
        const rest = trimmed.slice(headingMatch[0].length).replace(/^[\s—\-:]+/, "").trim();
        return (
          <div key={i} className="mt-5 mb-2">
            <h3 className="text-sm font-black uppercase tracking-widest" style={{ color }}>{headingMatch[1]}</h3>
            {rest && <p className="text-sm leading-relaxed mt-1" style={{ color: '#c8d4e6' }}>{rest}</p>}
          </div>
        );
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return (
          <div key={i} className="flex gap-2 ml-2 mb-1.5">
            <span style={{ color }}>{"•"}</span>
            <span className="text-sm leading-relaxed" style={{ color: '#c8d4e6' }}>{trimmed.slice(2)}</span>
          </div>
        );
      }
      return <p key={i} className="text-sm leading-relaxed mb-1" style={{ color: '#c8d4e6' }}>{trimmed}</p>;
    });
  };

  const getEmbed = (url) => {
    if (!url) return null;
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : null;
  };

  const embedUrl = getEmbed(lecture.videoUrl);
  const files = lecture.files || [];

  return (
    <div className="animate-fade-up max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 mb-5 text-xs font-bold transition-colors hover:opacity-80" style={{ color: '#c9a84c' }}>
        <span>{"←"}</span> Back to Lectures
      </button>

      {/* Header card */}
      <div className="p-6 rounded-2xl mb-5" style={{ background: 'rgba(13,21,37,0.92)', border: `1px solid ${color}33` }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `${color}18`, border: `1px solid ${color}44` }}>
            {"🎓"}
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-widest" style={{ color }}>{lecture.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge color={color} className="text-[10px]">{lecture.subject}</Badge>
              <span className="text-[10px]" style={{ color: '#4a6080' }}>by {lecture.faculty}</span>
              <span className="text-[10px]" style={{ color: '#3a5070' }}>{lecture.date}</span>
            </div>
          </div>
        </div>
        {lecture.description && (
          <p className="text-sm ml-[60px]" style={{ color: '#4a6080' }}>{lecture.description}</p>
        )}
      </div>

      {/* Video embed */}
      {embedUrl && (
        <div className="mb-5 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,168,76,0.14)' }}>
          <iframe src={embedUrl} title={lecture.title} className="w-full"
            style={{ height: 400, border: 'none', background: '#000' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen />
        </div>
      )}
      {lecture.videoUrl && !embedUrl && (
        <div className="mb-5 p-4 rounded-2xl flex items-center gap-3"
          style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(59,130,246,0.25)' }}>
          <span className="text-xl">{"🎬"}</span>
          <div>
            <div className="text-xs font-bold mb-0.5" style={{ color: '#3B82F6' }}>Video Link</div>
            <a href={lecture.videoUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs underline break-all" style={{ color: '#4a6080' }}>
              {lecture.videoUrl}
            </a>
          </div>
        </div>
      )}

      {/* ── Attachments ────────────────────────────────────────────────── */}
      {files.length > 0 && (
        <div className="mb-5 p-5 rounded-2xl" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(59,130,246,0.18)' }}>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#3B82F6' }}>
            {"📎"} Attachments &middot; {files.length} file{files.length > 1 ? "s" : ""}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {files.map((f, idx) => (
              <div key={idx}
                className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md group"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(201,168,76,0.12)' }}
                onClick={() => setPreviewFile(f)}
              >
                <span className="text-2xl">{getFileIcon(f.name)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate" style={{ color: '#e8edf5' }}>{f.name}</div>
                  <div className="text-[10px]" style={{ color: '#4a6080' }}>{formatSize(f.size)}</div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {(isImage(f.name) || isPdf(f.name)) && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(201,168,76,0.12)', color: '#c9a84c' }}>
                      Preview
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); downloadFile(f); }}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg transition-all hover:scale-105"
                    style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6' }}>
                    {"⬇️"} Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6 rounded-2xl" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: '#4a6080' }}>
          Lecture Content
        </div>
        {renderContent(lecture.content)}
      </div>

      {previewFile && <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />}
    </div>
  );
}

/* ── Main Lectures Page ─────────────────────────────────────────────────────── */
export default function LecturesPage() {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [active, setActive]     = useState(null);
  const [filter, setFilter]     = useState("All");
  const [search, setSearch]     = useState("");

  useEffect(() => {
    LecturesAPI.getAll().then(l => { setLectures(l); setLoading(false); });
  }, []);

  const subjects = [...new Set(lectures.map(l => l.subject))];

  const filtered = lectures
    .filter(l => filter === "All" || l.subject === filter)
    .filter(l => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return l.title.toLowerCase().includes(q) ||
             l.description?.toLowerCase().includes(q) ||
             l.subject.toLowerCase().includes(q) ||
             l.faculty?.toLowerCase().includes(q);
    });

  if (loading) return <div className="flex justify-center py-16"><Spinner size={40} color="#c9a84c" /></div>;
  if (active) return <LectureDetail lecture={active} onBack={() => setActive(null)} />;

  return (
    <div className="animate-fade-up">
      <SectionHeader
        title={<span className="font-display gold-text">Lectures</span>}
        subtitle={`${lectures.length} lecture${lectures.length !== 1 ? "s" : ""} available`}
      />

      {/* Search */}
      <div className="mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search lectures by title, subject, or faculty..."
          className="w-full max-w-md rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)', color: '#e8edf5' }}
        />
      </div>

      {/* Subject filter chips */}
      {subjects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {["All", ...subjects].map(s => (
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
      )}

      {/* Lectures grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={"🎓"}
          title="No Lectures Found"
          desc={search ? `No results for "${search}"` : "Your faculty hasn't uploaded any lectures yet"}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(l => {
            const color = SUBJECT_COLORS[l.subject] || "#4a6080";
            const fileCount = (l.files || []).length;
            return (
              <div
                key={l.id}
                onClick={() => setActive(l)}
                className="p-5 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group"
                style={{ background: 'rgba(13,21,37,0.92)', border: `1px solid ${color}33` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-transform group-hover:scale-110"
                    style={{ background: `${color}18`, border: `1px solid ${color}44` }}>
                    {"🎓"}
                  </div>
                  <div className="flex gap-1.5">
                    {fileCount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#3B82F6' }}>
                        {"📎"} {fileCount}
                      </span>
                    )}
                    {l.videoUrl && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#8B5CF6' }}>
                        {"🎬"} Video
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-black text-sm uppercase tracking-widest mb-1 line-clamp-1" style={{ color }}>{l.title}</h3>
                <p className="text-xs mb-3 line-clamp-2" style={{ color: '#4a6080' }}>
                  {l.description || l.content?.slice(0, 100) + "..."}
                </p>

                <div className="flex items-center justify-between">
                  <Badge color={color} className="text-[10px]">{l.subject}</Badge>
                  <div className="text-[10px]" style={{ color: '#3a5070' }}>
                    {l.faculty} &middot; {l.date}
                  </div>
                </div>

                <div className="text-xs mt-3 font-bold opacity-0 group-hover:opacity-100 transition-opacity text-right" style={{ color }}>
                  Read Lecture &rarr;
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
