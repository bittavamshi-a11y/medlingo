const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
const KEY = process.env.ANTHROPIC_API_KEY;            // set in Render > Environment
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5-5";

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

// [regex, category, consultant doctor, self-care steps, urgent]
const RULES = [
  [/chest pain|chest pressure|can't breathe|cannot breathe|difficulty breathing|trouble breathing|unconscious|seizure|stroke|heavy bleeding/, "Potential emergency", "Emergency Medical Care (call 112) / Cardiologist", ["Call emergency services immediately", "Sit upright, stay calm, loosen tight clothing", "Do not drive yourself; ask someone to stay with you"], true],
  [/tooth|teeth|gum|dental|jaw/, "Dental concern", "Dentist", ["Rinse gently with warm salt water", "Brush softly and floss around the area", "Avoid very hot, cold or sugary food", "Book a dental visit if pain lasts over 1-2 days"]],
  [/cough|sore throat|wheez|cold|congestion|sneez/, "Respiratory concern", "General Physician / Pulmonologist (ENT for throat)", ["Drink warm fluids and rest", "Steam inhalation or warm salt-water gargles", "Avoid smoke and dust", "See a doctor if it lasts over a week or breathing worsens"]],
  [/headache|migraine|dizz|vertigo/, "Headache or dizziness", "General Physician / Neurologist", ["Rest in a quiet, dim room", "Drink water and do not skip meals", "Reduce screen time", "See a doctor if sudden, severe, or with vision/speech changes"]],
  [/fever|temperature|body pain|body ache|fatigue|tired|weakness/, "Common symptom", "General Physician", ["Rest and drink plenty of fluids", "Wear light clothing and monitor temperature", "Eat light, nutritious food", "See a doctor if fever lasts over 3 days or is very high"]],
  [/skin|rash|itch|acne|allergy/, "Skin concern", "Dermatologist (General Physician first)", ["Keep the area clean and dry", "Avoid scratching and harsh soaps", "Note any new foods, products or medicines", "See a doctor if it spreads or swells"]],
  [/stomach|abdominal|nausea|vomit|diarrh|acidity|gas|constipation/, "Digestive concern", "General Physician / Gastroenterologist", ["Sip water or oral rehydration solution", "Eat light food (rice, banana, toast)", "Avoid spicy, oily food", "See a doctor if there is blood, severe pain or dehydration"]],
  [/back pain|joint|knee|muscle|neck pain|fracture|sprain/, "Muscle or joint concern", "Orthopedic Doctor / Physiotherapist", ["Rest the area and avoid heavy lifting", "Gentle stretching, warm or cold compress", "Maintain good posture", "See a doctor after an injury or if pain persists"]],
  [/eye|vision|blurry/, "Eye concern", "Ophthalmologist", ["Rest your eyes and avoid rubbing", "Reduce screen time", "Do not use eye drops without advice"]],
  [/stress|anxiety|sleep|insomnia|depress|panic|sad/, "Mental wellbeing", "Psychiatrist / Psychologist", ["Try slow deep breathing for 5 minutes", "Keep a regular sleep schedule", "Talk to someone you trust", "A professional can help if this continues"]]
];
const DISC = "MEDLINGO is an educational demo, not a diagnosis or substitute for professional medical care.";

function ruleAnswer(s) {
  for (const [re, category, specialist, steps, urgent] of RULES) {
    if (re.test(s)) return { category, specialist, steps, urgent: !!urgent, message: "Based on keywords in your description. A qualified professional should confirm." };
  }
  return { category: "General health concern", specialist: "General Physician", steps: ["Rest and stay hydrated", "Note when symptoms started and what changes them", "Consult a doctor if they persist or worsen"], urgent: false, message: "Consider discussing your symptoms with a qualified healthcare professional." };
}

async function askAI(symptom, langName) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: MODEL, max_tokens: 800,
      system: `You are MEDLINGO, an educational health guide (not a doctor). Reply ONLY with JSON: {"category":"","specialist":"which type of consultant doctor to see","message":"2 short sentences","steps":["3-5 safe self-care / overcome steps"],"urgent":false}. Write every value in ${langName}. Set urgent true and advise emergency care for red-flag symptoms. Never diagnose and never give medicine doses.`,
      messages: [{ role: "user", content: symptom }]
    })
  });
  const d = await r.json();
  const txt = d.content?.[0]?.text || "";
  return JSON.parse(txt.replace(/```json|```/g, "").trim());
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
    try { const ai = await askAI(raw, langName); out = { ...ai, urgent: !!ai.urgent || rule.urgent }; source = "ai"; }
    catch (e) { console.error("AI failed, using rules:", e.message); }
  }
  res.json({ ...out, source, disclaimer: DISC });
});

app.use((err, _q, res, _n) => { console.error(err); res.status(500).json({ error: "Unexpected server error." }); });
app.listen(PORT, () => console.log(`MEDLINGO running on port ${PORT} (AI ${KEY ? "on" : "off"})`));
