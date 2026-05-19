import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dentpath_edu_secret_key_2026";

router.post("/login", (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: "Email, password, and role are required" });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ? AND role = ?").get(email, role);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, roll: user.roll, avatar: user.avatar },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, roll: user.roll, avatar: user.avatar }
  });
});

router.post("/register", (req, res) => {
  const { name, email, password, role, roll } = req.body;
  const hashed = bcrypt.hashSync(password, 10);

  try {
    const result = db.prepare("INSERT INTO users (name, email, password, role, roll) VALUES (?,?,?,?,?)").run(name, email, hashed, role, roll);
    const token = jwt.sign({ id: result.lastInsertRowid, name, email, role, roll, avatar: "🎓" }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: result.lastInsertRowid, name, email, role, roll, avatar: "🎓" } });
  } catch (err) {
    res.status(400).json({ error: "Email already exists" });
  }
});

export default router;
