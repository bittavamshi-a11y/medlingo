const LANGS=[["en","English","en-IN"],["hi","हिन्दी","hi-IN"],["te","తెలుగు","te-IN"],["ta","தமிழ்","ta-IN"],["kn","ಕನ್ನಡ","kn-IN"],["ml","മലയാളം","ml-IN"],["bn","বাংলা","bn-IN"],["mr","मराठी","mr-IN"],["gu","ગુજરાતી","gu-IN"],["pa","ਪੰਜਾਬੀ","pa-IN"],["ur","اردو","ur-PK"],["es","Español","es-ES"],["fr","Français","fr-FR"],["ar","العربية","ar-SA"],["zh","中文","zh-CN"]];
// 0 Home,1 Assistant,2 Doctors,3 About,4 Placeholder,5 Get guidance,6 Consult,7 What you can do,8 Listen
const T={
en:["Home","Assistant","Doctors","About","Describe your symptom...","Get guidance","Consult","What you can do","Listen"],
hi:["होम","सहायक","डॉक्टर","परिचय","अपना लक्षण बताएं...","सलाह पाएं","परामर्श लें","आप क्या कर सकते हैं","सुनें"],
te:["హోమ్","సహాయకుడు","వైద్యులు","గురించి","మీ లక్షణాన్ని వివరించండి...","సలహా పొందండి","సంప్రదించండి","మీరు ఏమి చేయవచ్చు","వినండి"],
ta:["முகப்பு","உதவியாளர்","மருத்துவர்கள்","பற்றி","உங்கள் அறிகுறியை விவரிக்கவும்...","வழிகாட்டல் பெறுங்கள்","அணுகவும்","நீங்கள் செய்யக்கூடியவை","கேளுங்கள்"],
kn:["ಮುಖಪುಟ","ಸಹಾಯಕ","ವೈದ್ಯರು","ಬಗ್ಗೆ","ನಿಮ್ಮ ಲಕ್ಷಣವನ್ನು ವಿವರಿಸಿ...","ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ","ಸಂಪರ್ಕಿಸಿ","ನೀವು ಏನು ಮಾಡಬಹುದು","ಆಲಿಸಿ"],
ml:["ഹോം","സഹായി","ഡോക്ടർമാർ","കുറിച്ച്","നിങ്ങളുടെ ലക്ഷണം വിവരിക്കുക...","മാർഗനിർദേശം നേടുക","സമീപിക്കുക","നിങ്ങൾക്ക് ചെയ്യാവുന്നത്","കേൾക്കുക"],
bn:["হোম","সহকারী","ডাক্তার","সম্পর্কে","আপনার উপসর্গ বর্ণনা করুন...","পরামর্শ নিন","পরামর্শ করুন","আপনি কী করতে পারেন","শুনুন"],
mr:["मुख्यपृष्ठ","सहाय्यक","डॉक्टर","माहिती","तुमचे लक्षण सांगा...","मार्गदर्शन मिळवा","सल्ला घ्या","तुम्ही काय करू शकता","ऐका"],
gu:["હોમ","સહાયક","ડૉક્ટરો","વિશે","તમારું લક્ષણ જણાવો...","માર્ગદર્શન મેળવો","સલાહ લો","તમે શું કરી શકો","સાંભળો"],
pa:["ਹੋਮ","ਸਹਾਇਕ","ਡਾਕਟਰ","ਬਾਰੇ","ਆਪਣਾ ਲੱਛਣ ਦੱਸੋ...","ਸਲਾਹ ਲਓ","ਸਲਾਹ ਕਰੋ","ਤੁਸੀਂ ਕੀ ਕਰ ਸਕਦੇ ਹੋ","ਸੁਣੋ"],
ur:["ہوم","معاون","ڈاکٹر","تعارف","اپنی علامت بیان کریں...","رہنمائی حاصل کریں","مشورہ کریں","آپ کیا کر سکتے ہیں","سنیں"],
es:["Inicio","Asistente","Médicos","Acerca de","Describe tu síntoma...","Obtener orientación","Consultar","Qué puedes hacer","Escuchar"],
fr:["Accueil","Assistant","Médecins","À propos","Décrivez votre symptôme...","Obtenir des conseils","Consulter","Ce que vous pouvez faire","Écouter"],
ar:["الرئيسية","المساعد","الأطباء","حول","صف أعراضك...","احصل على إرشاد","استشر","ما يمكنك فعله","استمع"],
zh:["首页","助手","医生","关于","描述您的症状...","获取指导","咨询","您可以怎么做","朗读"]};
const M={lang:localStorage.lang||"en"};
if(!T[M.lang])M.lang="en";
M.info=()=>LANGS.find(l=>l[0]===M.lang);
M.t=i=>T[M.lang][i];
document.documentElement.lang=M.lang;
document.documentElement.dir=["ar","ur"].includes(M.lang)?"rtl":"ltr";
if(localStorage.theme==="light")document.body.classList.add("light");
// shared header
const here=location.pathname.split("/").pop()||"index.html";
const links=[["index.html",0],["assistant.html",1],["doctors.html",2],["about.html",3]];
document.getElementById("hdr").innerHTML=`<header class="topbar"><a class="brand" href="index.html"><span class="brandmark">✚</span><span>MEDLINGO<span class="dot">.</span><small>HEALTH COMPANION</small></span></a>
<nav>${links.map(([h,i])=>`<a href="${h}" class="${h===here?"nav-on":""}">${M.t(i)}</a>`).join("")}</nav>
<div class="topright"><select id="langSel" aria-label="Language">${LANGS.map(l=>`<option value="${l[0]}" ${l[0]===M.lang?"selected":""}>${l[1]}</option>`).join("")}</select><button id="themeToggle" class="theme" aria-label="Theme">◐</button></div></header>`;
document.getElementById("langSel").onchange=e=>{localStorage.lang=e.target.value;location.reload()};
document.getElementById("themeToggle").onclick=()=>{document.body.classList.toggle("light");localStorage.theme=document.body.classList.contains("light")?"light":"dark"};
// voice output (accent = choose a voice)
M.voices=()=>speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith(M.lang));
M.speak=(text)=>{if(!("speechSynthesis" in window))return alert("Voice output is not supported in this browser.");
  speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=M.info()[2];
  const v=speechSynthesis.getVoices().find(v=>v.name===localStorage.voice&&v.lang.toLowerCase().startsWith(M.lang))||M.voices()[0];
  if(v)u.voice=v;u.rate=parseFloat(localStorage.rate||1);speechSynthesis.speak(u)};
// voice input
M.listen=(onText,onEnd)=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){alert("Voice input needs Chrome or Edge.");return null}
  const r=new SR();r.lang=M.info()[2];r.interimResults=false;
  r.onresult=e=>onText(e.results[0][0].transcript);r.onend=onEnd;r.onerror=onEnd;r.start();return r};
// EDIT HERE: extra labels -> [Precautions, Consult a doctor if]. Same language codes as T.
const T2={
en:["Precautions","Consult a doctor if"],
hi:["सावधानियां","इन स्थितियों में डॉक्टर से मिलें"],
te:["జాగ్రత్తలు","ఈ సందర్భాల్లో వైద్యుడిని కలవండి"],
ta:["முன்னெச்சரிக்கைகள்","இவ்வாறு இருந்தால் மருத்துவரை அணுகவும்"],
kn:["ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು","ಹೀಗಿದ್ದರೆ ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಿ"],
ml:["മുൻകരുതലുകൾ","ഇങ്ങനെയെങ്കിൽ ഡോക്ടറെ കാണുക"],
bn:["সতর্কতা","এমন হলে ডাক্তার দেখান"],
mr:["खबरदारी","अशा वेळी डॉक्टरांना भेटा"],
gu:["સાવચેતીઓ","આવું થાય તો ડૉક્ટરને મળો"],
pa:["ਸਾਵਧਾਨੀਆਂ","ਅਜਿਹਾ ਹੋਵੇ ਤਾਂ ਡਾਕਟਰ ਨੂੰ ਮਿਲੋ"],
ur:["احتیاطیں","ایسی صورت میں ڈاکٹر سے ملیں"],
es:["Precauciones","Consulta a un médico si"],
fr:["Précautions","Consultez un médecin si"],
ar:["احتياطات","استشر الطبيب إذا"],
zh:["注意事项","出现以下情况请就医"]};
M.t2=i=>(T2[M.lang]||T2.en)[i];
