/**
 * components/layout/index.jsx
 * Premium DentAI Learn layout — gold/navy theme.
 */
import { useApp } from "../../context/AppContext.jsx";
import { Badge } from "../ui/index.jsx";

// ── Nav definitions ───────────────────────────────────────────────────────────
const STUDENT_NAV = [
  { section: "Learn" },
  { id: "dashboard", label: "Dashboard",   icon: "🏠" },
  { id: "modules",   label: "3D Modules",  icon: "🦷" },
  { id: "lectures",  label: "Lectures",    icon: "🎓" },
  { id: "quiz",      label: "Take Quiz",   icon: "📝" },
  { id: "cases",     label: "Cases",       icon: "🔍" },
  { section: "Tools" },
  { id: "ar",        label: "AR Explorer", icon: "🥽" },
  { id: "chatbot",   label: "AI Assistant",icon: "🤖" },
  { id: "pdf",       label: "PDF & Study", icon: "📄" },
  { section: "Me" },
  { id: "bookmarks", label: "Bookmarks",   icon: "🔖" },
  { id: "guide",     label: "User Guide",  icon: "📖" },
  { id: "profile",   label: "My Profile",  icon: "👤" },
];

const FACULTY_NAV = [
  { section: "Overview" },
  { id: "dashboard",       label: "Dashboard",      icon: "🏠" },
  { id: "reports",         label: "Student Reports",icon: "📊" },
  { section: "Manage" },
  { id: "manage-quiz",     label: "Quiz Bank",      icon: "📝" },
  { id: "manage-modules",  label: "Modules",        icon: "🦷" },
  { id: "manage-lectures", label: "Lectures",       icon: "🎓" },
  { id: "manage-cases",    label: "Case Studies",   icon: "🔍" },
  { id: "announcements",   label: "Announcements",  icon: "📢" },
  { section: "Tools" },
  { id: "chatbot",         label: "AI Assistant",   icon: "🤖" },
  { id: "profile",         label: "My Profile",     icon: "👤" },
];

// ── Tooth SVG Logo ────────────────────────────────────────────────────────────
function ToothLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M14 4 C10 4 7 7 7 11 C7 14 8.5 16 10 17.5 L10 22 C10 23.1 10.9 24 12 24 L16 24 C17.1 24 18 23.1 18 22 L18 17.5 C19.5 16 21 14 21 11 C21 7 18 4 14 4Z" stroke="#c9a84c" strokeWidth="1.5" fill="none"/>
      <path d="M11 11 L17 11 M14 8 L14 14" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M10 5 L6 2 M18 5 L22 2" stroke="#c9a84c" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────────
export function Topbar() {
  const { user, logout } = useApp();
  return (
    <nav className="flex items-center justify-between px-5 h-14 shrink-0 sticky top-0 z-50"
         style={{ background: '#0a1220', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg, #0d1a30, #1a2d50)', border: '1.5px solid rgba(201,168,76,0.6)', boxShadow: '0 0 14px rgba(201,168,76,0.25)' }}>
          <ToothLogo size={22} />
        </div>
        <span className="font-display font-black text-lg leading-none gold-text">
          DentAI Learn
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <span className="text-xs hidden sm:block" style={{ color: '#4a6080' }}>
          {user?.roll}
        </span>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
             style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', color: '#c9a84c' }}>
          {user?.avatar} {user?.name?.split(" ")[0]}
        </div>
        <div className="px-2.5 py-1 rounded-full text-xs font-bold"
             style={{
               background: user?.role === "faculty" ? 'rgba(139,92,246,0.15)' : 'rgba(201,168,76,0.1)',
               border: `1px solid ${user?.role === "faculty" ? 'rgba(139,92,246,0.3)' : 'rgba(201,168,76,0.2)'}`,
               color: user?.role === "faculty" ? '#8B5CF6' : '#c9a84c'
             }}>
          {user?.role === "faculty" ? "Faculty" : "Student"}
        </div>
        <button onClick={logout} className="btn-ghost text-xs px-3 py-1.5">
          Logout
        </button>
      </div>
    </nav>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export function Sidebar() {
  const { user, page, setPage } = useApp();
  const nav = user?.role === "faculty" ? FACULTY_NAV : STUDENT_NAV;

  return (
    <aside className="w-52 shrink-0 flex flex-col py-3 overflow-y-auto"
           style={{ background: '#0a1220', borderRight: '1px solid rgba(201,168,76,0.1)' }}>
      {nav.map((item, idx) => {
        if (item.section) {
          return (
            <div key={idx} className="sidebar-section">{item.section}</div>
          );
        }
        const active = page === item.id;
        return (
          <div
            key={item.id}
            onClick={() => setPage(item.id)}
            className={active ? "nav-item-active" : "nav-item"}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        );
      })}
      <div className="mt-auto px-4 pt-4 pb-2 text-[10px] font-mono" style={{ color: '#3a5070' }}>
        CV Assignment #3 · 2026
      </div>
    </aside>
  );
}

// ── AppShell ──────────────────────────────────────────────────────────────────
export function AppShell({ children }) {
  return (
    <div className="flex flex-col h-screen font-body overflow-hidden" style={{ background: '#060b16', color: '#e8edf5' }}>
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
