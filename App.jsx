import { useEffect, useState } from "react";
import { AppProvider, useApp } from "./src/context/AppContext.jsx";
import { seedDatabase } from "./src/backend/seed.js";
import { AppShell } from "./src/components/layout/index.jsx";
import { Spinner, Toast } from "./src/components/ui/index.jsx";

// ── Pages: Auth ───────────────────────────────────────────────────────────────
import LoginPage from "./src/pages/LoginPage.jsx";

// ── Pages: Student ────────────────────────────────────────────────────────────
import StudentDashboard from "./src/pages/student/DashboardPage.jsx";
import ModulesPage      from "./src/pages/student/ModulesPage.jsx";
import QuizPage         from "./src/pages/student/QuizPage.jsx";
import CasesPage        from "./src/pages/student/CasesPage.jsx";
import ARPage           from "./src/pages/student/ARPage.jsx";
import ChatbotPage      from "./src/pages/student/ChatbotPage.jsx";
import PDFPage          from "./src/pages/student/PDFPage.jsx";
import LecturesPage     from "./src/pages/student/LecturesPage.jsx";
import BookmarksPage    from "./src/pages/student/BookmarksPage.jsx";
import GuidePage        from "./src/pages/student/GuidePage.jsx";
import StudentProfile   from "./src/pages/student/ProfilePage.jsx";

// ── Pages: Faculty ────────────────────────────────────────────────────────────
import FacultyDashboard   from "./src/pages/faculty/DashboardPage.jsx";
import ReportsPage        from "./src/pages/faculty/ReportsPage.jsx";
import ManageQuizPage     from "./src/pages/faculty/ManageQuizPage.jsx";
import ManageModulesPage  from "./src/pages/faculty/ManageModulesPage.jsx";
import ManageCasesPage    from "./src/pages/faculty/ManageCasesPage.jsx";
import ManageLecturesPage from "./src/pages/faculty/ManageLecturesPage.jsx";
import AnnouncementsPage  from "./src/pages/faculty/AnnouncementsPage.jsx";
import FacultyProfile     from "./src/pages/faculty/ProfilePage.jsx";

// ChatbotPage shared by both roles
// ─────────────────────────────────────────────────────────────────────────────

// ── Page Router ───────────────────────────────────────────────────────────────
function PageRouter() {
  const { user, page } = useApp();

  if (user.role === "student") {
    switch (page) {
      case "dashboard":  return <StudentDashboard />;
      case "modules":    return <ModulesPage />;
      case "lectures":   return <LecturesPage />;
      case "quiz":       return <QuizPage />;
      case "cases":      return <CasesPage />;
      case "ar":         return <ARPage />;
      case "chatbot":    return <ChatbotPage />;
      case "pdf":        return <PDFPage />;
      case "bookmarks":  return <BookmarksPage />;
      case "guide":      return <GuidePage />;
      case "profile":    return <StudentProfile />;
      default:           return <StudentDashboard />;
    }
  }

  // Faculty
  switch (page) {
    case "dashboard":       return <FacultyDashboard />;
    case "reports":         return <ReportsPage />;
    case "manage-quiz":     return <ManageQuizPage />;
    case "manage-modules":  return <ManageModulesPage />;
    case "manage-lectures": return <ManageLecturesPage />;
    case "manage-cases":    return <ManageCasesPage />;
    case "announcements":   return <AnnouncementsPage />;
    case "chatbot":         return <ChatbotPage />;
    case "profile":         return <FacultyProfile />;
    default:                return <FacultyDashboard />;
  }
}

// ── Authenticated Shell ───────────────────────────────────────────────────────
function AuthenticatedApp() {
  const { toast } = useApp();
  return (
    <>
      <AppShell>
        <PageRouter />
      </AppShell>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}

// ── App Core ──────────────────────────────────────────────────────────────────
function AppCore() {
  const { user } = useApp();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedDatabase().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #060b16 0%, #0a1428 50%, #060b16 100%)' }}>
        <div className="hex-bg" />
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0d1a30, #1a2d50)', border: '1.5px solid rgba(201,168,76,0.6)', boxShadow: '0 0 30px rgba(201,168,76,0.3)' }}>
          <span className="text-2xl">🦷</span>
        </div>
        <Spinner size={40} color="#c9a84c" />
        <div className="text-sm font-display font-bold gold-text">Initialising DentAI Learn…</div>
      </div>
    );
  }

  if (!user) return <LoginPage />;
  return <AuthenticatedApp />;
}

// ── Root Export ───────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <AppCore />
    </AppProvider>
  );
}
