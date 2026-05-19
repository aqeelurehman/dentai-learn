/**
 * routes/ai.js
 * Proxy routes for Groq AI API — chat and PDF analysis
 * Keeps the API key server-side, never exposed to the browser
 */
import { Router } from "express";

const router = Router();

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

function getKey() {
  return process.env.GROQ_API_KEY || "";
}

// ── Chat endpoint ────────────────────────────────────────────────────────────
router.post("/chat", async (req, res) => {
  const key = getKey();
  if (!key) {
    return res.status(500).json({ error: "GROQ_API_KEY not configured in server/.env" });
  }

  const { messages, systemPrompt } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  try {
    const groqMessages = [];
    if (systemPrompt) {
      groqMessages.push({ role: "system", content: systemPrompt });
    }
    groqMessages.push(...messages);

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: groqMessages,
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq API error:", response.status, err);
      return res.status(response.status).json({ error: `Groq API error: ${response.status}` });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "Sorry, could not generate a response.";

    res.json({ text, model: data.model, usage: data.usage });
  } catch (err) {
    console.error("Groq chat error:", err.message);
    res.status(500).json({ error: "Failed to connect to Groq API" });
  }
});

// ── PDF Analysis endpoint ────────────────────────────────────────────────────
router.post("/analyze-pdf", async (req, res) => {
  const key = getKey();
  if (!key) {
    return res.status(500).json({ error: "GROQ_API_KEY not configured in server/.env" });
  }

  const { textContent } = req.body;
  if (!textContent) {
    return res.status(400).json({ error: "textContent is required" });
  }

  try {
    const response = await fetch(GROQ_URL, {
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
            content: "You are a dental education AI. Analyze study material and return ONLY valid JSON with no markdown fences.",
          },
          {
            role: "user",
            content: `Analyze this dental study material. Respond ONLY with a valid JSON object (no markdown, no code fences) with these exact fields:
{
  "summary": "2-3 sentence overview of the material",
  "topics": ["topic1","topic2","topic3"],
  "keyTerms": ["term1","term2","term3","term4","term5"],
  "questions": [
    { "q": "question text", "options": ["A","B","C","D"], "correct": 0, "explanation": "reason" }
  ]
}
Generate exactly 5 MCQ questions from this material.

MATERIAL:
${textContent.slice(0, 6000)}`,
          },
        ],
        max_tokens: 2048,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq PDF error:", response.status, err);
      return res.status(response.status).json({ error: `Groq API error: ${response.status}` });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "{}";

    // Parse JSON from response (strip any accidental markdown fences)
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    res.json(parsed);
  } catch (err) {
    console.error("Groq PDF error:", err.message);
    res.status(500).json({ error: "Failed to analyze PDF" });
  }
});

// ── Generate Module endpoint ─────────────────────────────────────────────────
router.post("/generate-module", async (req, res) => {
  const key = getKey();
  if (!key) {
    return res.status(500).json({ error: "GROQ_API_KEY not configured in server/.env" });
  }

  const { topic } = req.body;
  if (!topic || typeof topic !== "string" || topic.trim().length < 2) {
    return res.status(400).json({ error: "A topic string (2+ chars) is required" });
  }

  try {
    const response = await fetch(GROQ_URL, {
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
            content: "You are a dental/medical education expert. Generate comprehensive study modules. Return ONLY valid JSON with no markdown fences.",
          },
          {
            role: "user",
            content: `Create a complete dental/medical study module on the topic: "${topic.trim()}"

Respond ONLY with a valid JSON object (no markdown, no code fences) with these exact fields:
{
  "title": "Short module title (2-4 words, title case)",
  "emoji": "one relevant emoji",
  "color": "a hex color that fits the topic (pick from: #c9a84c, #8B5CF6, #F59E0B, #10B981, #EF4444, #EC4899, #3B82F6, #14B8A6, #F97316, #6366F1)",
  "desc": "One-line subtitle describing what the module covers (under 60 chars)",
  "tags": ["tag1", "tag2", "tag3"],
  "content": "Detailed study content with 3-5 subtopics. Use **Bold Title** — Description format for each subtopic. Separate subtopics with double newlines. Each subtopic should be 2-3 sentences of clinically relevant information including definitions, clinical features, histology, treatment, and key associations.",
  "questions": [
    { "q": "MCQ question text", "options": ["option A", "option B", "option C", "option D"], "correct": 0, "explanation": "brief explanation why this is correct" }
  ]
}

Rules:
- The content must be clinically accurate and exam-relevant
- Generate exactly 5 MCQ questions that test understanding
- Questions should range from easy to hard
- Each question must have exactly 4 options
- "correct" is the zero-based index of the correct option
- Include specific clinical features, histological findings, and associations
- Content should be suitable for dental/medical students`,
          },
        ],
        max_tokens: 3000,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq generate-module error:", response.status, err);
      return res.status(response.status).json({ error: `Groq API error: ${response.status}` });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "{}";
    // Strip markdown fences
    let cleaned = text.replace(/```json|```/g, "").trim();
    // Sanitize control chars ONLY inside JSON string literals (not structural whitespace)
    cleaned = cleaned.replace(/"([^"\\]|\\.)*"/g, (match) => {
      return match.replace(/[\x00-\x1f]/g, (ch) => {
        if (ch === "\n") return "\\n";
        if (ch === "\r") return "\\r";
        if (ch === "\t") return "\\t";
        return "";
      });
    });
    const parsed = JSON.parse(cleaned);

    // Validate required fields
    if (!parsed.title || !parsed.content || !parsed.questions?.length) {
      return res.status(500).json({ error: "AI returned incomplete module data" });
    }

    res.json(parsed);
  } catch (err) {
    console.error("Groq generate-module error:", err.message);
    res.status(500).json({ error: "Failed to generate module: " + err.message });
  }
});

export default router;
