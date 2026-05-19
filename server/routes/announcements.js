import { Router } from "express";
import db from "../db.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, (req, res) => {
  const announcements = db.prepare("SELECT * FROM announcements ORDER BY id DESC").all();
  res.json(announcements);
});

router.post("/", authenticateToken, requireRole("faculty"), (req, res) => {
  const { title, body, priority } = req.body;
  const result = db.prepare("INSERT INTO announcements (title, body, priority) VALUES (?,?,?)")
    .run(title, body, priority || "normal");
  res.json({ id: result.lastInsertRowid, title, body, priority });
});

router.delete("/:id", authenticateToken, requireRole("faculty"), (req, res) => {
  db.prepare("DELETE FROM announcements WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

export default router;
