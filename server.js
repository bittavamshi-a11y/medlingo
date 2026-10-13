const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Keys come from Render > Environment (never hard-code them)
const GROQ_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"; // EDIT HERE: see console.groq.com/docs/models
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5-5";    // EDIT HERE

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

// Keys used to match doctors in public/doctors-data.js (must match SPECIALTIES there)
const KEYS = ["general","dentist","cardiologist","pulmonologist","ent","neurologist","dermatologist","gastro","orthopedic","ophthalmologist","gynecologist","pediatrician","psychiatrist","endocrinologist","emergency"];

// EDIT HERE: keyword rules ->
// [regex, category, doctor, selfCareSteps, urgent, precautions, seeDoctorIf, specialtyKey]
// First match wins. Keep the emergency rule first.
const RULES = [
  [/chest pain|chest pressure|can['’]?t breathe|cannot breathe|difficulty breathing|trouble breathing|unconscious|seizure|stroke|heavy bleeding/,
    "Potential emergency", "Emergency Medical Care (call 112) / Cardiologist",
    ["Call emergency services (112) immediately", "Sit upright, stay calm, loosen tight clothing", "Ask someone to stay with you"], true,
    ["Do not drive yourself to the hospital", "Do not eat or drink anything", "Do not take any medicine unless a doctor advises"],
    ["Go to the nearest hospital emergency department right now"], "emergency"],
  [/tooth|teeth|gum|dental|jaw/, "Dental concern", "Dentist",
    ["Rinse gently with warm salt water", "Brush softly and floss around the area", "Eat soft, lukewarm food"], false,
    ["Avoid very hot, cold or sugary food and drinks", "Do not put any painkiller directly on the gum", "Avoid tobacco and chewing on the painful side"],
    ["Pain lasts more than 1-2 days", "Face or gum swelling, or fever", "Bleeding that does not stop", "Trouble swallowing or opening the mouth"], "dentist"],
  [/cough|sore throat|wheez|cold|congestion|sneez/, "Respiratory concern", "General Physician / Pulmonologist (ENT for throat)",
    ["Drink warm fluids and rest", "Steam inhalation or warm salt-water gargles", "Keep your head slightly raised while sleeping"], false,
    ["Avoid smoke, dust and cold drinks", "Cover your mouth when coughing to protect others", "Do not take antibiotics without a prescription"],
    ["Symptoms last more than a week", "Breathing is difficult or you are wheezing", "High fever, or coughing up blood or thick yellow-green phlegm", "Chest pain"], "pulmonologist"],
  [/headache|migraine|dizz|vertigo/, "Headache or dizziness", "General Physician / Neurologist",
    ["Rest in a quiet, dim room", "Drink water and do not skip meals", "Reduce screen time"], false,
    ["Avoid sudden standing up and driving while dizzy", "Avoid loud noise, bright light and too much caffeine", "Do not overuse painkillers"],
    ["Sudden, very severe headache", "Vision, speech or balance changes, or weakness on one side", "Headache after a head injury", "Fever with stiff neck or vomiting"], "neurologist"],
  [/fever|temperature|body pain|body ache|fatigue|tired|weakness/, "Common symptom", "General Physician",
    ["Rest and drink plenty of fluids", "Wear light clothing and monitor temperature", "Eat light, nutritious food"], false,
    ["Avoid heavy exercise and going to work or school while feverish", "Avoid self-medicating with antibiotics", "Keep away from others to prevent spreading infection"],
    ["Fever lasts more than 3 days or is very high", "Rash, severe headache or stiff neck", "Breathing difficulty or confusion", "Weakness that keeps getting worse"], "general"],
  [/skin|rash|itch|acne|allergy/, "Skin concern", "Dermatologist (General Physician first)",
    ["Keep the area clean and dry", "Wear loose cotton clothing", "Note any new foods, products or medicines"], false,
    ["Avoid scratching, harsh soaps and strong creams", "Do not apply steroid creams without advice", "Avoid the suspected trigger"],
    ["The rash spreads quickly or blisters", "Swelling of the face, lips or tongue, or breathing trouble", "Fever, pus or increasing pain", "No improvement in a few days"], "dermatologist"],
  [/stomach|abdominal|nausea|vomit|diarrh|acidity|gas|constipation/, "Digestive concern", "General Physician / Gastroenterologist",
    ["Sip water or oral rehydration solution (ORS)", "Eat light food (rice, banana, toast)", "Rest"], false,
    ["Avoid spicy, oily food and alcohol", "Drink only clean, boiled or filtered water", "Do not take anti-diarrhoea medicine without advice"],
    ["Blood in stool or vomit", "Severe or constant stomach pain", "Signs of dehydration (very dry mouth, little urine, dizziness)", "Vomiting or diarrhoea for more than 2 days"], "gastro"],
  [/back pain|joint|knee|muscle|neck pain|fracture|sprain/, "Muscle or joint concern", "Orthopedic Doctor / Physiotherapist",
    ["Rest the area", "Gentle stretching, warm or cold compress", "Maintain good posture"], false,
    ["Avoid heavy lifting and sudden twisting", "Do not massage a possible fracture or sprain", "Avoid long hours in one position"],
    ["Pain after an injury or fall", "Swelling, deformity or you cannot move the area", "Numbness, tingling or leg weakness", "Pain lasts more than a week"], "orthopedic"],
  [/eye|vision|blurry/, "Eye concern", "Ophthalmologist",
    ["Rest your eyes", "Wash hands before touching your eyes", "Reduce screen time"], false,
    ["Do not rub your eyes", "Do not use eye drops without advice", "Avoid contact lenses until it is checked"],
    ["Sudden vision loss or blurring", "Severe eye pain or an injury to the eye", "Redness with discharge or light sensitivity"], "ophthalmologist"],
  [/stress|anxiety|sleep|insomnia|depress|panic|sad/, "Mental wellbeing", "Psychiatrist / Psychologist",
    ["Try slow deep breathing for 5 minutes", "Keep a regular sleep schedule", "Talk to someone you trust"], false,
    ["Avoid alcohol, excess caffeine and late-night screens", "Do not stop or start any medicine on your own", "Do not stay isolated"],
    ["Feelings last more than 2 weeks or affect daily life", "Panic attacks keep happening", "You have thoughts of harming yourself — contact a doctor or a helpline immediately"], "psychiatrist"]
];
const DISC = "MEDLINGO is an educational demo, not a diagnosis or substitute for professional medical care.";

function ruleAnswer(s) {
  for (const [re, category, specialist, steps, urgent, precautions, seeDoctor, specialtyKey] of RULES) {
    if (re.test(s)) return { category, specialist, specialtyKey, steps, urgent: !!urgent, precautions, seeDoctor, translation: "", message: "Based on keywords in your description. A qualified professional should confirm." };
  }
  return { category: "General health concern", specialist: "General Physician", specialtyKey: "general",
    steps: ["Rest and stay hydrated", "Note when symptoms started and what changes them", "Eat light, healthy food"], urgent: false,
    precautions: ["Avoid self-medicating", "Avoid heavy physical effort until you feel better"],
    seeDoctor: ["Symptoms persist more than 2-3 days", "Symptoms get worse or new ones appear"], translation: "",
    message: "Consider discussing your symptoms with a qualified healthcare professional." };
}

// EDIT HERE: system prompt used by every AI provider
const sysPrompt = (inName, outName) =>
  `You are MEDLINGO, an educational health guide (not a doctor). The user wrote in: ${inName} (detect the real language if this looks wrong). Reply ONLY with JSON: {"translation":"the user's message translated into ${outName}","category":"","specialist":"which type of consultant doctor to see","specialtyKey":"exactly one of: ${KEYS.join(", ")}","message":"2 short sentences","steps":["3-5 safe self-care steps"],"precautions":["2-4 things to avoid or be careful about"],"seeDoctor":["2-4 specific warning signs for this symptom that mean the person should consult a doctor"],"urgent":false}. Write every value except specialtyKey in ${outName}. Use specialtyKey "emergency" and set urgent true (advise calling 112) for red-flag symptoms such as chest pain, breathing trouble, stroke signs, seizure or heavy bleeding. Be specific to the user's symptom. Never diagnose and never give medicine doses.`;

const list = (a, n) => Array.isArray(a) ? a.map(String).filter(Boolean).slice(0, n) : [];

function parseAI(txt, fallback) {
  const m = String(txt).replace(/```json|```/g, "").trim();
  const j = JSON.parse(m.slice(m.indexOf("{"), m.lastIndexOf("}") + 1));
  const steps = list(j.steps, 5);
  if (!j.category || !j.specialist || !steps.length) throw new Error("Incomplete AI reply");
  const precautions = list(j.precautions, 4), seeDoctor = list(j.seeDoctor, 4);
  return {
    category: String(j.category).slice(0, 100), specialist: String(j.specialist).slice(0, 150),
    specialtyKey: KEYS.includes(j.specialtyKey) ? j.specialtyKey : fallback.specialtyKey,
    translation: String(j.translation || "").slice(0, 500),
    message: String(j.message || "").slice(0, 400), steps, urgent: !!j.urgent,
    precautions: precautions.length ? precautions : fallback.precautions,
    seeDoctor: seeDoctor.length ? seeDoctor : fallback.seeDoctor
  };
}

async function askGroq(symptom, inName, outName, fallback) {
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST", signal: AbortSignal.timeout(20000),
    headers: { "content-type": "application/json", authorization: "Bearer " + GROQ_KEY },
    body: JSON.stringify({
      model: GROQ_MODEL, temperature: 0.3, max_tokens: 1200,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: sysPrompt(inName, outName) }, { role: "user", content: symptom }]
    })
  });
  if (!r.ok) throw new Error("Groq status " + r.status);
  const d = await r.json();
  return parseAI(d.choices?.[0]?.message?.content || "", fallback);
}

async function askAnthropic(symptom, inName, outName, fallback) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", signal: AbortSignal.timeout(20000),
    headers: { "content-type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 1200, system: sysPrompt(inName, outName), messages: [{ role: "user", content: symptom }] })
  });
  if (!r.ok) throw new Error("Anthropic status " + r.status);
  const d = await r.json();
  return parseAI(d.content?.[0]?.text || "", fallback);
}


// Translate batches of interface text. Uses the same server-side provider keys as symptom guidance.
app.post("/api/translate", async (req, res) => {
  const texts = Array.isArray(req.body?.texts) ? req.body.texts.slice(0, 120).map(x => String(x).slice(0, 500)) : [];
  const target = String(req.body?.target || "English").slice(0, 40);
  if (!texts.length) return res.status(400).json({ error: "No text supplied." });
  if (texts.reduce((n, x) => n + x.length, 0) > 18000) return res.status(413).json({ error: "Translation batch is too large." });
  const prompt = `Translate every string in the JSON array into ${target}. Return ONLY a valid JSON object with a "translations" array containing exactly one translation per input string in the same order. Preserve meaning, names, numbers, HTML-free plain text, and medical safety warnings. Do not add explanations. Input JSON: ${JSON.stringify(texts)}`;
  try {
    if (GROQ_KEY) {
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST", signal: AbortSignal.timeout(20000),
        headers: { "content-type": "application/json", authorization: "Bearer " + GROQ_KEY },
        body: JSON.stringify({ model: GROQ_MODEL, temperature: 0.1, max_tokens: 5000, response_format: { type: "json_object" }, messages: [{ role: "system", content: "You are a precise multilingual UI translator. Return valid JSON only." }, { role: "user", content: prompt }] })
      });
      if (r.ok) {
        const d = await r.json();
        const raw = d.choices?.[0]?.message?.content || "{}";
        const parsed = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
        if (Array.isArray(parsed.translations) && parsed.translations.length === texts.length) return res.json({ translations: parsed.translations.map((x,i) => String(x || texts[i]).slice(0, 1000)) });
      }
    }
    if (ANTHROPIC_KEY) {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", signal: AbortSignal.timeout(20000),
        headers: { "content-type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 5000, system: "You are a precise multilingual UI translator. Return valid JSON only.", messages: [{ role: "user", content: prompt }] })
      });
      if (r.ok) {
        const d = await r.json(), raw = d.content?.[0]?.text || "{}";
        const parsed = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
        if (Array.isArray(parsed.translations) && parsed.translations.length === texts.length) return res.json({ translations: parsed.translations.map((x,i) => String(x || texts[i]).slice(0, 1000)) });
      }
    }
    return res.status(503).json({ error: "Translation provider is not configured." });
  } catch (e) {
    console.error("Translation failed:", e.message);
    return res.status(502).json({ error: "Translation service temporarily unavailable." });
  }
});


app.get("/api/health", (_q, res) => res.json({
  status: "ok", app: "MEDLINGO", ai: !!(GROQ_KEY || ANTHROPIC_KEY),
  providers: { groq: !!GROQ_KEY, anthropic: !!ANTHROPIC_KEY }
}));

app.post("/api/symptoms", async (req, res) => {
  const raw = String(req.body?.symptom || "").trim();
  const inName = String(req.body?.inName || "auto-detect").slice(0, 60);
  const outName = String(req.body?.outName || "English (en)").slice(0, 60);
  if (!raw) return res.status(400).json({ error: "Please enter a symptom." });
  if (raw.length > 1000) return res.status(413).json({ error: "Keep your message under 1000 characters." });
  const rule = ruleAnswer(raw.toLowerCase());
  let out = rule, source = "rules";
  // EDIT HERE: provider order. Each is tried only if its key exists.
  const providers = [];
  if (GROQ_KEY) providers.push(["groq", askGroq]);
  if (ANTHROPIC_KEY) providers.push(["anthropic", askAnthropic]);
  for (const [name, fn] of providers) {
    try { const ai = await fn(raw, inName, outName, rule); out = { ...ai, urgent: ai.urgent || rule.urgent }; source = name; break; }
    catch (e) { console.error(name + " failed:", e.message); }
  }
  res.json({ ...out, source, disclaimer: DISC });
});

app.use((err, _q, res, _n) => { console.error(err); res.status(500).json({ error: "Unexpected server error." }); });
app.listen(PORT, () => console.log(`MEDLINGO running on port ${PORT} (Groq ${GROQ_KEY ? "on" : "off"}, Anthropic ${ANTHROPIC_KEY ? "on" : "off"})`));
