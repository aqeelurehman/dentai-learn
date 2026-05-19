/**
 * pages/student/ARPage.jsx
 * Augmented Reality explorer with real Three.js 3D models (lazy loaded)
 */
import { useState, useEffect, lazy, Suspense } from "react";
import { ModulesAPI } from "../../backend/api.js";
import { Button, Badge, Spinner, SectionHeader } from "../../components/ui/index.jsx";

const ARViewer = lazy(() => import("../../components/3d/ARViewer.jsx"));

const AR_TOPICS = [
  { id: "ar1", title: "Tooth Anatomy", emoji: "🦷", desc: "Crown, root, pulp chamber & canals", color: "#c9a84c", model: "tooth" },
  { id: "ar2", title: "Cyst Expansion", emoji: "💠", desc: "Visualise cyst wall, lining & contents", color: "#8B5CF6", model: "cyst" },
  { id: "ar3", title: "Root Resorption", emoji: "⚠️", desc: "Internal vs external resorption patterns", color: "#F59E0B", model: "resorption" },
  { id: "ar4", title: "Jaw Architecture", emoji: "🦴", desc: "Mandible and maxilla anatomical landmarks", color: "#10B981", model: "jaw" },
  { id: "ar5", title: "Tumour Growth", emoji: "🔬", desc: "Expansion patterns of odontogenic tumours", color: "#EF4444", model: "tumor" },
  { id: "ar6", title: "Bone Pathology", emoji: "🩺", desc: "Fibrous dysplasia vs normal bone", color: "#EC4899", model: "bone" },
];

export default function ARPage() {
  const [scan, setScan] = useState("idle");
  const [topic, setTopic] = useState(null);
  const [modules, setModules] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => { ModulesAPI.getAll().then(setModules); }, []);

  const startScan = (t) => {
    setTopic(t);
    setScan("scanning");
    setTimeout(() => { setScan("found"); setHistory(h => [t, ...h].slice(0, 5)); }, 1800);
  };

  const reset = () => { setScan("idle"); setTopic(null); };

  return (
    <div className="animate-fade-up">
      <SectionHeader title="🥽 AR Topic Explorer" subtitle="Interactive 3D Augmented Reality — explore dental structures in real-time" />

      {/* 3D Viewport */}
      <div
        className="relative w-full rounded-2xl mb-6 overflow-hidden"
        style={{ height: scan === "found" ? 420 : 240, background: "radial-gradient(ellipse at center, #0E1E38 0%, #07090F 100%)", border: '1px solid rgba(201,168,76,0.22)', transition: "height 0.5s ease" }}
      >
        {scan === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center">
            {[["top-4 left-4","border-t-2 border-l-2"],["top-4 right-4","border-t-2 border-r-2"],["bottom-4 left-4","border-b-2 border-l-2"],["bottom-4 right-4","border-b-2 border-r-2"]].map(([pos, bdr], i) => (
              <div key={i} className={`absolute w-6 h-6 ${pos} ${bdr}`} style={{ borderColor: "#c9a84c" }} />
            ))}
            <div className="text-center">
              <div className="text-5xl mb-3">📷</div>
              <div className="text-sm" style={{ color: '#4a6080' }}>Select a topic below to launch 3D AR visualization</div>
            </div>
          </div>
        )}

        {scan === "scanning" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-3">
              <Spinner size={52} color="#c9a84c" />
              <div className="font-bold" style={{ color: '#c9a84c' }}>{topic?.title} — Loading 3D Model…</div>
              <div className="text-xs" style={{ color: '#4a6080' }}>Initializing Three.js renderer</div>
            </div>
            <div className="absolute left-0 right-0 h-0.5" style={{ background: 'rgba(201,168,76,0.5)', animation: "scanLine 1.8s ease-in-out infinite", top: "50%" }} />
            <style>{`@keyframes scanLine{0%{top:10%;opacity:0}20%{opacity:1}80%{opacity:1}100%{top:90%;opacity:0}}`}</style>
          </div>
        )}

        {scan === "found" && topic && (
          <>
            <Suspense fallback={<div className="flex items-center justify-center h-full"><Spinner size={40} color="#c9a84c" /><span className="ml-3 text-sm" style={{ color: '#4a6080' }}>Loading 3D Engine...</span></div>}>
              <ARViewer model={topic.model} />
            </Suspense>
            <div className="absolute top-3 right-3 flex gap-2">
              <button onClick={reset} className="px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur transition-all" style={{ background: 'rgba(239,68,68,0.2)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                ✕ Close
              </button>
            </div>
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg backdrop-blur" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>🖱️ Drag to rotate • Scroll to zoom • Shift+drag to pan</span>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Topic grid */}
        <div>
          <h3 className="text-sm font-black mb-3 uppercase tracking-widest" style={{ color: '#c9a84c' }}>Choose AR Topic</h3>
          <div className="grid grid-cols-2 gap-3">
            {AR_TOPICS.map(t => (
              <div
                key={t.id}
                onClick={() => scan !== "scanning" && startScan(t)}
                className={`p-4 rounded-2xl transition-all duration-200 ${scan !== "scanning" ? "cursor-pointer hover:-translate-y-1 hover:shadow-lg" : "opacity-50"} ${topic?.id === t.id && scan === "found" ? "ring-2 ring-offset-1" : ""}`}
                style={{ background: 'rgba(13,21,37,0.92)', border: `1px solid ${t.color}44`, ...(topic?.id === t.id && scan === "found" ? { "--tw-ring-color": t.color } : {}) }}
              >
                <div className="text-2xl mb-2">{t.emoji}</div>
                <div className="text-xs font-black mb-1" style={{ color: t.color }}>{t.title}</div>
                <div className="text-xs" style={{ color: '#4a6080' }}>{t.desc}</div>
                {scan === "found" && topic?.id === t.id && (
                  <Badge color={t.color} className="mt-2 text-[10px]">Active 3D</Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {scan === "found" && (
            <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}>
              <h3 className="text-sm font-black mb-3 uppercase tracking-widest" style={{ color: '#c9a84c' }}>🎮 3D Controls</h3>
              <div className="space-y-2 text-xs" style={{ color: '#4a6080' }}>
                <div className="flex items-center gap-2"><span className="w-5 h-5 rounded flex items-center justify-center text-[10px]" style={{ background: 'rgba(0,0,0,0.3)' }}>🖱️</span> Left-click + drag to rotate</div>
                <div className="flex items-center gap-2"><span className="w-5 h-5 rounded flex items-center justify-center text-[10px]" style={{ background: 'rgba(0,0,0,0.3)' }}>🔍</span> Scroll wheel to zoom in/out</div>
                <div className="flex items-center gap-2"><span className="w-5 h-5 rounded flex items-center justify-center text-[10px]" style={{ background: 'rgba(0,0,0,0.3)' }}>✋</span> Right-click + drag to pan</div>
                <div className="flex items-center gap-2"><span className="w-5 h-5 rounded flex items-center justify-center text-[10px]" style={{ background: 'rgba(0,0,0,0.3)' }}>📱</span> Touch: pinch zoom, 1-finger rotate</div>
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}>
              <h3 className="text-sm font-black mb-3 uppercase tracking-widest" style={{ color: '#c9a84c' }}>🕐 Recent Scans</h3>
              <div className="space-y-2">
                {history.map((t, i) => (
                  <div key={i} onClick={() => startScan(t)} className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <span>{t.emoji}</span>
                    <span className="text-xs font-medium" style={{ color: '#e8edf5' }}>{t.title}</span>
                    <Badge color={t.color} className="ml-auto text-[10px]">View</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}>
            <h3 className="text-sm font-black mb-3 uppercase tracking-widest" style={{ color: '#c9a84c' }}>📚 Linked Study Modules</h3>
            <div className="space-y-2">
              {modules.slice(0, 5).map(m => (
                <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: `${m.color}10` }}>
                  <span>{m.emoji}</span>
                  <span className="text-xs font-medium" style={{ color: m.color }}>{m.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
