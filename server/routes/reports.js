import { Router } from "express";
import db from "../db.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, requireRole("faculty"), (req, res) => {
  const results = db.prepare(`
    SELECT qr.*, u.name as student_name, u.roll as student_roll, m.title as module_title
    FROM quiz_results qr
    JOIN users u ON qr.user_id = u.id
    LEFT JOIN modules m ON qr.module_id = m.id
    ORDER BY qr.id DESC
  `).all();
  res.json(results);
});

router.get("/stats", authenticateToken, requireRole("faculty"), (req, res) => {
  const studentCount = db.prepare("SELECT COUNT(*) as cnt FROM users WHERE role = 'student'").get().cnt;
  const totalAttempts = db.prepare("SELECT COUNT(*) as cnt FROM quiz_results").get().cnt;
  const passRate = db.prepare("SELECT AVG(passed) * 100 as rate FROM quiz_results").get().rate || 0;
  const avgScore = db.prepare("SELECT AVG(percentage) as avg FROM quiz_results").get().avg || 0;

  res.json({ studentCount, totalAttempts, passRate: Math.round(passRate), avgScore: Math.round(avgScore) });
});

router.get("/distribution", authenticateToken, requireRole("faculty"), (req, res) => {
  const ranges = [
    { label: "0-20%", min: 0, max: 20 },
    { label: "21-40%", min: 21, max: 40 },
    { label: "41-60%", min: 41, max: 60 },
    { label: "61-80%", min: 61, max: 80 },
    { label: "81-100%", min: 81, max: 100 },
  ];

  const distribution = ranges.map(r => {
    const count = db.prepare("SELECT COUNT(*) as cnt FROM quiz_results WHERE percentage >= ? AND percentage <= ?").get(r.min, r.max).cnt;
    return { label: r.label, count };
  });

  res.json(distribution);
});

export default router;
