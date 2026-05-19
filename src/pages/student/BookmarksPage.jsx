/**
 * pages/student/BookmarksPage.jsx
 */
import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { BookmarksAPI, ModulesAPI, NotesAPI } from "../../backend/api.js";
import { Button, Badge, ProgressBar, Spinner, SectionHeader, EmptyState } from "../../components/ui/index.jsx";

export default function BookmarksPage() {
  const { user, setPage, showToast } = useApp();
  const [bookmarks, setBookmarks] = useState([]);
  const [modules, setModules]     = useState([]);
  const [notes, setNotes]         = useState({});
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      const [bm, mods] = await Promise.all([BookmarksAPI.get(user.id), ModulesAPI.getAll()]);
      setBookmarks(bm);
      setModules(mods);
      const noteMap = {};
      for (const id of bm) {
        noteMap[id] = await NotesAPI.get(user.id, id);
      }
      setNotes(noteMap);
      setLoading(false);
    })();
  }, []);

  const remove = async (id) => {
    const bm = await BookmarksAPI.remove(user.id, id);
    setBookmarks(bm);
    showToast("Bookmark removed");
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner size={40} color="#c9a84c" /></div>;

  const bookmarkedMods = modules.filter(m => bookmarks.includes(m.id));

  return (
    <div className="animate-fade-up">
      <SectionHeader
        title="🔖 Bookmarks"
        subtitle={`${bookmarkedMods.length} saved module${bookmarkedMods.length !== 1 ? "s" : ""}`}
      />

      {bookmarkedMods.length === 0 ? (
        <EmptyState
          icon="🏷️"
          title="No bookmarks yet"
          desc="Bookmark modules while studying to find them here quickly"
          action={<Button onClick={() => setPage("modules")}>Browse Modules →</Button>}
        />
      ) : (
        <div className="space-y-3">
          {bookmarkedMods.map(m => (
            <div key={m.id} className="flex items-start gap-4 p-5 rounded-2xl" style={{ background: 'rgba(13,21,37,0.92)', border: '1px solid rgba(201,168,76,0.14)' }}>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: `${m.color}22`, border: `1px solid ${m.color}44` }}
              >
                {m.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black mb-1" style={{ color: m.color }}>{m.title}</div>
                <div className="text-xs mb-3" style={{ color: '#4a6080' }}>{m.desc}</div>
                {notes[m.id] && (
                  <div
                    className="text-xs p-2.5 rounded-lg border-l-2 mb-3"
                    style={{ color: '#4a6080', background: 'rgba(0,0,0,0.3)', borderColor: m.color }}
                  >
                    📝 {notes[m.id]}
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  {(m.tags || []).slice(0, 3).map(t => (
                    <Badge key={t} color={m.color} className="text-[10px]">{t}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button className="text-xs px-3" onClick={() => setPage("modules")}>Study →</Button>
                <Button variant="danger" className="text-xs px-3" onClick={() => remove(m.id)}>✕</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
