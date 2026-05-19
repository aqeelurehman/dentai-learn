import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

import { initDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import modulesRoutes from "./routes/modules.js";
import quizRoutes from "./routes/quiz.js";
import reportsRoutes from "./routes/reports.js";
import uploadRoutes from "./routes/upload.js";
import casesRoutes from "./routes/cases.js";
import announcementsRoutes from "./routes/announcements.js";
import aiRoutes from "./routes/ai.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use("/uploads", express.static(join(__dirname, "uploads")));

initDB();

// ── API Routes ──────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/modules", modulesRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/cases", casesRoutes);
app.use("/api/announcements", announcementsRoutes);
app.use("/api/ai", aiRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Serve React Frontend (production) ───────────────────────────────────────
// After `npm run build`, the compiled frontend lives in ../dist
const distPath = join(__dirname, "..", "dist");
app.use(express.static(distPath));

// All non-API routes → index.html (SPA client-side routing)
// Express v5 requires named wildcard parameter
app.get("/{*splat}", (req, res) => {
  res.sendFile(join(distPath, "index.html"));
});

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`DentAI Learn Server running on port ${PORT}`);
  console.log(`Groq AI: ${process.env.GROQ_API_KEY ? 'Key configured ✓' : '⚠ GROQ_API_KEY not set in server/.env'}`);
});
