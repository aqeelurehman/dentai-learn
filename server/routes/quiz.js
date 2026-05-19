import { Router } from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.get("/questions", authenticateToken, (req, res) => {
  const { module_id, difficulty } = req.query;
  let query = "SELECT * FROM quiz_questions WHERE 1=1";
  const params = [];

  if (module_id) { query += " AND module_id = ?"; params.push(module_id); }
  if (difficulty) { query += " AND difficulty = ?"; params.push(difficulty); }

  const questions = db.prepare(query).all(...params);
  res.json(questions.map(q => ({ ...q, options: JSON.parse(q.options) })));
});

router.post("/questions", authenticateToken, (req, res) => {
  const { module_id, difficulty, question, options, correct_answer, explanation } = req.body;
  const result = db.prepare("INSERT INTO quiz_questions (module_id, difficulty, question, options, correct_answer, explanation) VALUES (?,?,?,?,?,?)")
    .run(module_id, difficulty, question, JSON.stringify(options), correct_answer, explanation);
  res.json({ id: result.lastInsertRowid });
});

router.put("/questions/:id", authenticateToken, (req, res) => {
  const { module_id, difficulty, question, options, correct_answer, explanation } = req.body;
  db.prepare("UPDATE quiz_questions SET module_id=?, difficulty=?, question=?, options=?, correct_answer=?, explanation=? WHERE id=?")
    .run(module_id, difficulty, question, JSON.stringify(options), correct_answer, explanation, req.params.id);
  res.json({ success: true });
});

router.delete("/questions/:id", authenticateToken, (req, res) => {
  db.prepare("DELETE FROM quiz_questions WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

router.post("/submit", authenticateToken, (req, res) => {
  const { module_id, score, total, percentage, passed } = req.body;
  const result = db.prepare("INSERT INTO quiz_results (user_id, module_id, score, total, percentage, passed) VALUES (?,?,?,?,?,?)")
    .run(req.user.id, module_id, score, total, percentage, passed ? 1 : 0);
  res.json({ id: result.lastInsertRowid });
});

router.get("/history", authenticateToken, (req, res) => {
  const results = db.prepare("SELECT * FROM quiz_results WHERE user_id = ? ORDER BY id DESC").all(req.user.id);
  res.json(results);
});

export default router;
