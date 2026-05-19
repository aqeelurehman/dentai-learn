import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, "dentpath.db"));
db.pragma("journal_mode = WAL");

export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student','faculty')),
      roll TEXT,
      avatar TEXT DEFAULT '🎓',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      emoji TEXT DEFAULT '📚',
      color TEXT DEFAULT '#00C2FF',
      description TEXT,
      tags TEXT DEFAULT '[]',
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quiz_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id INTEGER,
      difficulty TEXT DEFAULT 'Medium',
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      correct_answer INTEGER NOT NULL,
      explanation TEXT,
      FOREIGN KEY (module_id) REFERENCES modules(id)
    );

    CREATE TABLE IF NOT EXISTS quiz_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      module_id INTEGER,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      percentage REAL NOT NULL,
      passed INTEGER DEFAULT 0,
      date TEXT DEFAULT (date('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      history TEXT,
      findings TEXT,
      tags TEXT DEFAULT '[]',
      difficulty TEXT DEFAULT 'Medium',
      answer TEXT NOT NULL,
      ddx TEXT DEFAULT '[]',
      explanation TEXT
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT,
      priority TEXT DEFAULT 'normal',
      date TEXT DEFAULT (date('now'))
    );

    CREATE TABLE IF NOT EXISTS progress (
      user_id INTEGER NOT NULL,
      module_id INTEGER NOT NULL,
      percentage INTEGER DEFAULT 0,
      PRIMARY KEY (user_id, module_id)
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      user_id INTEGER NOT NULL,
      module_id INTEGER NOT NULL,
      PRIMARY KEY (user_id, module_id)
    );

    CREATE TABLE IF NOT EXISTS notes (
      user_id INTEGER NOT NULL,
      module_id INTEGER NOT NULL,
      content TEXT DEFAULT '',
      PRIMARY KEY (user_id, module_id)
    );

    CREATE TABLE IF NOT EXISTS uploads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      size INTEGER,
      topics TEXT DEFAULT '[]',
      summary TEXT,
      date TEXT DEFAULT (date('now'))
    );
  `);

  seedData();
}

function seedData() {
  const userCount = db.prepare("SELECT COUNT(*) as cnt FROM users").get();
  if (userCount.cnt > 0) return;

  const hashPw = (pw) => bcrypt.hashSync(pw, 10);

  const insertUser = db.prepare("INSERT INTO users (name, email, password, role, roll, avatar) VALUES (?,?,?,?,?,?)");
  insertUser.run("Ahmed Raza", "student@bahria.edu.pk", hashPw("student123"), "student", "BS-CS-21-001", "🎓");
  insertUser.run("Sara Khan", "sara@bahria.edu.pk", hashPw("student123"), "student", "BS-CS-21-002", "👩‍🎓");
  insertUser.run("Omar Farooq", "omar@bahria.edu.pk", hashPw("student123"), "student", "BS-CS-21-003", "🧑‍🎓");
  insertUser.run("Dr. Ayesha Malik", "faculty@bahria.edu.pk", hashPw("faculty123"), "faculty", "FAC-001", "👩‍⚕️");

  const insertModule = db.prepare("INSERT INTO modules (title, emoji, color, description, tags, content) VALUES (?,?,?,?,?,?)");
  insertModule.run("Odontogenic Cysts", "🦷", "#00C2FF", "Dentigerous, Radicular, and OKC pathology", '["Cyst","Epithelial","Jaw"]', "**Dentigerous Cyst** — The most common developmental odontogenic cyst. Arises from reduced enamel epithelium surrounding the crown of an unerupted tooth.\n\n**Odontogenic Keratocyst (OKC)** — Aggressive developmental cyst with high recurrence (up to 60%). Thin, friable wall.\n\n**Radicular Cyst** — Most common jaw cyst overall. Inflammatory origin from epithelial rests of Malassez.");
  insertModule.run("Odontogenic Tumors", "🔬", "#8B5CF6", "Ameloblastoma, Odontoma, CEOT", '["Tumor","Benign","Neoplasm"]', "**Ameloblastoma** — Most clinically significant benign odontogenic tumor. Locally aggressive.\n\n**Odontoma** — Most common odontogenic tumor overall.\n\n**CEOT (Pindborg Tumor)** — Sheets of polyhedral epithelial cells with Liesegang rings.");
  insertModule.run("Inflammatory Lesions", "⚠️", "#F59E0B", "Periapical pathology, Abscesses", '["Inflammatory","Periapical","Abscess"]', "**Periapical Granuloma** — Most common periapical lesion.\n\n**Periapical Abscess** — Acute: severe pain, swelling, fever.\n\n**Periapical Cyst** — Develops within a granuloma via proliferation of epithelial rests of Malassez.");
  insertModule.run("Developmental Anomalies", "🧬", "#10B981", "Enamel hypoplasia, Taurodontism", '["Developmental","Structure","Morphology"]', "**Enamel Hypoplasia** — Deficient enamel matrix during amelogenesis.\n\n**Taurodontism** — Enlarged pulp chamber with apically displaced furcation.\n\n**Gemination** — Single tooth bud attempts division.\n\n**Dilaceration** — Abnormal angulation between crown and root.");
  insertModule.run("Bone Pathology", "🦴", "#EF4444", "Fibrous dysplasia, Cherubism", '["Bone","Fibro-osseous","Jaw"]', "**Fibrous Dysplasia** — Replacement of medullary bone by fibrous tissue. Ground-glass appearance.\n\n**Cherubism** — Autosomal dominant (SH3BP2 mutation). Bilateral symmetric expansion.\n\n**Ossifying Fibroma** — True benign fibro-osseous neoplasm.");
  insertModule.run("Salivary Gland Disorders", "💧", "#EC4899", "Mucocele, Sjögren syndrome", '["Salivary","Gland","Mucous"]', "**Mucocele** — Most common salivary lesion. Usually mucous extravasation.\n\n**Ranula** — Mucocele at floor of mouth.\n\n**Sjögren Syndrome** — Autoimmune exocrinopathy.\n\n**Pleomorphic Adenoma** — Most common salivary gland tumor.");

  const insertQ = db.prepare("INSERT INTO quiz_questions (module_id, difficulty, question, options, correct_answer, explanation) VALUES (?,?,?,?,?,?)");
  insertQ.run(1, "Easy", "Which cyst arises from the reduced enamel epithelium of an unerupted tooth?", '["Radicular cyst","Dentigerous cyst","Lateral periodontal cyst","Gingival cyst"]', 1, "Dentigerous cysts arise from the reduced enamel epithelium surrounding the crown of an unerupted tooth.");
  insertQ.run(2, "Easy", "The most common odontogenic tumor overall is:", '["Ameloblastoma","Odontoma","CEOT","Odontogenic myxoma"]', 1, "Odontoma is the most common odontogenic tumor.");
  insertQ.run(2, "Medium", "Ameloblastoma classically shows which histological pattern?", '["Follicular with stellate reticulum","Solid squamous sheets","Mucin-producing glands","Cartilage islands"]', 0, "Ameloblastoma shows a follicular pattern with stellate reticulum-like cells.");
  insertQ.run(1, "Medium", "The high recurrence rate of OKC is primarily due to:", '["Dense fibrous wall","Thin friable wall and satellite cysts","Mucous lining","Heavy calcification"]', 1, "OKC has a thin, fragile lining plus satellite cysts that drive recurrence.");
  insertQ.run(1, "Hard", "Which syndrome is associated with multiple OKCs?", '["Gorlin-Goltz Syndrome","Sturge-Weber Syndrome","Down Syndrome","Turner Syndrome"]', 0, "Gorlin-Goltz (Nevoid BCC) Syndrome is associated with multiple OKCs.");
  insertQ.run(3, "Easy", "Most common periapical lesion is:", '["Periapical abscess","Periapical granuloma","Radicular cyst","Osteomyelitis"]', 1, "Periapical granuloma is the most common periapical lesion.");
  insertQ.run(4, "Hard", "Taurodontism is strongly associated with which syndrome?", '["Gorlin-Goltz","Klinefelter Syndrome","Paget disease","Marfan syndrome"]', 1, "Taurodontism is associated with Klinefelter syndrome.");
  insertQ.run(5, "Medium", "Fibrous dysplasia shows which radiographic appearance?", '["Cotton-wool","Ground-glass / orange-peel","Soap-bubble","Sunburst"]', 1, "Fibrous dysplasia shows a ground-glass radiographic appearance.");
  insertQ.run(6, "Easy", "Most common site for a mucocele is:", '["Upper lip","Lower lip","Tongue","Hard palate"]', 1, "Mucoceles most commonly occur on the lower lip.");
  insertQ.run(2, "Hard", "CEOT (Pindborg tumor) is characterised by:", '["Mucin pools","Liesegang rings and amyloid","Giant cells","Cartilage"]', 1, "CEOT shows Liesegang rings and amyloid-like material.");

  const insertCase = db.prepare("INSERT INTO cases (title, history, findings, tags, difficulty, answer, ddx, explanation) VALUES (?,?,?,?,?,?,?,?)");
  insertCase.run("27-year-old male with painless jaw swelling", "Slowly enlarging, painless swelling of the left mandible for 6 months.", "Well-defined unilocular radiolucency surrounding the crown of an impacted lower-left third molar.", '["Cyst","Mandible","Impacted"]', "Medium", "Dentigerous Cyst", '["Dentigerous Cyst","Odontogenic Keratocyst","Unicystic Ameloblastoma","Adenomatoid Odontogenic Tumor"]', "Classic dentigerous cyst presentation: unilocular radiolucency attached at the CEJ of an impacted tooth.");
  insertCase.run("35-year-old with aggressive multilocular mandibular lesion", "4-month history of rapidly growing swelling of the right posterior mandible with mild pain.", "Large multilocular soap-bubble radiolucency. Cortical perforation.", '["Tumor","Aggressive","Multilocular"]', "Hard", "Ameloblastoma", '["Ameloblastoma","Odontogenic Keratocyst","Central Giant Cell Granuloma","Odontogenic Myxoma"]', "Ameloblastoma: multilocular soap-bubble radiolucency, posterior mandible, cortical perforation.");
  insertCase.run("Bilateral jaw expansion in a 6-year-old child", "Progressive bilateral swelling of the lower face since age 4. Sister has similar appearance.", "Bilateral symmetric multilocular radiolucencies involving posterior mandible. Giant cells on biopsy.", '["Developmental","Bilateral","Pediatric"]', "Hard", "Cherubism", '["Cherubism","Central Giant Cell Granuloma","Fibrous Dysplasia","Hyperparathyroidism"]', "Cherubism: autosomal dominant, bilateral mandibular involvement, onset in childhood.");

  const insertAnn = db.prepare("INSERT INTO announcements (title, body, priority, date) VALUES (?,?,?,?)");
  insertAnn.run("Quiz #3 Closes Friday", "Module 1-3 comprehensive MCQ quiz closes this Friday at 11:59 PM.", "high", "2026-05-08");
  insertAnn.run("New AR Module Live", "Inflammatory Lesions AR exploration is now live.", "normal", "2026-05-07");
  insertAnn.run("Final Report Due", "Final project reports (PDF) due May 15.", "normal", "2026-05-06");
}

export default db;
