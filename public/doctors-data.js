// EDIT HERE: specialties. "key" must match the keys in server.js (KEYS list).
const SPECIALTIES=[
{key:"general",name:"General Physician",treats:"Fever, cold, fatigue, body ache, first check-up"},
{key:"dentist",name:"Dentist",treats:"Tooth pain, gum bleeding, mouth ulcers"},
{key:"cardiologist",name:"Cardiologist",treats:"Chest pain, palpitations, high blood pressure"},
{key:"pulmonologist",name:"Pulmonologist",treats:"Persistent cough, wheezing, breathing difficulty"},
{key:"ent",name:"ENT Specialist",treats:"Sore throat, ear pain, sinus, hearing"},
{key:"neurologist",name:"Neurologist",treats:"Migraine, dizziness, numbness, seizures"},
{key:"dermatologist",name:"Dermatologist",treats:"Rash, acne, itching, hair and skin problems"},
{key:"gastro",name:"Gastroenterologist",treats:"Stomach pain, acidity, vomiting, diarrhoea"},
{key:"orthopedic",name:"Orthopedic Doctor",treats:"Knee, joint, back pain, fractures"},
{key:"ophthalmologist",name:"Ophthalmologist",treats:"Eye pain, blurry vision, redness"},
{key:"gynecologist",name:"Gynecologist",treats:"Periods, pregnancy, women's health"},
{key:"pediatrician",name:"Pediatrician",treats:"Health problems in babies and children"},
{key:"psychiatrist",name:"Psychiatrist",treats:"Anxiety, depression, sleep problems, panic"},
{key:"endocrinologist",name:"Endocrinologist",treats:"Diabetes, thyroid, hormone issues"}
];

// EDIT HERE: your doctor directory. These are PLACEHOLDERS - replace with real doctors/clinics
// (with their permission). phone: use digits like "+919876543210". online: an https:// link
// (video-consult page, WhatsApp link like https://wa.me/919876543210, or hospital booking page) or "".
// Entries whose phone still contains X show "Phone not added yet" instead of a Call button.
const DOCTORS=[
{key:"general",name:"Dr. Sample Name",hospital:"Sample Clinic, City",timings:"Mon-Sat 9am-6pm",languages:"English, Hindi",phone:"+91 XXXXX XXXXX",online:""},
{key:"dentist",name:"Dr. Sample Name",hospital:"Sample Dental Care, City",timings:"Mon-Sat 10am-7pm",languages:"English",phone:"+91 XXXXX XXXXX",online:""},
{key:"cardiologist",name:"Dr. Sample Name",hospital:"Sample Heart Hospital, City",timings:"Mon-Fri 10am-4pm",languages:"English",phone:"+91 XXXXX XXXXX",online:""},
{key:"pulmonologist",name:"Dr. Sample Name",hospital:"Sample Chest Clinic, City",timings:"Mon-Sat 10am-5pm",languages:"English",phone:"+91 XXXXX XXXXX",online:""},
{key:"ent",name:"Dr. Sample Name",hospital:"Sample ENT Centre, City",timings:"Mon-Sat 10am-5pm",languages:"English",phone:"+91 XXXXX XXXXX",online:""},
{key:"neurologist",name:"Dr. Sample Name",hospital:"Sample Neuro Centre, City",timings:"Mon-Fri 11am-5pm",languages:"English",phone:"+91 XXXXX XXXXX",online:""},
{key:"dermatologist",name:"Dr. Sample Name",hospital:"Sample Skin Clinic, City",timings:"Mon-Sat 10am-6pm",languages:"English",phone:"+91 XXXXX XXXXX",online:""},
{key:"gastro",name:"Dr. Sample Name",hospital:"Sample Digestive Care, City",timings:"Mon-Sat 10am-5pm",languages:"English",phone:"+91 XXXXX XXXXX",online:""},
{key:"orthopedic",name:"Dr. Sample Name",hospital:"Sample Bone & Joint Clinic, City",timings:"Mon-Sat 10am-6pm",languages:"English",phone:"+91 XXXXX XXXXX",online:""},
{key:"ophthalmologist",name:"Dr. Sample Name",hospital:"Sample Eye Hospital, City",timings:"Mon-Sat 9am-5pm",languages:"English",phone:"+91 XXXXX XXXXX",online:""},
{key:"gynecologist",name:"Dr. Sample Name",hospital:"Sample Women's Clinic, City",timings:"Mon-Sat 10am-5pm",languages:"English",phone:"+91 XXXXX XXXXX",online:""},
{key:"pediatrician",name:"Dr. Sample Name",hospital:"Sample Child Care, City",timings:"Mon-Sat 9am-6pm",languages:"English",phone:"+91 XXXXX XXXXX",online:""},
{key:"psychiatrist",name:"Dr. Sample Name",hospital:"Sample Mind Care, City",timings:"Mon-Sat 10am-5pm",languages:"English",phone:"+91 XXXXX XXXXX",online:""},
{key:"endocrinologist",name:"Dr. Sample Name",hospital:"Sample Diabetes Centre, City",timings:"Mon-Fri 10am-4pm",languages:"English",phone:"+91 XXXXX XXXXX",online:""}
];

// EDIT HERE: helplines (India numbers - check them for your state/country before publishing)
const HELPLINES=[
{name:"Emergency (police, fire, ambulance)",num:"112"},
{name:"Ambulance",num:"108"},
{name:"Mental health - Tele-MANAS",num:"14416"},
{name:"Health advice (state helpline)",num:"104"}
];
const TELEMEDICINE={name:"eSanjeevani (government telemedicine)",url:"https://esanjeevani.mohfw.gov.in"};

// ---- shared renderers (used by assistant.html and doctors.html) ----
// t2 = function giving translated labels (M.t2 = UI language, M.to2 = answer language)
function doctorEl(d,t2){
  t2=t2||M.t2;
  const row=document.createElement("article");row.className="docrow";
  const info=document.createElement("div");
  const n=document.createElement("strong");n.textContent=d.name;
  const s=document.createElement("small");s.textContent=[d.hospital,d.timings,d.languages].filter(Boolean).join(" · ");
  info.append(n,s);
  const acts=document.createElement("div");acts.className="docacts";
  if(/^\+?[0-9][0-9 ()-]{6,}$/.test(d.phone||"")){
    const c=document.createElement("a");c.className="callbtn";c.href="tel:"+d.phone.replace(/[^\d+]/g,"");c.textContent="📞 "+t2(5);acts.appendChild(c);
  }else{const x=document.createElement("small");x.textContent="Phone not added yet";acts.appendChild(x)}
  if(/^https:\/\//.test(d.online||"")){
    const o=document.createElement("a");o.className="callbtn alt";o.href=d.online;o.target="_blank";o.rel="noopener";o.textContent="💻 "+t2(6);acts.appendChild(o);
  }
  row.append(info,acts);return row;
}
function doctorsFor(key){return DOCTORS.filter(d=>d.key===key)}
function renderHelplines(box){
  box.innerHTML="";
  HELPLINES.forEach(h=>{const a=document.createElement("a");a.href="tel:"+h.num;
    const n=document.createElement("span");n.textContent=h.name;const b=document.createElement("b");b.textContent=h.num;a.append(n,b);box.appendChild(a)});
  const t=document.createElement("a");t.href=TELEMEDICINE.url;t.target="_blank";t.rel="noopener";
  const n=document.createElement("span");n.textContent=TELEMEDICINE.name;const b=document.createElement("b");b.textContent="↗";t.append(n,b);box.appendChild(t);
}
