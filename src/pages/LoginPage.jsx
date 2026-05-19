/**
 * pages/LoginPage.jsx
 * Premium DentAI Learn authentication — gold/navy split-panel design.
 */
import { useState } from "react";
import { AuthAPI } from "../backend/api.js";
import { useApp } from "../context/AppContext.jsx";
import { Spinner } from "../components/ui/index.jsx";

/* ── Pearl Tooth SVG ── */
function PearlTooth({ size = 90 }) {
  return (
    <svg width={size} height={size * 1.11} viewBox="0 0 90 100" style={{ animation: 'floatY 3s ease-in-out infinite', filter: 'drop-shadow(0 4px 12px rgba(201,168,76,0.3))' }}>
      <defs>
        <radialGradient id="toothG" cx="35%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#f8f0e4"/>
          <stop offset="25%" stopColor="#e8d8c0"/>
          <stop offset="50%" stopColor="#d4c0a0"/>
          <stop offset="75%" stopColor="#c0a888"/>
          <stop offset="100%" stopColor="#a89070"/>
        </radialGradient>
        <radialGradient id="iridG" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor="rgba(200,220,255,0.3)"/>
          <stop offset="30%" stopColor="rgba(180,255,200,0.2)"/>
          <stop offset="60%" stopColor="rgba(255,200,220,0.15)"/>
          <stop offset="100%" stopColor="transparent"/>
        </radialGradient>
        <linearGradient id="goldL" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c9a84c" stopOpacity=".6"/>
          <stop offset="50%" stopColor="#f0d080" stopOpacity=".8"/>
          <stop offset="100%" stopColor="#c9a84c" stopOpacity=".4"/>
        </linearGradient>
      </defs>
      <path d="M18 28 C18 18 22 10 32 8 C38 6 44 7 50 8 C60 10 70 18 72 28 C75 40 74 52 70 62 C68 68 65 76 60 82 C57 86 54 88 50 88 C47 88 45 86 44 83 C43 80 42 76 42 72 C42 72 40 72 40 72 C40 76 39 80 38 83 C37 86 35 88 32 88 C28 88 25 86 22 82 C17 76 14 68 12 62 C8 52 7 40 10 28 Z" fill="url(#toothG)"/>
      <path d="M18 28 C18 18 22 10 32 8 C38 6 44 7 50 8 C60 10 70 18 72 28 C75 40 74 52 70 62 C68 68 65 76 60 82 C57 86 54 88 50 88 C47 88 45 86 44 83 C43 80 42 76 42 72 C42 72 40 72 40 72 C40 76 39 80 38 83 C37 86 35 88 32 88 C28 88 25 86 22 82 C17 76 14 68 12 62 C8 52 7 40 10 28 Z" fill="url(#iridG)"/>
      <path d="M18 28 C18 18 22 10 32 8 C38 6 44 7 50 8 C60 10 70 18 72 28 C75 40 74 52 70 62 C68 68 65 76 60 82 C57 86 54 88 50 88 C47 88 45 86 44 83 C43 80 42 76 42 72 C42 72 40 72 40 72 C40 76 39 80 38 83 C37 86 35 88 32 88 C28 88 25 86 22 82 C17 76 14 68 12 62 C8 52 7 40 10 28 Z" fill="none" stroke="url(#goldL)" strokeWidth="1.5"/>
      <path d="M32 20 C32 20 34 38 34 55 C34 68 32 78 32 84" stroke="url(#goldL)" strokeWidth=".8" fill="none" strokeDasharray="3 4" opacity=".6"/>
      <path d="M50 20 C50 20 48 38 48 55 C48 68 50 78 50 84" stroke="url(#goldL)" strokeWidth=".8" fill="none" strokeDasharray="3 4" opacity=".6"/>
      <path d="M35 25 C35 20 40 18 45 18 C50 18 55 20 55 25 C55 32 52 42 45 48 C38 42 35 32 35 25Z" fill="rgba(200,100,100,0.2)" stroke="url(#goldL)" strokeWidth=".7"/>
      <ellipse cx="35" cy="22" rx="10" ry="7" fill="rgba(255,255,255,0.18)" transform="rotate(-20 35 22)"/>
    </svg>
  );
}

/* ── Tooth Logo Icon ── */
function ToothLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 4 C10 4 7 7 7 11 C7 14 8.5 16 10 17.5 L10 22 C10 23.1 10.9 24 12 24 L16 24 C17.1 24 18 23.1 18 22 L18 17.5 C19.5 16 21 14 21 11 C21 7 18 4 14 4Z" stroke="#c9a84c" strokeWidth="1.5" fill="none"/>
      <path d="M11 11 L17 11 M14 8 L14 14" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M10 5 L6 2 M18 5 L22 2" stroke="#c9a84c" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

export default function LoginPage() {
  const { setUser } = useApp();
  const [mode, setMode] = useState("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [roll, setRoll]         = useState("");
  const [role, setRole]         = useState("student");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const login = async (loginRole) => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    const user = await AuthAPI.login(email.trim(), password, loginRole || role);
    if (user) {
      setUser(user);
    } else {
      setError("Invalid credentials. Please check email and password.");
    }
    setLoading(false);
  };

  const signup = async () => {
    setError("");
    if (!name || !email || !password || !roll) {
      setError("Please fill all fields.");
      return;
    }
    setLoading(true);
    const user = await AuthAPI.register(name, email, password, role, roll);
    if (user) {
      setUser(user);
    } else {
      setError("Registration failed. Email may already exist.");
    }
    setLoading(false);
  };

  /* ── LOGIN VIEW ── */
  if (mode === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center font-body" style={{ background: 'linear-gradient(160deg, #060b16 0%, #0a1428 50%, #060b16 100%)' }}>
        {/* Ambient glow */}
        <div className="fixed top-1/4 left-1/3 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.08), transparent 70%)' }} />

        <div className="w-full max-w-4xl mx-4 animate-fade-up">
          <div className="overflow-hidden" style={{ borderRadius: '1.5rem', border: '2px solid rgba(201,168,76,0.3)', boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 60px rgba(201,168,76,0.06)' }}>
            <div className="grid grid-cols-1 md:grid-cols-[42%_58%] min-h-[520px]">

              {/* Left — Dark panel with tooth */}
              <div className="hidden md:flex flex-col items-center justify-center gap-4 relative" style={{ background: 'linear-gradient(160deg, #060b16, #0d1628)' }}>
                <div className="absolute right-0 top-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,0.3), transparent)' }} />
                <div className="text-3xl">🦷</div>
                <PearlTooth size={140} />
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-px w-7" style={{ background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />
                  <span className="text-xs font-black tracking-widest" style={{ color: '#c9a84c' }}>AI</span>
                  <div className="h-px w-7" style={{ background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />
                </div>
                <div className="flex gap-3 mt-2">
                  <span className="text-[10px] flex items-center gap-1" style={{ color: '#3a5070' }}><span style={{ color: '#c9a84c' }}>⬡</span> AI</span>
                  <span className="text-[10px]" style={{ color: '#3a5070' }}>Powered by AI + AR</span>
                  <span className="text-[10px] flex items-center gap-1" style={{ color: '#3a5070' }}><span style={{ color: '#c9a84c' }}>⬡</span> AR</span>
                </div>
              </div>

              {/* Right — Login form (cream/light) */}
              <div className="flex flex-col p-8 md:p-10 gap-5" style={{ background: '#f5f2ee' }}>
                <div>
                  <h1 className="font-display font-black text-2xl tracking-wide" style={{ color: '#1a1208' }}>
                    Dent<span style={{ color: '#c9a84c' }}>AI</span> Learn
                  </h1>
                  <p className="text-xs mt-1" style={{ color: '#9a8870', letterSpacing: '0.08em' }}>Professional Learning Platform</p>
                </div>

                <h2 className="text-base font-black" style={{ color: '#1a1208' }}>Sign in to your account</h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest mb-1 block" style={{ color: '#5a4a30' }}>Email</label>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: '#fff', border: '1.5px solid #e0d5c0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <span className="text-sm opacity-40">✉</span>
                      <input
                        type="email" value={email} onChange={e => setEmail(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && login()}
                        placeholder="Enter your university email"
                        className="flex-1 bg-transparent outline-none text-sm"
                        style={{ color: '#5a4a30' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest mb-1 block" style={{ color: '#5a4a30' }}>Password</label>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: '#fff', border: '1.5px solid #e0d5c0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <span className="text-sm opacity-40">🔒</span>
                      <input
                        type="password" value={password} onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && login()}
                        placeholder="Enter your password"
                        className="flex-1 bg-transparent outline-none text-sm"
                        style={{ color: '#5a4a30' }}
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="px-4 py-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}>
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => login("student")} disabled={loading}
                    className="py-3 rounded-3xl font-black text-sm text-white cursor-pointer transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #a07820, #c9a84c, #e8c66a)', boxShadow: '0 4px 16px rgba(201,168,76,0.4)', letterSpacing: '0.04em' }}
                  >
                    {loading ? <Spinner size={16} color="#fff" /> : "🎓"} Student
                  </button>
                  <button
                    onClick={() => login("faculty")} disabled={loading}
                    className="py-3 rounded-3xl font-black text-sm text-white cursor-pointer transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}
                  >
                    {loading ? <Spinner size={16} color="#fff" /> : "👩‍⚕️"} Faculty
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: '#e0d5c0' }} />
                  <span className="text-xs" style={{ color: '#aaa' }}>Or</span>
                  <div className="flex-1 h-px" style={{ background: '#e0d5c0' }} />
                </div>

                <p className="text-center text-sm" style={{ color: '#888' }}>
                  New user?{" "}
                  <button onClick={() => { setMode("signup"); setError(""); }} className="font-bold cursor-pointer bg-transparent border-none" style={{ color: '#c9a84c' }}>
                    Create an account
                  </button>
                </p>

                {/* Demo creds */}
                <div className="p-3 rounded-xl text-xs space-y-1" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
                  <div className="font-bold mb-1" style={{ color: '#5a4a30' }}>Demo Credentials</div>
                  <div style={{ color: '#8a7860' }}>Student: <span className="font-mono" style={{ color: '#c9a84c' }}>student@bahria.edu.pk</span> / <span className="font-mono">student123</span></div>
                  <div style={{ color: '#8a7860' }}>Faculty: <span className="font-mono" style={{ color: '#8B5CF6' }}>faculty@bahria.edu.pk</span> / <span className="font-mono">faculty123</span></div>
                </div>
              </div>
            </div>
          </div>
          {/* Badge */}
          <div className="text-center mt-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold" style={{ border: '1px solid rgba(201,168,76,0.4)', background: 'rgba(201,168,76,0.1)', color: '#c9a84c' }}>
              Bahria University · BSCS 8 · CV Assignment #3
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* ── SIGNUP VIEW ── */
  return (
    <div className="min-h-screen flex items-center justify-center font-body relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #060b16, #0a1428)' }}>
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.12), transparent 70%)' }} />
      <div className="hex-bg" />

      <div className="w-full max-w-sm mx-4 animate-fade-up relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'linear-gradient(135deg, #0d1a30, #1a2d50)', border: '1.5px solid rgba(201,168,76,0.6)', boxShadow: '0 0 14px rgba(201,168,76,0.25)' }}>
            <ToothLogo />
          </div>
          <h1 className="font-display font-black text-xl gold-text tracking-wider">DentAI Learn</h1>
          <div className="text-2xl mt-1">🦷</div>
        </div>

        {/* Card */}
        <div className="p-6" style={{ background: 'rgba(16,26,46,0.95)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: '1.25rem' }}>
          {/* Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl mb-5" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <button
              onClick={() => setRole("student")}
              className={`py-2 rounded-lg text-sm font-black text-center cursor-pointer transition-all ${role === "student" ? "text-white" : ""}`}
              style={role === "student" ? { background: 'linear-gradient(135deg, #a07820, #c9a84c)', boxShadow: '0 3px 10px rgba(201,168,76,0.3)' } : { color: '#3a5a7a', background: 'transparent', border: 'none' }}
            >
              🎓 Student
            </button>
            <button
              onClick={() => setRole("faculty")}
              className={`py-2 rounded-lg text-sm font-black text-center cursor-pointer transition-all ${role === "faculty" ? "text-white" : ""}`}
              style={role === "faculty" ? { background: 'linear-gradient(135deg, #a07820, #c9a84c)', boxShadow: '0 3px 10px rgba(201,168,76,0.3)' } : { color: '#3a5a7a', background: 'transparent', border: 'none' }}
            >
              👩‍⚕️ Faculty
            </button>
          </div>

          <h2 className="text-center font-black text-sm mb-4" style={{ color: '#e8edf5' }}>
            {role === "student" ? "Student" : "Faculty"} Registration
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: '#4a6a8a' }}>Name</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)' }}>
                <span className="text-sm opacity-50">👤</span>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., John Doe" className="flex-1 bg-transparent outline-none text-sm" style={{ color: '#c8d5e5' }} />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: '#4a6a8a' }}>Roll Number</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)' }}>
                <span className="text-sm opacity-50">🪪</span>
                <input type="text" value={roll} onChange={e => setRoll(e.target.value)} placeholder="e.g., BS-CS-21-001" className="flex-1 bg-transparent outline-none text-sm" style={{ color: '#c8d5e5' }} />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: '#4a6a8a' }}>Email</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)' }}>
                <span className="text-sm opacity-50">✉</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john.doe@uni.edu" className="flex-1 bg-transparent outline-none text-sm" style={{ color: '#c8d5e5' }} />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: '#4a6a8a' }}>Password</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(201,168,76,0.18)' }}>
                <span className="text-sm opacity-50">🔒</span>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="flex-1 bg-transparent outline-none text-sm" style={{ color: '#c8d5e5' }} />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-3 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}>
              {error}
            </div>
          )}

          <button
            onClick={signup} disabled={loading}
            className="w-full mt-4 py-3 rounded-3xl font-black text-sm text-white cursor-pointer transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #a07820, #c9a84c)', boxShadow: '0 4px 14px rgba(201,168,76,0.35)', letterSpacing: '0.04em' }}
          >
            {loading ? <Spinner size={16} color="#fff" /> : "✨"} Create {role === "student" ? "Student" : "Faculty"} Account
          </button>

          <p className="text-center text-xs mt-3" style={{ color: '#3a5a7a' }}>
            Already have an account?{" "}
            <button onClick={() => { setMode("login"); setError(""); }} className="font-bold cursor-pointer bg-transparent border-none" style={{ color: '#c9a84c' }}>
              Log In
            </button>
          </p>
        </div>

        <div className="text-center mt-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold" style={{ border: '1px solid rgba(201,168,76,0.4)', background: 'rgba(201,168,76,0.1)', color: '#c9a84c' }}>
            Bahria University · BSCS 8 · CV Assignment #3
          </span>
        </div>
      </div>
    </div>
  );
}
