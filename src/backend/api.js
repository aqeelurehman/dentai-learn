/**
 * backend/api.js
 * All application data operations — the "API" layer.
 * Components import from here, never from db.js directly.
 * Supports both backend server (when available) and localStorage fallback.
 */
import DB from "./db.js";

// In production the frontend is served by Express on the same origin,
// so "/api" is enough.  In dev, Vite proxies /api → localhost:5000.
const API_URL = "/api";

async function serverCall(endpoint, options = {}) {
  try {
    const token = localStorage.getItem("dentpath_token");
    const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const AuthAPI = {
  async login(email, password, role) {
    if (!email || !password || !role) return null;

    // Try backend server first
    const serverRes = await serverCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    });
    if (serverRes && serverRes.user) {
      localStorage.setItem("dentpath_token", serverRes.token);
      return serverRes.user;
    }

    // Fallback to localStorage (strict match only)
    const users = (await DB.get("users")) || [];
    return users.find(
      (u) => u.role === role && u.email === email && u.password === password
    ) || null;
  },

  async register(name, email, password, role, roll) {
    const serverRes = await serverCall("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role, roll }),
    });
    if (serverRes && serverRes.user) {
      localStorage.setItem("dentpath_token", serverRes.token);
      return serverRes.user;
    }
    return null;
  },

  logout() {
    localStorage.removeItem("dentpath_token");
  },
};

// ── Modules ───────────────────────────────────────────────────────────────────
export const ModulesAPI = {
  async getAll()         { return (await DB.get("modules")) || []; },
  async getById(id)      { const all = await this.getAll(); return all.find(m => m.id === id) || null; },
  async create(mod)      { const all = await this.getAll(); const n = [...all, { ...mod, id: `m${Date.now()}` }]; await DB.set("modules", n); return n; },
  async update(id, data) { const all = await this.getAll(); const n = all.map(m => m.id === id ? { ...m, ...data } : m); await DB.set("modules", n); return n; },
  async remove(id)       { const all = await this.getAll(); const n = all.filter(m => m.id !== id); await DB.set("modules", n); return n; },
};

// ── Progress ──────────────────────────────────────────────────────────────────
export const ProgressAPI = {
  async get(userId)           { return (await DB.get(`progress_${userId}`)) || {}; },
  async set(userId, moduleId, pct) {
    const prog = await this.get(userId);
    prog[moduleId] = pct;
    await DB.set(`progress_${userId}`, prog);
    return prog;
  },
};

// ── Notes ─────────────────────────────────────────────────────────────────────
export const NotesAPI = {
  async get(userId, moduleId)        { return (await DB.get(`note_${userId}_${moduleId}`)) || ""; },
  async save(userId, moduleId, text) { await DB.set(`note_${userId}_${moduleId}`, text); },
};

// ── Bookmarks ─────────────────────────────────────────────────────────────────
export const BookmarksAPI = {
  async get(userId)    { return (await DB.get(`bookmarks_${userId}`)) || []; },
  async toggle(userId, moduleId) {
    const bm = await this.get(userId);
    const n = bm.includes(moduleId) ? bm.filter(x => x !== moduleId) : [...bm, moduleId];
    await DB.set(`bookmarks_${userId}`, n);
    return n;
  },
  async remove(userId, moduleId) {
    const bm = await this.get(userId);
    const n = bm.filter(x => x !== moduleId);
    await DB.set(`bookmarks_${userId}`, n);
    return n;
  },
};

// ── Quiz Bank ─────────────────────────────────────────────────────────────────
export const QuizAPI = {
  async getBank()        { return (await DB.get("quiz_bank")) || []; },
  async addQuestion(q)   { const bank = await this.getBank(); const n = [...bank, { ...q, id: `q${Date.now()}` }]; await DB.set("quiz_bank", n); return n; },
  async updateQuestion(id, data) { const bank = await this.getBank(); const n = bank.map(q => q.id === id ? { ...q, ...data } : q); await DB.set("quiz_bank", n); return n; },
  async deleteQuestion(id)       { const bank = await this.getBank(); const n = bank.filter(q => q.id !== id); await DB.set("quiz_bank", n); return n; },

  async getHistory(userId)   { return (await DB.get(`quiz_history_${userId}`)) || []; },
  async saveResult(userId, result) {
    const history = await this.getHistory(userId);
    const updated = [...history, { ...result, date: new Date().toLocaleDateString() }];
    await DB.set(`quiz_history_${userId}`, updated);
    // Also save to global results for faculty
    const all = (await DB.get("all_quiz_results")) || [];
    await DB.set("all_quiz_results", [...all, { ...result, date: new Date().toLocaleDateString() }]);
  },

  async getAllResults() { return (await DB.get("all_quiz_results")) || []; },
};

// ── Cases ─────────────────────────────────────────────────────────────────────
export const CasesAPI = {
  async getAll()         { return (await DB.get("cases")) || []; },
  async create(c)        { const all = await this.getAll(); const n = [...all, { ...c, id: `c${Date.now()}` }]; await DB.set("cases", n); return n; },
  async update(id, data) { const all = await this.getAll(); const n = all.map(c => c.id === id ? { ...c, ...data } : c); await DB.set("cases", n); return n; },
  async remove(id)       { const all = await this.getAll(); const n = all.filter(c => c.id !== id); await DB.set("cases", n); return n; },

  async getSolved(userId)      { return (await DB.get(`solved_${userId}`)) || {}; },
  async saveSolved(userId, caseId, data) {
    const sv = await this.getSolved(userId);
    const n = { ...sv, [caseId]: data };
    await DB.set(`solved_${userId}`, n);
    return n;
  },
};

// ── Announcements ─────────────────────────────────────────────────────────────
export const AnnouncementsAPI = {
  async getAll()    { return (await DB.get("announcements")) || []; },
  async create(a)   { const all = await this.getAll(); const n = [{ ...a, id: `an${Date.now()}`, date: new Date().toLocaleDateString() }, ...all]; await DB.set("announcements", n); return n; },
  async remove(id)  { const all = await this.getAll(); const n = all.filter(a => a.id !== id); await DB.set("announcements", n); return n; },
};

// ── Chat History ──────────────────────────────────────────────────────────────
export const ChatAPI = {
  async getHistory(userId) { return (await DB.get(`chat_${userId}`)) || []; },
  async saveHistory(userId, messages) {
    await DB.set(`chat_${userId}`, messages.slice(-30));
  },
  async clear(userId) { await DB.del(`chat_${userId}`); },
};

// ── PDF Uploads ───────────────────────────────────────────────────────────────
export const UploadsAPI = {
  async getAll(userId)     { return (await DB.get(`uploads_${userId}`)) || []; },
  async add(userId, entry) {
    const all = await this.getAll(userId);
    const n = [entry, ...all];
    await DB.set(`uploads_${userId}`, n);
    return n;
  },
};

// ── Users (faculty) ───────────────────────────────────────────────────────────
export const LecturesAPI = {
  async getAll()         { return (await DB.get("lectures")) || []; },
  async create(lec)      { const all = await this.getAll(); const n = [{ ...lec, id: `lec${Date.now()}`, date: new Date().toLocaleDateString() }, ...all]; await DB.set("lectures", n); return n; },
  async update(id, data) { const all = await this.getAll(); const n = all.map(l => l.id === id ? { ...l, ...data } : l); await DB.set("lectures", n); return n; },
  async remove(id)       { const all = await this.getAll(); const n = all.filter(l => l.id !== id); await DB.set("lectures", n); return n; },
};

export const UsersAPI = {
  async getStudents() { const all = (await DB.get("users")) || []; return all.filter(u => u.role === "student"); },
};

// ── Groq AI (via backend proxy) ─────────────────────────────────────────────
export const ClaudeAPI = {
  async chat(messages, systemPrompt) {
    const res = await fetch(`${API_URL}/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, systemPrompt }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server error: ${res.status}`);
    }
    const data = await res.json();
    return data.text || "Sorry, could not get a response.";
  },

  async generateModule(topic) {
    const res = await fetch(`${API_URL}/ai/generate-module`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to generate module");
    }
    return await res.json();
  },

  async analyzePDF(file) {
    /* Upload PDF to server → PaddleOCR extracts text → Groq AI analyzes.
       The file param is now a File object (not base64). */
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("dentpath_token");
    const res = await fetch(`${API_URL}/upload/ocr-analyze`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "PDF analysis failed");
    }
    return await res.json();
  },
};
