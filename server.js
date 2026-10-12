const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
const KEY = process.env.ANTHROPIC_API_KEY;                    // set in Render > Environment (never hard-code)
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5-5"; // EDIT HERE: default model if CLAUDE_MODEL is not set

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

// EDIT HERE: keyword rules ->
// [regex, category, doctor, selfCareSteps, urgent, precautions, seeDoctorIf]
// First match wins. Keep the emergency rule first.
const RULES = [
  [/chest pain|chest pressure|can['’]?t breathe|cannot breathe|difficulty breathing|trouble breathing|unconscious|seizure|stroke|heavy bleeding/,
    "Potential emergency", "Emergency Medical Care (call 112) / Cardiologist",
    ["Call emergency services (112) immediately", "Sit upright, stay calm, loosen tight clothing", "Ask someone to stay with you"], true,
    ["Do not drive yourself to the hospital", "Do not eat or drink anything", "Do not take any medicine unless a doctor advises"],
    ["Go to the nearest hospital emergency department right now"]],
  [/tooth|teeth|gum|dental|jaw/, "Dental concern", "Dentist",
    ["Rinse gently with warm salt water", "Brush softly and floss around the area", "Eat soft, lukewarm food"], false,
    ["Avoid very hot, cold or sugary food and drinks", "Do not put any painkiller directly on the gum", "Avoid tobacco and chewing on the painful side"],
    ["Pain lasts more than 1-2 days", "Face or gum swelling, or fever", "Bleeding that does not stop", "Trouble swallowing or opening the mouth"]],
  [/cough|sore throat|wheez|cold|congestion|sneez/, "Respiratory concern", "General Physician / Pulmonologist (ENT for throat)",
    ["Drink warm fluids and rest", "Steam inhalation or warm salt-water gargles", "Keep your head slightly raised while sleeping"], false,
    ["Avoid smoke, dust and cold drinks", "Cover your mouth when coughing to protect others", "Do not take antibiotics without a prescription"],
    ["Symptoms last more than a week", "Breathing is difficult or you are wheezing", "High fever, or coughing up blood or thick yellow-green phlegm", "Chest pain"]],
  [/headache|migraine|dizz|vertigo/, "Headache or dizziness", "General Physician / Neurologist",
    ["Rest in a quiet, dim room", "Drink water and do not skip meals", "Reduce screen time"], false,
    ["Avoid sudden standing up and driving while dizzy", "Avoid loud noise, bright light and too much caffeine", "Do not overuse painkillers"],
    ["Sudden, very severe headache", "Vision, speech or balance changes, or weakness on one side", "Headache after a head injury", "Fever with stiff neck or vomiting"]],
  [/fever|temperature|body pain|body ache|fatigue|tired|weakness/, "Common symptom", "General Physician",
    ["Rest and drink plenty of fluids", "Wear light clothing and monitor temperature", "Eat light, nutritious food"], false,
    ["Avoid heavy exercise and going to work or school while feverish", "Avoid self-medicating with antibiotics", "Keep away from others to prevent spreading infection"],
    ["Fever lasts more than 3 days or is very high", "Rash, severe headache or stiff neck", "Breathing difficulty or confusion", "Weakness that keeps getting worse"]],
  [/skin|rash|itch|acne|allergy/, "Skin concern", "Dermatologist (General Physician first)",
    ["Keep the area clean and dry", "Wear loose cotton clothing", "Note any new foods, products or medicines"], false,
    ["Avoid scratching, harsh soaps and strong creams", "Do not apply steroid creams without advice", "Avoid the suspected trigger"],
    ["The rash spreads quickly or blisters", "Swelling of the face, lips or tongue, or breathing trouble", "Fever, pus or increasing pain", "No improvement in a few days"]],
  [/stomach|abdominal|nausea|vomit|diarrh|acidity|gas|constipation/, "Digestive concern", "General Physician / Gastroenterologist",
    ["Sip water or oral rehydration solution (ORS)", "Eat light food (rice, banana, toast)", "Rest"], false,
    ["Avoid spicy, oily food and alcohol", "Drink only clean, boiled or filtered water", "Do not take anti-diarrhoea medicine without advice"],
    ["Blood in stool or vomit", "Severe or constant stomach pain", "Signs of dehydration (very dry mouth, little urine, dizziness)", "Vomiting or diarrhoea for more than 2 days"]],
  [/back pain|joint|knee|muscle|neck pain|fracture|sprain/, "Muscle or joint concern", "Orthopedic Doctor / Physiotherapist",
    ["Rest the area", "Gentle stretching, warm or cold compress", "Maintain good posture"], false,
    ["Avoid heavy lifting and sudden twisting", "Do not massage a possible fracture or sprain", "Avoid long hours in one position"],
    ["Pain after an injury or fall", "Swelling, deformity or you cannot move the area", "Numbness, tingling or leg weakness", "Pain lasts more than a week"]],
  [/eye|vision|blurry/, "Eye concern", "Ophthalmologist",
    ["Rest your eyes", "Wash hands before touching your eyes", "Reduce screen time"], false,
    ["Do not rub your eyes", "Do not use eye drops without advice", "Avoid contact lenses until it is checked"],
    ["Sudden vision loss or blurring", "Severe eye pain or an injury to the eye", "Redness with discharge or light sensitivity"]],
  [/stress|anxiety|sleep|insomnia|depress|panic|sad/, "Mental wellbeing", "Psychiatrist / Psychologist",
    ["Try slow deep breathing for 5 minutes", "Keep a regular sleep schedule", "Talk to someone you trust"], false,
    ["Avoid alcohol, excess caffeine and late-night screens", "Do not stop or start any medicine on your own", "Do not stay isolated"],
    ["Feelings last more than 2 weeks or affect daily life", "Panic attacks keep happening", "You have thoughts of harming yourself — contact a doctor or a helpline immediately"]]
];
const DISC = "MEDLINGO is an educational demo, not a diagnosis or substitute for professional medical care.";

function ruleAnswer(s) {
  for (const [re, category, specialist, steps, urgent, precautions, seeDoctor] of RULES) {
    if (re.test(s)) return { category, specialist, steps, urgent: !!urgent, precautions, seeDoctor, message: "Based on keywords in your description. A qualified professional should confirm." };
  }
  return { category: "General health concern", specialist: "General Physician",
    steps: ["Rest and stay hydrated", "Note when symptoms started and what changes them", "Eat light, healthy food"], urgent: false,
    precautions: ["Avoid self-medicating", "Avoid heavy physical effort until you feel better"],
    seeDoctor: ["Symptoms persist more than 2-3 days", "Symptoms get worse or new ones appear"],
    message: "Consider discussing your symptoms with a qualified healthcare professional." };
}

const list = (a, n) => Array.isArray(a) ? a.map(String).filter(Boolean).slice(0, n) : [];

// Calls the Anthropic Messages API. Throws on any problem so the caller can fall back to rules.
async function askAI(symptom, langName, fallback) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal: AbortSignal.timeout(20000),
    headers: { "content-type": "application/json", "x-api-key": KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: MODEL, max_tokens: 1000,
      // EDIT HERE: system prompt
      system: `You are MEDLINGO, an educational health guide (not a doctor). Reply ONLY with JSON: {"category":"","specialist":"which type of consultant doctor to see","message":"2 short sentences","steps":["3-5 safe self-care steps"],"precautions":["2-4 things to avoid or be careful about"],"seeDoctor":["2-4 specific warning signs for this symptom that mean the person should consult a doctor"],"urgent":false}. Write every value in ${langName}. Set urgent true and advise emergency care (112) for red-flag symptoms. Never diagnose and never give medicine doses.`,
      messages: [{ role: "user", content: symptom }]
    })
  });
  if (!r.ok) throw new Error("API status " + r.status);
  const d = await r.json();
  const txt = d.content?.[0]?.text || "";
  const j = JSON.parse(txt.replace(/```json|```/g, "").trim());
  const steps = list(j.steps, 5);
  if (!j.category || !j.specialist || !steps.length) throw new Error("Incomplete AI reply");
  const precautions = list(j.precautions, 4), seeDoctor = list(j.seeDoctor, 4);
  return {
    category: String(j.category).slice(0, 100), specialist: String(j.specialist).slice(0, 150),
    message: String(j.message || "").slice(0, 400), steps, urgent: !!j.urgent,
    // if the AI forgot these, use the rule text so the sections are never empty
    precautions: precautions.length ? precautions : fallback.precautions,
    seeDoctor: seeDoctor.length ? seeDoctor : fallback.seeDoctor
  };
}

app.get("/api/health", (_q, res) => res.json({ status: "ok", app: "MEDLINGO", ai: !!KEY }));

app.post("/api/symptoms", async (req, res) => {
  const raw = String(req.body?.symptom || "").trim();
  const langName = String(req.body?.langName || "English").slice(0, 30);
  if (!raw) return res.status(400).json({ error: "Please enter a symptom." });
  if (raw.length > 1000) return res.status(413).json({ error: "Keep your message under 1000 characters." });
  const rule = ruleAnswer(raw.toLowerCase());
  let out = rule, source = "rules";
  if (KEY) {
    try { const ai = await askAI(raw, langName, rule); out = { ...ai, urgent: ai.urgent || rule.urgent }; source = "ai"; }
    catch (e) { console.error("AI failed, using rules:", e.message); }
  }
  res.json({ ...out, source, disclaimer: DISC });
});

app.use((err, _q, res, _n) => { console.error(err); res.status(500).json({ error: "Unexpected server error." }); });
app.listen(PORT, () => console.log(`MEDLINGO running on port ${PORT} (AI ${KEY ? "on" : "off"})`));
