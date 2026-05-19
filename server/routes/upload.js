import { Router } from "express";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { execFile } from "child_process";
import db from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: join(__dirname, "../uploads"),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

const router = Router();

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

// ── Upload PDF ───────────────────────────────────────────────────────────────
router.post("/pdf", authenticateToken, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const result = db.prepare("INSERT INTO uploads (user_id, filename, size) VALUES (?,?,?)")
    .run(req.user.id, req.file.filename, req.file.size);

  res.json({
    id: result.lastInsertRowid,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    path: `/uploads/${req.file.filename}`
  });
});

// ── OCR + AI Analyze  ────────────────────────────────────────────────────────
// POST /api/upload/ocr-analyze
// Accepts PDF upload, runs PaddleOCR, sends text to Groq for analysis
router.post("/ocr-analyze", authenticateToken, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const pdfPath = join(__dirname, "../uploads", req.file.filename);
  const ocrScript = join(__dirname, "../ocr_extract.py");

  try {
    // Step 1: Run PaddleOCR on the PDF
    const ocrText = await new Promise((resolve, reject) => {
      execFile("python", [ocrScript, pdfPath], {
        timeout: 120000, // 2 minute timeout for large PDFs
        maxBuffer: 5 * 1024 * 1024, // 5 MB buffer
        env: {
          ...process.env,
          GLOG_minloglevel: "3",
          FLAGS_minloglevel: "3",
          PPOCR_LOG_LEVEL: "ERROR",
          PYTHONUNBUFFERED: "1",
        },
      }, (error, stdout, stderr) => {
        // PaddleOCR/PaddlePaddle can dump INFO lines to stderr — only fail
        // if there's no usable JSON on stdout.
        if (stderr) console.log("OCR stderr (info):", stderr.slice(0, 300));

        // Try to parse stdout even if execFile reports an error (exit-code != 0)
        // because PaddleOCR sometimes prints warnings that trigger non-zero exit
        const raw = (stdout || "").trim();
        // Find the JSON object in stdout (skip any stray log lines before it)
        const jsonStart = raw.indexOf("{");
        if (jsonStart === -1) {
          return reject(new Error(error ? `OCR failed: ${error.message}` : "No JSON output from OCR"));
        }
        try {
          const result = JSON.parse(raw.slice(jsonStart));
          if (result.error) return reject(new Error(result.error));
          resolve(result);
        } catch (e) {
          reject(new Error(error ? `OCR failed: ${error.message}` : "Failed to parse OCR output"));
        }
      });
    });

    console.log(`OCR extracted ${ocrText.chars} chars from ${ocrText.pages} pages (${ocrText.method})`);

    // Step 2: Send OCR text to Groq AI for analysis
    const key = process.env.GROQ_API_KEY;
    if (!key) {
      // Save upload record without AI analysis
      const dbResult = db.prepare("INSERT INTO uploads (user_id, filename, size, topics, summary) VALUES (?,?,?,?,?)")
        .run(req.user.id, req.file.filename, req.file.size, "[]", "OCR complete but AI key not configured");
      return res.json({
        id: dbResult.lastInsertRowid,
        ocrText: ocrText.text.slice(0, 500),
        summary: "OCR complete. Configure GROQ_API_KEY for AI analysis.",
        topics: [],
        keyTerms: [],
        questions: [],
      });
    }

    const groqResponse = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a dental education AI that analyzes study material. Return ONLY valid JSON with no markdown fences."
          },
          {
            role: "user",
            content: `Analyze this dental/medical study material extracted via OCR from a PDF. Respond ONLY with a valid JSON object (no markdown, no code fences) with these exact fields:
{
  "summary": "2-3 sentence overview of what this material covers",
  "topics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
  "keyTerms": ["term1", "term2", "term3", "term4", "term5", "term6", "term7", "term8"],
  "questions": [
    { "q": "MCQ question text", "options": ["A answer", "B answer", "C answer", "D answer"], "correct": 0, "explanation": "brief explanation" }
  ]
}
Rules:
- Detect ALL major dental/medical topics covered in the text
- Extract the most important clinical key terms
- Generate exactly 5 MCQ questions that test understanding of the material
- Questions should range from easy to hard
- Each question must have exactly 4 options
- "correct" is the zero-based index of the correct option

OCR-EXTRACTED TEXT:
${ocrText.text.slice(0, 10000)}`
          }
        ],
        max_tokens: 2048,
        temperature: 0.3,
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error("Groq analysis error:", groqResponse.status, errText);
      throw new Error(`Groq API error: ${groqResponse.status}`);
    }

    const groqData = await groqResponse.json();
    const aiText = groqData.choices?.[0]?.message?.content || "{}";
    const cleaned = aiText.replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(cleaned);

    // Step 3: Save to database
    const dbResult = db.prepare("INSERT INTO uploads (user_id, filename, size, topics, summary) VALUES (?,?,?,?,?)")
      .run(
        req.user.id,
        req.file.filename,
        req.file.size,
        JSON.stringify(analysis.topics || []),
        analysis.summary || ""
      );

    res.json({
      id: dbResult.lastInsertRowid,
      ocrChars: ocrText.chars,
      ocrPages: ocrText.pages,
      summary: analysis.summary,
      topics: analysis.topics || [],
      keyTerms: analysis.keyTerms || [],
      questions: analysis.questions || [],
    });

  } catch (err) {
    console.error("OCR-Analyze error:", err.message);
    // Still save the upload record even if analysis fails
    try {
      db.prepare("INSERT INTO uploads (user_id, filename, size) VALUES (?,?,?)")
        .run(req.user.id, req.file.filename, req.file.size);
    } catch (_) {}
    res.status(500).json({ error: err.message });
  }
});

// ── Upload history ───────────────────────────────────────────────────────────
router.get("/history", authenticateToken, (req, res) => {
  const uploads = db.prepare("SELECT * FROM uploads WHERE user_id = ? ORDER BY id DESC").all(req.user.id);
  res.json(uploads.map(u => ({ ...u, topics: JSON.parse(u.topics || "[]") })));
});

router.put("/:id", authenticateToken, (req, res) => {
  const { topics, summary } = req.body;
  db.prepare("UPDATE uploads SET topics = ?, summary = ? WHERE id = ? AND user_id = ?")
    .run(JSON.stringify(topics || []), summary, req.params.id, req.user.id);
  res.json({ success: true });
});

export default router;
