/**
 * pages/student/ChatbotPage.jsx
 */
import { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { ChatAPI, ClaudeAPI } from "../../backend/api.js";
import { Button, Spinner, SectionHeader } from "../../components/ui/index.jsx";

const SYSTEM_PROMPT = `You are DentAI, a brilliant and friendly dental education assistant embedded in DentAI Learn at Bahria University (BSCS 8, Computer Vision Assignment). You are powered by Groq AI and specialize in Odontogenic Oral Pathology.

Your expertise covers:
- Odontogenic cysts (dentigerous, OKC/keratocyst, radicular, lateral periodontal)
- Odontogenic tumors (ameloblastoma, odontoma, CEOT/Pindborg, odontogenic myxoma)
- Inflammatory periapical lesions (granuloma, abscess, radicular cyst)
- Developmental anomalies (taurodontism, enamel hypoplasia, gemination, fusion, dilaceration)
- Bone pathologies (fibrous dysplasia, cherubism, ossifying fibroma)
- Salivary gland disorders (mucocele, ranula, Sjögren syndrome, pleomorphic adenoma)
- Radiographic interpretation, histological features, and differential diagnosis

Style: Be concise, educational, and warm. Use **bold** for key terms. Use bullet points for lists. Keep answers under 200 words unless asked to elaborate. Use emojis sparingly to highlight key points.`;

const SUGGESTIONS = [
  "Explain the OKC in simple terms",
  "What is Gorlin-Goltz syndrome?",
  "Ameloblastoma vs dentigerous cyst?",
  "Quiz me on periapical lesions",
  "Key histology of CEOT?",
];

function renderText(text) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <div key={i} className={line ? "mb-0.5" : "mb-2"}>
        {parts.map((p, j) =>
          p.startsWith("**") && p.endsWith("**")
            ? <strong key={j} style={{ color: '#c9a84c' }}>{p.slice(2, -2)}</strong>
            : p
        )}
      </div>
    );
  });
}

export default function ChatbotPage() {
  const { user } = useApp();
  const WELCOME = { role: "bot", text: `\u{1F44B} Hi ${user.name.split(" ")[0]}! I'm **DentAI** — your expert oral pathology assistant.\n\nI can help you with:\n• Odontogenic cysts, tumours & inflammatory lesions\n• Quiz preparation & mnemonics\n• Case-based differential diagnosis\n• Histology, radiology & treatment\n\nWhat would you like to explore today?` };

  const [msgs, setMsgs]     = useState([WELCOME]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  useEffect(() => {
    ChatAPI.getHistory(user.id).then(h => {
      if (h.length > 0) setMsgs([WELCOME, ...h]);
    });
  }, []);

  const send = async (text) => {
    const userMsg = (text || input).trim();
    if (!userMsg || loading) return;
    setInput("");

    const newMsgs = [...msgs, { role: "user", text: userMsg }];
    setMsgs(newMsgs);
    setLoading(true);

    try {
      const apiMsgs = newMsgs.slice(1).map(m => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.text,
      }));
      const reply = await ClaudeAPI.chat(apiMsgs, SYSTEM_PROMPT);
      const final = [...newMsgs, { role: "bot", text: reply }];
      setMsgs(final);
      await ChatAPI.saveHistory(user.id, final.slice(1));
    } catch {
      setMsgs(m => [...m, { role: "bot", text: "⚠️ Connection error. Please check your internet connection and try again." }]);
    }
    setLoading(false);
  };

  const clearChat = async () => {
    await ChatAPI.clear(user.id);
    setMsgs([WELCOME]);
  };

  return (
    <div className="animate-fade-up flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="font-display gold-text text-2xl font-bold tracking-wide">DentAI Learn</h1>
          <p style={{ color: '#4a6080' }} className="text-sm mt-1">DentAI — Powered by Groq AI · Oral Pathology Expert</p>
        </div>
        <button
          onClick={clearChat}
          className="text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer"
          style={{
            background: 'transparent',
            color: '#c9a84c',
            border: '1px solid rgba(201,168,76,0.28)',
          }}
        >
          Clear Chat
        </button>
      </div>

      <div
        className="flex flex-col flex-1 min-h-0 overflow-hidden rounded-xl"
        style={{
          height: "calc(100vh - 220px)",
          background: 'rgba(13,21,37,0.92)',
          border: '1px solid rgba(201,168,76,0.14)',
        }}
      >
        {/* Chat header */}
        <div
          className="flex items-center gap-3 px-5 py-3 shrink-0"
          style={{
            background: '#0a1220',
            borderBottom: '1px solid rgba(201,168,76,0.1)',
          }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
            style={{
              background: 'linear-gradient(135deg, #a07820, #c9a84c)',
              border: '2px solid #c9a84c',
            }}
          >
            {'\u{1F9B7}'}
          </div>
          <div>
            <div className="font-black text-sm" style={{ color: '#e8edf5' }}>DentAI Assistant</div>
            <div className="text-xs" style={{ color: '#c9a84c' }}>{'●'} Online {'·'} Expert Oral Pathology AI</div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "rounded-2xl rounded-br-sm"
                    : "rounded-2xl rounded-bl-sm"
                }`}
                style={
                  m.role === "user"
                    ? {
                        background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.12))',
                        border: '1px solid rgba(201,168,76,0.28)',
                        color: '#e8edf5',
                      }
                    : {
                        background: 'rgba(13,21,37,0.98)',
                        border: '1px solid rgba(201,168,76,0.14)',
                        color: '#e8edf5',
                      }
                }
              >
                {m.role === "bot" ? renderText(m.text) : m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div
                className="rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5"
                style={{
                  background: 'rgba(13,21,37,0.98)',
                  border: '1px solid rgba(201,168,76,0.14)',
                }}
              >
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: '#c9a84c',
                      animation: `bounceDot 1.2s ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Suggestions (only on fresh chat) */}
        {msgs.length <= 2 && (
          <div
            className="px-4 pb-2 flex gap-2 flex-wrap pt-3"
            style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}
          >
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-full transition-colors cursor-pointer font-medium"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(201,168,76,0.14)',
                  color: '#4a6080',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)';
                  e.currentTarget.style.color = '#c9a84c';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.14)';
                  e.currentTarget.style.color = '#4a6080';
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div
          className="p-3 flex gap-2 shrink-0"
          style={{
            background: 'rgba(8,14,28,0.98)',
            borderTop: '1px solid rgba(201,168,76,0.1)',
          }}
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Ask about any oral pathology topic…"
            className="flex-1 text-sm rounded-lg px-4 py-2.5 outline-none"
            style={{
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(201,168,76,0.14)',
              color: '#e8edf5',
            }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="px-4 rounded-lg text-sm font-bold cursor-pointer"
            style={{
              background: loading || !input.trim()
                ? 'rgba(160,120,32,0.3)'
                : 'linear-gradient(135deg, #a07820, #c9a84c)',
              color: loading || !input.trim() ? '#6b5a2e' : '#0a1220',
              border: 'none',
              opacity: loading || !input.trim() ? 0.5 : 1,
            }}
          >
            {'➤'}
          </button>
        </div>
      </div>
    </div>
  );
}
