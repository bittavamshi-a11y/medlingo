const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Keys come from Render > Environment (never hard-code them)
const GROQ_KEY = process.env.GROQ_API_KEY;
const CONFIGURED_GROQ_MODEL = String(process.env.GROQ_MODEL || "").trim();
const RETIRED_GROQ_MODELS = new Set(["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]);
const GROQ_MODEL = CONFIGURED_GROQ_MODEL && !RETIRED_GROQ_MODELS.has(CONFIGURED_GROQ_MODEL)
  ? CONFIGURED_GROQ_MODEL
  : "openai/gpt-oss-120b"; // Current production fallback; ignore retired defaults from older Render settings.
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5-5";    // EDIT HERE

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

// Multilingual speech endpoint. Audio is generated server-side so playback does not
// depend on which language voices happen to be installed on the visitor's device.
const TTS_CODES = {
  en: "en", hi: "hi", te: "te", ta: "ta", kn: "kn", ml: "ml", bn: "bn",
  mr: "mr", gu: "gu", pa: "pa", ur: "ur", es: "es", fr: "fr", ar: "ar", zh: "zh-CN"
};
app.post("/api/tts", async (req, res) => {
  const text = String(req.body?.text || "").trim();
  const lang = String(req.body?.lang || "en").toLowerCase();
  const code = TTS_CODES[lang];
  if (!text) return res.status(400).json({ error: "Text is required." });
  if (text.length > 3500) return res.status(413).json({ error: "Speech text is too long." });
  if (!code) return res.status(400).json({ error: "Unsupported speech language." });

  // Split at sentence boundaries and keep requests short for the speech endpoint.
  const sentences = text.match(/[^.!?。！？]+[.!?。！？]*/g) || [text];
  const chunks = [];
  let current = "";
  for (const sentence of sentences) {
    const part = sentence.trim();
    if (!part) continue;
    if ((current + " " + part).trim().length <= 180) current = (current + " " + part).trim();
    else {
      if (current) chunks.push(current);
      for (let i = 0; i < part.length; i += 180) chunks.push(part.slice(i, i + 180));
      current = "";
    }
  }
  if (current) chunks.push(current);
  try {
    const audioParts = [];
    for (const chunk of chunks) {
      const url = new URL("https://translate.google.com/translate_tts");
      url.searchParams.set("ie", "UTF-8");
      url.searchParams.set("client", "tw-ob");
      url.searchParams.set("tl", code);
      url.searchParams.set("q", chunk);
      const response = await fetch(url, {
        signal: AbortSignal.timeout(15000),
        headers: { "user-agent": "Mozilla/5.0 MEDLINGO speech" }
      });
      if (!response.ok) throw new Error("Speech provider returned " + response.status);
      audioParts.push(Buffer.from(await response.arrayBuffer()));
    }
    if (!audioParts.length) throw new Error("No speech audio returned");
    res.set("Content-Type", "audio/mpeg");
    res.set("Cache-Control", "no-store");
    res.send(Buffer.concat(audioParts));
  } catch (e) {
    console.error("Multilingual TTS failed:", e.message);
    res.status(502).json({ error: "Speech generation is temporarily unavailable." });
  }
});



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


// Translate interface text in small batches so large pages do not exceed model output limits.
app.post("/api/translate", async (req, res) => {
  const texts = Array.isArray(req.body?.texts)
    ? req.body.texts.slice(0, 120).map(x => String(x).slice(0, 500))
    : [];
  const target = cleanLanguageName(String(req.body?.target || "English").slice(0, 60));
  if (!texts.length) return res.status(400).json({ error: "No text supplied." });
  if (texts.reduce((n, x) => n + x.length, 0) > 18000) {
    return res.status(413).json({ error: "Translation batch is too large." });
  }
  if (/^english$/i.test(target)) return res.json({ translations: texts });
  try {
    const translations = await translateBatch(texts, target);
    if (!translations || translations.length !== texts.length) {
      return res.status(503).json({ error: "Translation service temporarily unavailable." });
    }
    return res.json({ translations });
  } catch (e) {
    console.error("Interface translation failed:", e.message);
    return res.status(502).json({ error: "Translation service temporarily unavailable." });
  }
});

app.get("/api/health", (_q, res) => res.json({
  status: "ok", app: "MEDLINGO", ai: !!(GROQ_KEY || ANTHROPIC_KEY),
  providers: { groq: !!GROQ_KEY, anthropic: !!ANTHROPIC_KEY }
}));


function cleanLanguageName(value) {
  // The browser may send a native-language label, an English name, or "Label (code)".
  const name = String(value || "English").replace(/\s*\([^)]*\)\s*$/, "").trim();
  const aliases = {
    English: "English", en: "English", hi: "Hindi", te: "Telugu", ta: "Tamil", kn: "Kannada", ml: "Malayalam", bn: "Bengali", mr: "Marathi", gu: "Gujarati", pa: "Punjabi", ur: "Urdu", es: "Spanish", fr: "French", ar: "Arabic", zh: "Chinese", "zh-CN": "Chinese",
    हिन्दी: "Hindi", हिंदी: "Hindi", Hindi: "Hindi",
    తెలుగు: "Telugu", Telugu: "Telugu",
    தமிழ்: "Tamil", Tamil: "Tamil",
    ಕನ್ನಡ: "Kannada", Kannada: "Kannada",
    മലയാളം: "Malayalam", Malayalam: "Malayalam",
    বাংলা: "Bengali", Bengali: "Bengali",
    मराठी: "Marathi", Marathi: "Marathi",
    ગુજરાતી: "Gujarati", Gujarati: "Gujarati",
    ਪੰਜਾਬੀ: "Punjabi", Punjabi: "Punjabi",
    اردو: "Urdu", Urdu: "Urdu",
    Español: "Spanish", Spanish: "Spanish",
    Français: "French", French: "French",
    العربية: "Arabic", Arabic: "Arabic",
    中文: "Chinese", Chinese: "Chinese"
  };
  return aliases[name] || name || "English";
}

// Fallback translator for every supported language. This uses Google's web translation
// endpoint as a best-effort backup when the configured AI provider errors or returns bad JSON.
const TRANSLATE_CODES = {
  English: "en", Hindi: "hi", Telugu: "te", Tamil: "ta", Kannada: "kn",
  Malayalam: "ml", Bengali: "bn", Marathi: "mr", Gujarati: "gu", Punjabi: "pa",
  Urdu: "ur", Spanish: "es", French: "fr", Arabic: "ar", Chinese: "zh-CN"
};

async function translateWithGoogle(texts, language) {
  const targetCode = TRANSLATE_CODES[language];
  if (!targetCode) return null;
  const results = await Promise.all(texts.map(async text => {
    const url = new URL("https://translate.googleapis.com/translate_a/single");
    url.searchParams.set("client", "gtx");
    url.searchParams.set("sl", "auto");
    url.searchParams.set("tl", targetCode);
    url.searchParams.set("dt", "t");
    url.searchParams.set("q", String(text));
    const response = await fetch(url, {
      signal: AbortSignal.timeout(12000),
      headers: { "user-agent": "Mozilla/5.0 MEDLINGO translation fallback" }
    });
    if (!response.ok) throw new Error("Translation fallback status " + response.status);
    const data = await response.json();
    const translated = Array.isArray(data?.[0])
      ? data[0].map(part => Array.isArray(part) ? part[0] || "" : "").join("")
      : "";
    if (!translated.trim()) throw new Error("Translation fallback returned empty text");
    return translated.trim();
  }));
  return results;
}

async function translateBatch(texts, target) {
  const language = cleanLanguageName(target);
  if (!Array.isArray(texts) || !texts.length) return [];
  if (/^english$/i.test(language)) return texts.map(String);
  // Smaller chunks avoid truncated JSON when a page has many text nodes.
  const output = [];
  for (let offset = 0; offset < texts.length; offset += 12) {
    const chunk = texts.slice(offset, offset + 12).map(x => String(x));
    const prompt = `Translate every string in the JSON array into ${language}. Return ONLY valid JSON with a "translations" array containing exactly ${chunk.length} strings in the same order. Keep each translation faithful, natural, and concise. Preserve names, numbers, links, and medical safety warnings. Do not return the original English unless it is a proper name or has no suitable translation. Input JSON: ${JSON.stringify(chunk)}`;
    let translated = null;

    if (GROQ_KEY) {
      try {
        const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST", signal: AbortSignal.timeout(20000),
          headers: { "content-type": "application/json", authorization: "Bearer " + GROQ_KEY },
          body: JSON.stringify({
            model: GROQ_MODEL, temperature: 0.1, max_tokens: 3000,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: "You are a precise multilingual translator. Return valid JSON only." },
              { role: "user", content: prompt }
            ]
          })
        });
        if (r.ok) {
          const d = await r.json();
          const raw = d.choices?.[0]?.message?.content || "";
          const j = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
          if (Array.isArray(j.translations) && j.translations.length === chunk.length &&
              j.translations.every(v => typeof v === "string" && v.trim())) {
            translated = j.translations.map(v => v.trim());
          } else {
            throw new Error("Groq returned an incomplete translation array");
          }
        } else {
          const detail = await r.text().catch(() => "");
          throw new Error("Groq status " + r.status + (detail ? ": " + detail.slice(0, 180) : ""));
        }
      } catch (e) {
        console.error("Groq translation failed:", e.message);
      }
    }

    if (!translated && ANTHROPIC_KEY) {
      try {
        const r = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST", signal: AbortSignal.timeout(20000),
          headers: { "content-type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
          body: JSON.stringify({
            model: CLAUDE_MODEL, max_tokens: 3000,
            system: "You are a precise multilingual translator. Return valid JSON only.",
            messages: [{ role: "user", content: prompt }]
          })
        });
        if (r.ok) {
          const d = await r.json(), raw = d.content?.[0]?.text || "";
          const j = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
          if (Array.isArray(j.translations) && j.translations.length === chunk.length &&
              j.translations.every(v => typeof v === "string" && v.trim())) {
            translated = j.translations.map(v => v.trim());
          } else {
            throw new Error("Anthropic returned an incomplete translation array");
          }
        } else {
          const detail = await r.text().catch(() => "");
          throw new Error("Anthropic status " + r.status + (detail ? ": " + detail.slice(0, 180) : ""));
        }
      } catch (e) {
        console.error("Anthropic translation failed:", e.message);
      }
    }

    // Do not accept a provider response that simply repeats all source strings.
    if (translated && translated.every((value, i) => value.trim() === chunk[i].trim())) {
      translated = null;
    }
    if (!translated) {
      try {
        translated = await translateWithGoogle(chunk, language);
        console.log("Translation fallback succeeded for", language);
      } catch (e) {
        console.error("Translation fallback failed for", language + ":", e.message);
        return null;
      }
    }
    if (!translated || translated.length !== chunk.length) return null;
    output.push(...translated);
  }
  return output;
}

// Safe diagnostic: confirms whether the configured provider can translate without exposing API keys.
app.get("/api/translate-test", async (_req, res) => {
  const translations = await translateBatch(["Hello. Please drink water and rest."], "Telugu");
  res.json({
    providerConfigured: !!GROQ_KEY,
    translationSucceeded: Array.isArray(translations) && translations.length === 1,
    translatedSample: Array.isArray(translations) ? translations[0] : null,
    hint: Array.isArray(translations) ? "Translation provider responded." : "The provider request failed or returned an unexpected response. Check Render runtime logs."
  });
});

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
  // Translate detailed guidance into the requested language, but keep the symptom label
  // separate so it remains a direct translation of exactly what the user entered.
  const targetLanguage = cleanLanguageName(outName);
  if (!/^english/i.test(targetLanguage)) {
    const fields = ["category","specialist","message","steps","precautions","seeDoctor"];
    const values = fields.flatMap(k => Array.isArray(out[k]) ? out[k] : [out[k] || ""]);
    const translated = await translateBatch(values, targetLanguage);
    if (translated) {
      let i = 0;
      for (const k of fields) {
        if (Array.isArray(out[k])) {
          out[k] = translated.slice(i, i + out[k].length);
          i += out[k].length;
        } else {
          out[k] = translated[i++] || out[k];
        }
      }
    } else {
      console.error("Could not translate symptom response to", outName, "(check Render translation provider keys and logs)");
    }
  }

  // Translate the original input directly for the source/translation card.
  // Example: "Fever" -> "बुखार" in Hindi or "జ్వరం" in Telugu.
  try {
    if (/^english/i.test(targetLanguage) && /^english/i.test(inName)) {
      out.translation = raw;
    } else {
      const exactTranslation = await translateWithGoogle([raw], targetLanguage);
      if (exactTranslation && exactTranslation[0]) out.translation = exactTranslation[0];
      else {
        const fallbackTranslation = await translateBatch([raw], targetLanguage);
        out.translation = fallbackTranslation?.[0] || raw;
      }
    }
  } catch (e) {
    console.error("Exact symptom translation failed:", e.message);
    try {
      const fallbackTranslation = await translateBatch([raw], targetLanguage);
      out.translation = fallbackTranslation?.[0] || raw;
    } catch {
      out.translation = raw;
    }
  }
  res.json({ ...out, source, disclaimer: DISC });
});

app.use((err, _q, res, _n) => { console.error(err); res.status(500).json({ error: "Unexpected server error." }); });
app.listen(PORT, () => console.log(`MEDLINGO running on port ${PORT} (Groq ${GROQ_KEY ? "on" : "off"}, Anthropic ${ANTHROPIC_KEY ? "on" : "off"})`));
