const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => res.json({ status: "ok", app: "MEDLINGO" }));

app.post("/api/symptoms", (req, res) => {
  const symptom = String(req.body?.symptom || "").trim().toLowerCase();
  if (!symptom) return res.status(400).json({ error: "Please enter a symptom." });
  if (symptom.length > 1000) return res.status(413).json({ error: "Keep your message under 1000 characters." });

  let category = "General health concern";
  let specialist = "General Physician";
  let message = "Consider discussing your symptoms with a qualified healthcare professional.";
  let urgent = false;

  if (/(chest pain|chest pressure|can't breathe|cannot breathe|difficulty breathing|trouble breathing|severe shortness of breath)/i.test(symptom)) {
    category = "Potential emergency";
    specialist = "Emergency Medical Care";
    message = "Chest pain or serious breathing difficulty can be an emergency. Seek immediate emergency medical help.";
    urgent = true;
  } else if (/(tooth|teeth|gum|gums|dental)/i.test(symptom)) {
    category = "Dental concern"; specialist = "Dentist";
    message = "A dentist can assess tooth, gum, or other oral-health concerns.";
  } else if (/(cough|sore throat|wheez|breath|cold|congestion)/i.test(symptom)) {
    category = "Respiratory concern";
    message = "A qualified clinician can assess cough, throat, or breathing-related symptoms.";
  } else if (/(headache|migraine|dizz|vertigo)/i.test(symptom)) {
    category = "Headache or dizziness";
    message = "A clinician can assess the cause, especially if the symptom is new, severe, or recurring.";
  } else if (/(fever|temperature|body pain|body ache|fatigue|tired)/i.test(symptom)) {
    category = "Common symptom";
    message = "A clinician can assess fever, aches, or fatigue in the context of your other symptoms.";
  } else if (/(skin|rash|itch|acne)/i.test(symptom)) {
    category = "Skin concern"; specialist = "General Physician or Dermatologist";
    message = "A clinician can assess skin symptoms and advise whether specialist care is appropriate.";
  } else if (/(stomach|abdominal|nausea|vomit|diarrhea|diarrhoea)/i.test(symptom)) {
    category = "Digestive concern";
    message = "A clinician can assess digestive symptoms and their duration or severity.";
  }

  res.json({
    category, specialist, message, urgent,
    disclaimer: "MEDLINGO is an educational demo, not a diagnosis or substitute for professional medical care."
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Unexpected server error. Please try again." });
});

app.listen(PORT, () => console.log(`MEDLINGO is running at http://localhost:${PORT}`));
