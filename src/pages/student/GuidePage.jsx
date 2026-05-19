/**
 * pages/student/GuidePage.jsx
 * In-app user guide explaining all features.
 */
import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { Button, Badge, SectionHeader } from "../../components/ui/index.jsx";

const SECTIONS = [
  {
    id: "login",
    title: "Getting Started",
    icon: "🔐",
    color: "#c9a84c",
    content: [
      { heading: "Logging In", text: "Use your Bahria University credentials to log in. Select your role (Student or Faculty) and enter your email and password. Demo credentials are pre-filled for quick access." },
      { heading: "Demo Accounts", text: "Student: student@bahria.edu.pk / student123\nFaculty: faculty@bahria.edu.pk / faculty123" },
      { heading: "Navigation", text: "Use the sidebar on the left to navigate between pages. The sidebar is organised into sections: Learn, Tools, and Me for students; Overview, Manage, and Tools for faculty." },
    ],
  },
  {
    id: "modules",
    title: "3D Learning Modules",
    icon: "🦷",
    color: "#10B981",
    content: [
      { heading: "Browsing Modules", text: "The Modules page shows all available pathology topics as cards. Each card shows progress, tags, and a brief description. Click any card to open the full module." },
      { heading: "3D Tooth Model", text: "Each module includes an interactive 3D tooth model. Click and drag to rotate the model in 3D space. The model highlights Crown, CEJ (cemento-enamel junction), and Root regions." },
      { heading: "Study Content", text: "Study material is presented in a structured format with bold headings and detailed explanations for each condition. Read through the content and use the progress tracker below to mark your advancement." },
      { heading: "Notes & Bookmarks", text: "Write personal notes in the Notes section — they are saved per module and per user. Click the bookmark icon to save a module for quick access from the Bookmarks page." },
      { heading: "Progress Tracking", text: "Use the 25%, 50%, 75%, 100% buttons to manually set your reading progress. This is reflected on the Dashboard and Profile pages." },
    ],
  },
  {
    id: "quiz",
    title: "Quiz System",
    icon: "📝",
    color: "#8B5CF6",
    content: [
      { heading: "Configuring a Quiz", text: "Before starting, choose your Module filter (or All Modules), Difficulty level, and number of questions (3, 5, 7, or 10). The system shows how many questions are available for your selection." },
      { heading: "Taking a Quiz", text: "Questions appear one at a time with a running timer. Click an answer to select it — the correct answer is highlighted in green immediately. Read the explanation shown below each question, then click Next." },
      { heading: "Reviewing Results", text: "After completing a quiz, you see your score percentage, pass/fail status, correct/wrong counts, and time taken. Scroll down to review every question with your answer and the correct answer." },
      { heading: "Quiz History", text: "All quiz results are saved to your profile and visible on the Dashboard. Faculty can also see all student results in the Student Reports page." },
    ],
  },
  {
    id: "cases",
    title: "Clinical Case Studies",
    icon: "🔍",
    color: "#F59E0B",
    content: [
      { heading: "Case List", text: "The Cases page lists clinical scenarios with patient presentations. Filter by All, Solved, or Unsolved. Each case shows difficulty level and topic tags." },
      { heading: "Attempting a Case", text: "Open a case to see Patient History and Clinical Findings side by side. Under Your Diagnosis, choose from the differential diagnosis options and click Submit Diagnosis." },
      { heading: "Learning from Cases", text: "After submission, you see whether your diagnosis was correct along with a detailed explanation covering key differentiating features and why alternatives were ruled out." },
    ],
  },
  {
    id: "ar",
    title: "AR Topic Explorer",
    icon: "🥽",
    color: "#EC4899",
    content: [
      { heading: "How AR Works", text: "The AR Explorer provides augmented reality-style topic exploration. Select a dental topic from the grid (Tooth Anatomy, Cyst Expansion, Root Resorption, etc.) to simulate an AR scanning experience." },
      { heading: "Scanning Topics", text: "After selecting a topic, the viewport shows a scanning animation. Once complete, you can view the 3D overlay visualisation for that topic." },
      { heading: "Linked Modules", text: "The right panel shows linked study modules that relate to the AR topics, making it easy to jump to deeper study material." },
    ],
  },
  {
    id: "chatbot",
    title: "AI Assistant (DentAI)",
    icon: "🤖",
    color: "#c9a84c",
    content: [
      { heading: "Chatting with DentAI", text: "DentAI is an AI-powered oral pathology assistant. Type your question in the input field and press Enter or click Send. The AI responds with structured, educational answers." },
      { heading: "Suggested Questions", text: "On a fresh chat, quick suggestion buttons appear for common topics like OKC explanation, Gorlin-Goltz syndrome, or ameloblastoma differential diagnosis." },
      { heading: "Chat History", text: "Your conversation is saved across sessions (up to 30 messages). Use the Clear Chat button to start fresh." },
    ],
  },
  {
    id: "pdf",
    title: "PDF Upload & Study",
    icon: "📄",
    color: "#10B981",
    content: [
      { heading: "Uploading a PDF", text: "Click Browse PDF or drag your study material PDF into the upload area. The AI analyses the document automatically — extracting topics, key terms, and generating quiz questions." },
      { heading: "AI Analysis Results", text: "After processing, you see a summary, detected topics, and key terms. If questions were generated, a Start Quiz button appears to test yourself on the uploaded content." },
      { heading: "PDF Quiz", text: "The auto-generated quiz works like the main quiz — select answers, see explanations, and get a final score. This is a powerful tool for self-study from any dental material." },
      { heading: "Upload History", text: "Previously uploaded PDFs are listed in the right panel with their topics and upload date." },
    ],
  },
  {
    id: "faculty",
    title: "Faculty Features",
    icon: "👩‍⚕️",
    color: "#8B5CF6",
    content: [
      { heading: "Faculty Dashboard", text: "Shows student count, quiz attempts, pass rate, and class average. Quick action buttons lead to Reports, Quiz Bank, Modules, and Announcements." },
      { heading: "Student Reports", text: "View all student quiz results in a filterable, sortable table. Filter by Pass/Fail, search by name or roll number, and sort by date, score, or name. A score distribution chart shows class performance." },
      { heading: "Quiz Bank", text: "Add, edit, or delete quiz questions. Each question has a module assignment, difficulty level, four options with a correct answer marker, and an explanation. Filter by module to manage questions efficiently." },
      { heading: "Module Management", text: "Create, edit, or delete learning modules. Each module has a title, emoji, accent colour, tags, description, and full study content using markdown-style formatting." },
      { heading: "Case Studies Management", text: "Add, edit, or delete clinical case studies. Each case includes title, patient history, clinical findings, correct answer, differential diagnoses, and explanation." },
      { heading: "Announcements", text: "Post announcements with Normal or High Priority. High priority announcements appear with a red indicator. Students see these on their Dashboard." },
    ],
  },
];

export default function GuidePage() {
  const { setPage } = useApp();
  const [activeSection, setActiveSection] = useState(null);
  const active = SECTIONS.find(s => s.id === activeSection);

  if (active) {
    return (
      <div className="animate-fade-up max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => setActiveSection(null)} className="text-xs">← All Topics</Button>
          <span className="text-3xl">{active.icon}</span>
          <h1 className="section-title" style={{ color: active.color }}>{active.title}</h1>
        </div>
        <div className="space-y-4">
          {active.content.map((item, i) => (
            <div key={i} className="card" style={{ borderColor: `${active.color}33` }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white" style={{ background: active.color }}>
                  {i + 1}
                </div>
                <h3 className="font-black text-sm text-dp-text">{item.heading}</h3>
              </div>
              <p className="text-sm text-dp-muted leading-relaxed whitespace-pre-line">{item.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <Button variant="ghost" onClick={() => setActiveSection(null)}>← Back to Guide</Button>
          {active.id !== "faculty" && (
            <Button onClick={() => setPage(active.id === "login" ? "dashboard" : active.id === "modules" ? "modules" : active.id === "quiz" ? "quiz" : active.id === "cases" ? "cases" : active.id === "ar" ? "ar" : active.id === "chatbot" ? "chatbot" : active.id === "pdf" ? "pdf" : "dashboard")}>
              Open {active.title} →
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <SectionHeader
        title="📖 User Guide"
        subtitle="Learn how to use every feature of DentAI Learn"
      />

      <div className="card mb-6" style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.03))", borderColor: "rgba(201,168,76,0.2)" }}>
        <div className="flex items-center gap-4">
          <div className="text-4xl">🦷</div>
          <div>
            <h2 className="text-lg font-black font-display gold-text">Welcome to DentAI Learn</h2>
            <p className="text-sm mt-1" style={{ color: '#4a6080' }}>
              An interactive educational application for Odontogenic Oral Pathology. This guide covers all features available to students and faculty.
            </p>
            <div className="flex gap-2 mt-3">
              <Badge color="#c9a84c">BSCS 8</Badge>
              <Badge color="#c9a84c">Computer Vision</Badge>
              <Badge color="#10B981">Bahria University</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {SECTIONS.map(s => (
          <div
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className="card-hover flex items-start gap-4"
            style={{ borderColor: `${s.color}33` }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: `${s.color}18`, border: `1px solid ${s.color}44` }}
            >
              {s.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-sm text-dp-text mb-1">{s.title}</h3>
              <p className="text-xs text-dp-muted">{s.content.length} topics covered</p>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {s.content.slice(0, 2).map(c => (
                  <Badge key={c.heading} color={s.color} className="text-[10px]">{c.heading}</Badge>
                ))}
                {s.content.length > 2 && (
                  <span className="text-[10px] text-dp-muted">+{s.content.length - 2} more</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
