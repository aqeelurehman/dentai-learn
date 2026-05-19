import { Router } from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, (req, res) => {
  const cases = db.prepare("SELECT * FROM cases ORDER BY id").all();
  res.json(cases.map(c => ({ ...c, tags: JSON.parse(c.tags || "[]"), ddx: JSON.parse(c.ddx || "[]") })));
});

router.post("/", authenticateToken, (req, res) => {
  const { title, history, findings, tags, difficulty, answer, ddx, explanation } = req.body;
  const result = db.prepare("INSERT INTO cases (title, history, findings, tags, difficulty, answer, ddx, explanation) VALUES (?,?,?,?,?,?,?,?)")
    .run(title, history, findings, JSON.stringify(tags || []), difficulty, answer, JSON.stringify(ddx || []), explanation);
  res.json({ id: result.lastInsertRowid });
});

router.put("/:id", authenticateToken, (req, res) => {
  const { title, history, findings, tags, difficulty, answer, ddx, explanation } = req.body;
  db.prepare("UPDATE cases SET title=?, history=?, findings=?, tags=?, difficulty=?, answer=?, ddx=?, explanation=? WHERE id=?")
    .run(title, history, findings, JSON.stringify(tags || []), difficulty, answer, JSON.stringify(ddx || []), explanation, req.params.id);
  res.json({ success: true });
});

router.delete("/:id", authenticateToken, (req, res) => {
  db.prepare("DELETE FROM cases WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

export default router;
