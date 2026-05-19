import { Router } from "express";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, (req, res) => {
  const modules = db.prepare("SELECT * FROM modules ORDER BY id").all();
  res.json(modules.map(m => ({ ...m, tags: JSON.parse(m.tags || "[]") })));
});

router.get("/:id", authenticateToken, (req, res) => {
  const mod = db.prepare("SELECT * FROM modules WHERE id = ?").get(req.params.id);
  if (!mod) return res.status(404).json({ error: "Module not found" });
  res.json({ ...mod, tags: JSON.parse(mod.tags || "[]") });
});

router.post("/", authenticateToken, (req, res) => {
  const { title, emoji, color, description, tags, content } = req.body;
  const result = db.prepare("INSERT INTO modules (title, emoji, color, description, tags, content) VALUES (?,?,?,?,?,?)")
    .run(title, emoji || "📚", color || "#00C2FF", description, JSON.stringify(tags || []), content);
  res.json({ id: result.lastInsertRowid, title, emoji, color, description, tags, content });
});

router.put("/:id", authenticateToken, (req, res) => {
  const { title, emoji, color, description, tags, content } = req.body;
  db.prepare("UPDATE modules SET title=?, emoji=?, color=?, description=?, tags=?, content=? WHERE id=?")
    .run(title, emoji, color, description, JSON.stringify(tags || []), content, req.params.id);
  res.json({ success: true });
});

router.delete("/:id", authenticateToken, (req, res) => {
  db.prepare("DELETE FROM modules WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

router.get("/:id/progress", authenticateToken, (req, res) => {
  const prog = db.prepare("SELECT percentage FROM progress WHERE user_id = ? AND module_id = ?").get(req.user.id, req.params.id);
  res.json({ percentage: prog?.percentage || 0 });
});

router.post("/:id/progress", authenticateToken, (req, res) => {
  const { percentage } = req.body;
  db.prepare("INSERT OR REPLACE INTO progress (user_id, module_id, percentage) VALUES (?,?,?)")
    .run(req.user.id, req.params.id, percentage);
  res.json({ success: true });
});

export default router;
