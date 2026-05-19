/**
 * backend/seed.js
 * Seeds the database with default users, modules, quiz questions, cases, and announcements.
 * Only runs once (checked via a versioned key).
 */
import DB from "./db.js";

export const SEED_VERSION = "v10";

export async function seedDatabase() {
  const already = await DB.get(`seeded_${SEED_VERSION}`);
  if (already) return;

  // ── Users ────────────────────────────────────────────────────────────────────
  await DB.set("users", [
    { id: "u1", name: "Ahmed Raza",      email: "student@bahria.edu.pk",  password: "student123", role: "student", roll: "BS-CS-21-001", avatar: "🎓" },
    { id: "u2", name: "Sara Khan",       email: "sara@bahria.edu.pk",     password: "student123", role: "student", roll: "BS-CS-21-002", avatar: "👩‍🎓" },
    { id: "u3", name: "Omar Farooq",     email: "omar@bahria.edu.pk",     password: "student123", role: "student", roll: "BS-CS-21-003", avatar: "🧑‍🎓" },
    { id: "u4", name: "Dr. Ayesha Malik",email: "faculty@bahria.edu.pk",  password: "faculty123", role: "faculty", roll: "FAC-001",      avatar: "👩‍⚕️" },
  ]);

  // ── Modules ──────────────────────────────────────────────────────────────────
  await DB.set("modules", [
    {
      id: "m1", title: "Odontogenic Cysts", emoji: "🦷", image: "/images/modules/cysts.jpg", model: "/models/cyst.glb", color: "#c9a84c",
      desc: "Dentigerous, Radicular, and OKC pathology",
      tags: ["Cyst","Epithelial","Jaw"],
      content: `**Dentigerous Cyst** — The most common developmental odontogenic cyst. Arises from reduced enamel epithelium surrounding the crown of an unerupted tooth. Presents as a well-defined unilocular radiolucency attached at the CEJ. Treatment: enucleation and extraction.\n\n**Odontogenic Keratocyst (OKC)** — Aggressive developmental cyst with high recurrence (up to 60%). Thin, friable wall lined by parakeratinised stratified squamous epithelium. Satellite cysts and budding epithelium drive recurrence. Associated with Gorlin-Goltz (Nevoid BCC) syndrome when multiple.\n\n**Radicular Cyst** — Most common jaw cyst overall. Inflammatory origin from epithelial rests of Malassez at the apex of a non-vital tooth. Well-corticated periapical radiolucency. Treatment: RCT or extraction.`,
    },
    {
      id: "m2", title: "Odontogenic Tumors", emoji: "🔬", image: "/images/modules/tumors.jpg", model: "/models/tumor.glb", color: "#8B5CF6",
      desc: "Ameloblastoma, Odontoma, CEOT",
      tags: ["Tumor","Benign","Neoplasm"],
      content: `**Ameloblastoma** — Most clinically significant benign odontogenic tumor. Locally aggressive, high recurrence if conservatively treated. Follicular pattern: peripheral tall columnar cells with reversed polarity, central stellate reticulum. Plexiform pattern: anastomosing strands. Multilocular soap-bubble/honeycomb radiolucency in posterior mandible.\n\n**Odontoma** — Most common odontogenic tumor overall. Hamartoma composed of enamel, dentin, cementum, pulp. Compound type: multiple tooth-like denticles. Complex type: disorganized calcified mass.\n\n**CEOT (Calcifying Epithelhelial Odontogenic Tumor / Pindborg Tumor)** — Sheets of polyhedral epithelial cells with prominent intercellular bridges. Characteristic Liesegang rings (concentric calcifications) and amyloid-like material (Congo red positive).`,
    },
    {
      id: "m3", title: "Inflammatory Lesions", emoji: "⚠️", image: "/images/modules/inflammatory.jpg", model: "/models/resorption.glb", color: "#F59E0B",
      desc: "Periapical pathology, Abscesses",
      tags: ["Inflammatory","Periapical","Abscess"],
      content: `**Periapical Granuloma** — Most common periapical lesion. Chronic inflammatory response to pulpal necrosis. Granulation tissue with lymphocytes, plasma cells, macrophages. Small (<1 cm) well-defined radiolucency with loss of lamina dura.\n\n**Periapical Abscess** — Acute: severe pain, swelling, fever, sinus tract. Chronic: often asymptomatic with intermittent pus discharge. Ill-defined radiolucency at apex.\n\n**Periapical Cyst (Radicular Cyst)** — Develops within a granuloma via proliferation of epithelial rests of Malassez. Lined by non-keratinised stratified squamous epithelium. >1 cm, well-corticated radiolucency. May persist after RCT (true residual cyst).`,
    },
    {
      id: "m4", title: "Developmental Anomalies", emoji: "🧬", image: "/images/modules/developmental.jpg", model: "/models/tooth.glb", color: "#10B981",
      desc: "Enamel hypoplasia, Taurodontism",
      tags: ["Developmental","Structure","Morphology"],
      content: `**Enamel Hypoplasia** — Deficient enamel matrix during amelogenesis. Causes: fluorosis (mottled enamel), nutritional deficiency (Vit A/C/D), birth trauma, infection (Turner hypoplasia), hereditary (amelogenesis imperfecta).\n\n**Taurodontism** — Enlarged pulp chamber with apically displaced furcation. Bull-like teeth. Associated with Klinefelter syndrome, Down syndrome.\n\n**Gemination** — Single tooth bud attempts division; results in a large bifid crown with a single root. Tooth count normal.\n\n**Fusion** — Union of two separate tooth buds by dentine. One less tooth in arch.\n\n**Dilaceration** — Abnormal angulation between crown and root due to developmental trauma during root formation.`,
    },
    {
      id: "m5", title: "Bone Pathology", emoji: "🦴", image: "/images/modules/bone.jpg", model: "/models/bone.glb", color: "#EF4444",
      desc: "Fibrous dysplasia, Cherubism",
      tags: ["Bone","Fibro-osseous","Jaw"],
      content: `**Fibrous Dysplasia** — Replacement of medullary bone by fibrous tissue containing woven bone trabeculae (Chinese letter/alphabet pattern). Ground-glass / orange-peel radiographic appearance. Café-au-lait macules in McCune-Albright syndrome.\n\n**Cherubism** — Autosomal dominant (SH3BP2 mutation). Bilateral symmetric expansion of posterior mandible giving cherubic appearance to face. Onset age 2-5; regresses after puberty. Giant cell-rich fibrous tissue on biopsy.\n\n**Ossifying Fibroma** — True benign fibro-osseous neoplasm. Well-demarcated, expands cortex. Fibrous stroma with varying calcified material (bone trabeculae, psammomatoid calcifications). True capsule differentiates it from fibrous dysplasia.`,
    },
    {
      id: "m6", title: "Salivary Gland Disorders", emoji: "💧", image: "/images/modules/salivary.jpg", model: "/models/jaw.glb", color: "#EC4899",
      desc: "Mucocele, Sjögren syndrome",
      tags: ["Salivary","Gland","Mucous"],
      content: `**Mucocele** — Most common salivary lesion. Usually mucous extravasation phenomenon (duct rupture) at lower lip. Translucent bluish fluctuant swelling. Treated by excision including associated minor gland.\n\n**Ranula** — Mucocele at floor of mouth involving sublingual gland. Plunging ranula penetrates mylohyoid into neck. Treatment: marsupialization or excision.\n\n**Sjögren Syndrome** — Autoimmune exocrinopathy. Primary (sicca syndrome alone) or secondary (with rheumatoid arthritis, SLE). Anti-SSA/Ro and Anti-SSB/La antibodies. Focal lymphocytic sialadenitis on lip biopsy (>1 focus/4mm²).\n\n**Pleomorphic Adenoma** — Most common salivary gland tumor (70% of parotid tumors). Biphasic: epithelial/myoepithelial cells in chondromyxoid stroma. Incomplete capsule → satellite nodules → recurrence if ruptures during surgery.`,
    },
  ]);

  // ── Quiz Bank ────────────────────────────────────────────────────────────────
  await DB.set("quiz_bank", [
    { id: "q1",  moduleId: "m1", difficulty: "Easy",   q: "Which cyst arises from the reduced enamel epithelium of an unerupted tooth?",                       options: ["Radicular cyst","Dentigerous cyst","Lateral periodontal cyst","Gingival cyst"],                     correct: 1, explanation: "Dentigerous cysts arise from the reduced enamel epithelium (follicular epithelium) surrounding the crown of an unerupted tooth." },
    { id: "q2",  moduleId: "m2", difficulty: "Easy",   q: "The most common odontogenic tumor overall is:",                                                       options: ["Ameloblastoma","Odontoma","CEOT","Odontogenic myxoma"],                                            correct: 1, explanation: "Odontoma is the most common odontogenic tumor, a hamartomatous lesion with compound and complex variants." },
    { id: "q3",  moduleId: "m2", difficulty: "Medium", q: "Ameloblastoma classically shows which histological pattern?",                                          options: ["Follicular with stellate reticulum","Solid squamous sheets","Mucin-producing glands","Cartilage islands"], correct: 0, explanation: "Ameloblastoma shows a follicular pattern: peripheral tall columnar ameloblast-like cells with reversed polarity and central stellate reticulum-like cells." },
    { id: "q4",  moduleId: "m1", difficulty: "Medium", q: "The high recurrence rate of OKC is primarily due to:",                                                 options: ["Dense fibrous wall","Thin friable wall and satellite cysts","Mucous lining","Heavy calcification"],  correct: 1, explanation: "OKC has a thin, fragile lining prone to tearing at surgery, plus satellite/daughter cysts and budding basal cells that drive recurrence." },
    { id: "q5",  moduleId: "m1", difficulty: "Hard",   q: "Which syndrome is associated with multiple OKCs?",                                                     options: ["Gorlin-Goltz Syndrome","Sturge-Weber Syndrome","Down Syndrome","Turner Syndrome"],                  correct: 0, explanation: "Gorlin-Goltz (Nevoid Basal Cell Carcinoma) Syndrome is associated with multiple OKCs, basal cell carcinomas, bifid ribs, and calcified falx cerebri." },
    { id: "q6",  moduleId: "m3", difficulty: "Easy",   q: "Most common periapical lesion is:",                                                                    options: ["Periapical abscess","Periapical granuloma","Radicular cyst","Osteomyelitis"],                      correct: 1, explanation: "Periapical granuloma is the most common periapical lesion (>70%), consisting of granulation tissue with chronic inflammatory cells." },
    { id: "q7",  moduleId: "m4", difficulty: "Hard",   q: "Taurodontism is strongly associated with which syndrome?",                                             options: ["Gorlin-Goltz","Klinefelter Syndrome","Paget disease","Marfan syndrome"],                            correct: 1, explanation: "Taurodontism (enlarged pulp chamber, apically displaced floor and furcation) is associated with Klinefelter syndrome among others." },
    { id: "q8",  moduleId: "m5", difficulty: "Medium", q: "Fibrous dysplasia shows which characteristic radiographic appearance?",                                options: ["Cotton-wool","Ground-glass / orange-peel","Soap-bubble","Sunburst"],                                correct: 1, explanation: "Fibrous dysplasia classically shows a ground-glass (orange-peel) radiographic appearance from fibrous tissue with spicules of woven bone." },
    { id: "q9",  moduleId: "m6", difficulty: "Easy",   q: "Most common site for a mucocele is:",                                                                  options: ["Upper lip","Lower lip","Tongue","Hard palate"],                                                     correct: 1, explanation: "Mucoceles most commonly occur on the lower lip due to trauma to minor salivary glands or their ducts in that location." },
    { id: "q10", moduleId: "m2", difficulty: "Hard",   q: "CEOT (Pindborg tumor) is histologically characterised by:",                                            options: ["Mucin pools","Liesegang rings and amyloid","Giant cells","Cartilage"],                              correct: 1, explanation: "CEOT shows characteristic Liesegang rings (concentric calcifications) and amyloid-like (Congo red positive) material between polyhedral epithelial cells." },
    { id: "q11", moduleId: "m3", difficulty: "Medium", q: "Which of the following is a chronic suppurative lesion with a sinus tract and no acute pain?",        options: ["Phoenix abscess","Chronic periapical abscess","Acute apical periodontitis","Cellulitis"],           correct: 1, explanation: "Chronic periapical abscess has a sinus tract (parulis) for pus drainage, is often asymptomatic, and lacks the severe pain of acute abscess." },
    { id: "q12", moduleId: "m5", difficulty: "Hard",   q: "The gene mutated in Cherubism is:",                                                                    options: ["PTCH1","SH3BP2","FGFR","TP53"],                                                                    correct: 1, explanation: "Cherubism is caused by mutations in SH3BP2 (c-Abl-binding protein), leading to bilateral giant cell-rich fibrous replacement of posterior jaw bones." },
    { id: "q13", moduleId: "m1", difficulty: "Medium", q: "A radicular cyst develops from which of the following?",                                                options: ["Dental lamina rests","Epithelial rests of Malassez","Reduced enamel epithelium","Cell rests of Serres"], correct: 1, explanation: "Radicular cysts arise from epithelial rests of Malassez in the periodontal ligament, stimulated by inflammatory products from a non-vital tooth." },
    { id: "q14", moduleId: "m2", difficulty: "Medium", q: "Compound odontoma differs from complex odontoma in that it contains:",                                  options: ["Disorganised mass of dental tissue","Multiple tooth-like denticles","Only enamel and dentin","Giant cells"], correct: 1, explanation: "Compound odontoma contains multiple small tooth-like structures (denticles), while complex type shows a disorganised mass of enamel, dentin, cementum and pulp." },
    { id: "q15", moduleId: "m3", difficulty: "Hard",   q: "A phoenix abscess is best described as:",                                                               options: ["An acute exacerbation of a chronic periapical lesion","A primary acute abscess","A periapical granuloma with sinus tract","A cyst with secondary infection"], correct: 0, explanation: "A phoenix abscess is an acute flare-up of a pre-existing chronic periapical lesion (granuloma or cyst), presenting with sudden pain and swelling." },
    { id: "q16", moduleId: "m4", difficulty: "Easy",   q: "In fusion of teeth, the tooth count in the arch is:",                                                   options: ["Normal","Increased by one","Decreased by one","Doubled"],                                          correct: 2, explanation: "Fusion is the union of two separate tooth buds, resulting in one fewer tooth in the arch. In gemination, a single bud partially divides, so count stays normal." },
    { id: "q17", moduleId: "m6", difficulty: "Medium", q: "The most common salivary gland tumor is:",                                                              options: ["Warthin tumor","Mucoepidermoid carcinoma","Pleomorphic adenoma","Adenoid cystic carcinoma"],         correct: 2, explanation: "Pleomorphic adenoma (mixed tumor) accounts for approximately 60-70% of all parotid tumors and is the most common salivary gland neoplasm overall." },
    { id: "q18", moduleId: "m6", difficulty: "Hard",   q: "Anti-SSA/Ro and Anti-SSB/La antibodies are characteristic of:",                                         options: ["Mucocele","Pleomorphic adenoma","Sjögren Syndrome","Sialolithiasis"],                               correct: 2, explanation: "Sjögren syndrome is an autoimmune condition characterised by anti-SSA/Ro and anti-SSB/La antibodies, causing xerostomia and keratoconjunctivitis sicca." },
    { id: "q19", moduleId: "m5", difficulty: "Easy",   q: "Café-au-lait macules with fibrous dysplasia are seen in:",                                               options: ["Cherubism","McCune-Albright syndrome","Paget disease","Gorlin-Goltz syndrome"],                     correct: 1, explanation: "McCune-Albright syndrome is characterised by the triad of polyostotic fibrous dysplasia, café-au-lait macules with jagged (coast of Maine) borders, and precocious puberty." },
    { id: "q20", moduleId: "m4", difficulty: "Medium", q: "Which developmental anomaly involves an abnormal angulation between crown and root?",                   options: ["Gemination","Fusion","Dilaceration","Taurodontism"],                                                correct: 2, explanation: "Dilaceration is an abnormal curvature or angulation in the root or crown of a tooth, usually caused by trauma during root development." },
  ]);

  // ── Cases ────────────────────────────────────────────────────────────────────
  await DB.set("cases", [
    {
      id: "c1", title: "27-year-old male with painless jaw swelling × 6 months",
      history: "A 27-year-old male presents with a slowly enlarging, painless swelling of the left mandible for 6 months. No pain, no trismus, no paresthesia. An OPG was taken.",
      findings: "Well-defined unilocular radiolucency surrounding the crown of an impacted lower-left third molar. Cortical expansion present. Smooth, corticated margins. Root resorption of adjacent second molar — mild.",
      tags: ["Cyst","Mandible","Impacted"], difficulty: "Medium",
      answer: "Dentigerous Cyst",
      ddx: ["Dentigerous Cyst","Odontogenic Keratocyst","Unicystic Ameloblastoma","Adenomatoid Odontogenic Tumor"],
      explanation: "Classic dentigerous cyst presentation: unilocular radiolucency attached at the CEJ of an impacted tooth in a young adult male. Slow asymptomatic growth, corticated margins. OKC can mimic but typically shows scalloped margins and higher recurrence. AOT is anterior; ameloblastoma is more aggressive.",
    },
    {
      id: "c2", title: "16-year-old female with failed eruption of upper canine",
      history: "A 16-year-old female is referred because her upper right canine has not erupted. The deciduous canine is still present. No pain or swelling. OPG requested.",
      findings: "Unerupted maxillary right canine displaced palatally. A well-defined radiolucency (>3 mm) surrounds its crown. Adjacent lateral incisor shows mild root resorption.",
      tags: ["Developmental","Maxilla","Impacted"], difficulty: "Easy",
      answer: "Dentigerous Cyst",
      ddx: ["Dentigerous Cyst","Normal Follicular Space","Adenomatoid Odontogenic Tumor","Lateral Periodontal Cyst"],
      explanation: "A pericoronal radiolucency >3 mm around an unerupted tooth is diagnostic of a dentigerous cyst. Normal follicular space is ≤3 mm. AOT is the 'two-thirds' tumor (two-thirds in maxilla, two-thirds in anterior region, two-thirds in females) and often contains calcifications.",
    },
    {
      id: "c3", title: "35-year-old with aggressive multilocular mandibular lesion",
      history: "A 35-year-old male presents with a 4-month history of rapidly growing swelling of the right posterior mandible with mild pain. Reports occasional pus from the region. His father had a similar jaw surgery.",
      findings: "Large multilocular 'soap-bubble' radiolucency extending from the ramus to the premolar area. Cortical perforation in the buccal cortex. Roots of molars show significant resorption. Expansion on both sides of the cortex.",
      tags: ["Tumor","Aggressive","Multilocular"], difficulty: "Hard",
      answer: "Ameloblastoma",
      ddx: ["Ameloblastoma","Odontogenic Keratocyst","Central Giant Cell Granuloma","Odontogenic Myxoma"],
      explanation: "Ameloblastoma: multilocular soap-bubble/honeycomb radiolucency, posterior mandible, root resorption, cortical perforation, slow but locally aggressive growth. Family history may suggest syndromic OKC, but cortical perforation and root resorption strongly favor ameloblastoma. OKC rarely perforates cortex or causes root resorption.",
    },
    {
      id: "c4", title: "Post-RCT periapical radiolucency persisting after 2 years",
      history: "A 45-year-old woman is seen for recall following root canal treatment of her lower left first molar 2 years ago. She has no symptoms. The referring dentist noted a persistent periapical lesion on X-ray.",
      findings: "Well-defined circular radiolucency (≈10 mm) at mesial root apex of an obturated first molar. No pain, no swelling, no sinus tract. Adjacent teeth are vital.",
      tags: ["Inflammatory","Periapical","RCT"], difficulty: "Easy",
      answer: "Persistent Periapical Cyst / Residual Cyst",
      ddx: ["Periapical Granuloma","Periapical Cyst","Periapical Scar","Failed Root Canal"],
      explanation: "Post-RCT lesions >10 mm that fail to heal after adequate treatment are likely cystic (true cysts don't resolve with RCT alone). Periapical scars are smaller, asymptomatic, well-healed fibrous replacements. Apicoectomy with histopathology is indicated to confirm and treat the residual cyst.",
    },
    {
      id: "c5", title: "Bilateral jaw expansion in a 6-year-old child",
      history: "Parents bring a 6-year-old boy due to progressive bilateral swelling of the lower face since age 4. His eyes have an upward gaze (looking towards heaven). His 8-year-old sister has a similar appearance. No fever, no pain.",
      findings: "Bilateral symmetric multilocular radiolucencies involving posterior mandible bilaterally. Displacement of developing teeth. Biopsy: fibrous stroma with numerous multinucleated giant cells.",
      tags: ["Developmental","Bilateral","Pediatric"], difficulty: "Hard",
      answer: "Cherubism",
      ddx: ["Cherubism","Central Giant Cell Granuloma","Fibrous Dysplasia","Hyperparathyroidism"],
      explanation: "Cherubism: autosomal dominant (SH3BP2 mutation), bilateral mandibular involvement, onset in childhood (2–5 years), cherubic facial appearance, upward eye gaze from orbital floor involvement. Spontaneous regression after puberty. Positive family history is key. Central GCG is unilateral; fibrous dysplasia is ground-glass, not GC-rich.",
    },
  ]);

  // ── Announcements ────────────────────────────────────────────────────────────
  await DB.set("announcements", [
    { id: "an1", title: "Quiz #3 Closes Friday", body: "The Module 1–3 comprehensive MCQ quiz closes this Friday at 11:59 PM. Late submissions will not be accepted.", date: "2026-05-08", priority: "high" },
    { id: "an2", title: "New AR Module Live",    body: "Inflammatory Lesions AR exploration is now live in the AR Explorer section. Check it out!", date: "2026-05-07", priority: "normal" },
    { id: "an3", title: "Final Report Due",      body: "Final project reports (PDF) due May 15. Submit via the PDF Upload portal.", date: "2026-05-06", priority: "normal" },
  ]);

  await DB.set(`seeded_${SEED_VERSION}`, true);
}
