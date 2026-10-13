// EDIT HERE: languages -> [code, name shown in dropdown, speech locale]. Add a row here AND in T and T2 below.
const LANGS=[["en","English","en-IN"],["hi","हिन्दी","hi-IN"],["te","తెలుగు","te-IN"],["ta","தமிழ்","ta-IN"],["kn","ಕನ್ನಡ","kn-IN"],["ml","മലയാളം","ml-IN"],["bn","বাংলা","bn-IN"],["mr","मराठी","mr-IN"],["gu","ગુજરાતી","gu-IN"],["pa","ਪੰਜਾਬੀ","pa-IN"],["ur","اردو","ur-PK"],["es","Español","es-ES"],["fr","Français","fr-FR"],["ar","العربية","ar-SA"],["zh","中文","zh-CN"]];
const RTL=["ar","ur"]; // EDIT HERE: languages that switch to right-to-left
// EDIT HERE: UI text. Index: 0 Home,1 Assistant,2 Doctors,3 About,4 Placeholder,5 Get guidance,6 Consult,7 What you can do,8 Listen,9 Emergency alert,10 Disclaimer
const T={
en:["Home","Assistant","Doctors","About","Describe your symptom...","Get guidance","Consult","What you can do","Listen","Possible emergency — call 112 now","Educational only, not a diagnosis. For severe or worsening symptoms, get urgent medical care."],
hi:["होम","सहायक","डॉक्टर","परिचय","अपना लक्षण बताएं...","सलाह पाएं","परामर्श लें","आप क्या कर सकते हैं","सुनें","संभावित आपात स्थिति — अभी 112 पर कॉल करें","केवल शैक्षिक जानकारी, निदान नहीं। गंभीर या बढ़ते लक्षणों में तुरंत चिकित्सा सहायता लें।"],
te:["హోమ్","సహాయకుడు","వైద్యులు","గురించి","మీ లక్షణాన్ని వివరించండి...","సలహా పొందండి","సంప్రదించండి","మీరు ఏమి చేయవచ్చు","వినండి","అత్యవసర పరిస్థితి కావచ్చు — వెంటనే 112కు కాల్ చేయండి","ఇది విద్యా ప్రయోజనం కోసం మాత్రమే, రోగ నిర్ధారణ కాదు. తీవ్రమైన లేదా పెరుగుతున్న లక్షణాలకు వెంటనే వైద్య సహాయం పొందండి."],
ta:["முகப்பு","உதவியாளர்","மருத்துவர்கள்","பற்றி","உங்கள் அறிகுறியை விவரிக்கவும்...","வழிகாட்டல் பெறுங்கள்","அணுகவும்","நீங்கள் செய்யக்கூடியவை","கேளுங்கள்","அவசரநிலையாக இருக்கலாம் — உடனே 112ஐ அழைக்கவும்","கல்வி நோக்கத்திற்கு மட்டும்; நோயறிதல் அல்ல. கடுமையான அல்லது அதிகரிக்கும் அறிகுறிகளுக்கு உடனடியாக மருத்துவ உதவி பெறுங்கள்."],
kn:["ಮುಖಪುಟ","ಸಹಾಯಕ","ವೈದ್ಯರು","ಬಗ್ಗೆ","ನಿಮ್ಮ ಲಕ್ಷಣವನ್ನು ವಿವರಿಸಿ...","ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ","ಸಂಪರ್ಕಿಸಿ","ನೀವು ಏನು ಮಾಡಬಹುದು","ಆಲಿಸಿ","ತುರ್ತು ಪರಿಸ್ಥಿತಿ ಇರಬಹುದು — ಈಗಲೇ 112ಗೆ ಕರೆ ಮಾಡಿ","ಇದು ಶೈಕ್ಷಣಿಕ ಮಾಹಿತಿ ಮಾತ್ರ, ರೋಗನಿರ್ಣಯವಲ್ಲ. ತೀವ್ರ ಅಥವಾ ಹೆಚ್ಚುತ್ತಿರುವ ಲಕ್ಷಣಗಳಿಗೆ ತಕ್ಷಣ ವೈದ್ಯಕೀಯ ಸಹಾಯ ಪಡೆಯಿರಿ."],
ml:["ഹോം","സഹായി","ഡോക്ടർമാർ","കുറിച്ച്","നിങ്ങളുടെ ലക്ഷണം വിവരിക്കുക...","മാർഗനിർദേശം നേടുക","സമീപിക്കുക","നിങ്ങൾക്ക് ചെയ്യാവുന്നത്","കേൾക്കുക","അടിയന്തര സാഹചര്യമാകാം — ഉടൻ 112 വിളിക്കുക","വിദ്യാഭ്യാസ ആവശ്യത്തിന് മാത്രം, രോഗനിർണയമല്ല. ഗുരുതരമോ വഷളാകുന്നതോ ആയ ലക്ഷണങ്ങൾക്ക് ഉടൻ വൈദ്യസഹായം തേടുക."],
bn:["হোম","সহকারী","ডাক্তার","সম্পর্কে","আপনার উপসর্গ বর্ণনা করুন...","পরামর্শ নিন","পরামর্শ করুন","আপনি কী করতে পারেন","শুনুন","জরুরি অবস্থা হতে পারে — এখনই 112 নম্বরে কল করুন","শুধু শিক্ষামূলক, রোগ নির্ণয় নয়। গুরুতর বা বাড়তে থাকা উপসর্গে দ্রুত চিকিৎসা নিন।"],
mr:["मुख्यपृष्ठ","सहाय्यक","डॉक्टर","माहिती","तुमचे लक्षण सांगा...","मार्गदर्शन मिळवा","सल्ला घ्या","तुम्ही काय करू शकता","ऐका","आणीबाणीची शक्यता — लगेच 112 वर कॉल करा","फक्त शैक्षणिक माहिती, निदान नाही. गंभीर किंवा वाढत्या लक्षणांसाठी त्वरित वैद्यकीय मदत घ्या."],
gu:["હોમ","સહાયક","ડૉક્ટરો","વિશે","તમારું લક્ષણ જણાવો...","માર્ગદર્શન મેળવો","સલાહ લો","તમે શું કરી શકો","સાંભળો","કટોકટી હોઈ શકે — હમણાં જ 112 પર કૉલ કરો","ફક્ત શૈક્ષણિક માહિતી, નિદાન નથી. ગંભીર અથવા વધતા લક્ષણો માટે તરત તબીબી સહાય લો."],
pa:["ਹੋਮ","ਸਹਾਇਕ","ਡਾਕਟਰ","ਬਾਰੇ","ਆਪਣਾ ਲੱਛਣ ਦੱਸੋ...","ਸਲਾਹ ਲਓ","ਸਲਾਹ ਕਰੋ","ਤੁਸੀਂ ਕੀ ਕਰ ਸਕਦੇ ਹੋ","ਸੁਣੋ","ਸੰਭਾਵੀ ਐਮਰਜੈਂਸੀ — ਹੁਣੇ 112 'ਤੇ ਕਾਲ ਕਰੋ","ਸਿਰਫ਼ ਵਿੱਦਿਅਕ ਜਾਣਕਾਰੀ, ਨਿਦਾਨ ਨਹੀਂ। ਗੰਭੀਰ ਜਾਂ ਵਧਦੇ ਲੱਛਣਾਂ ਲਈ ਤੁਰੰਤ ਡਾਕਟਰੀ ਮਦਦ ਲਓ।"],
ur:["ہوم","معاون","ڈاکٹر","تعارف","اپنی علامت بیان کریں...","رہنمائی حاصل کریں","مشورہ کریں","آپ کیا کر سکتے ہیں","سنیں","ممکنہ ہنگامی صورتحال — ابھی 112 پر کال کریں","صرف تعلیمی معلومات، تشخیص نہیں۔ شدید یا بڑھتی علامات میں فوری طبی مدد لیں۔"],
es:["Inicio","Asistente","Médicos","Acerca de","Describe tu síntoma...","Obtener orientación","Consultar","Qué puedes hacer","Escuchar","Posible emergencia: llama al 112 ahora","Solo educativo, no es un diagnóstico. Ante síntomas graves o que empeoran, busca atención médica urgente."],
fr:["Accueil","Assistant","Médecins","À propos","Décrivez votre symptôme...","Obtenir des conseils","Consulter","Ce que vous pouvez faire","Écouter","Urgence possible : appelez le 112 maintenant","À titre éducatif uniquement, pas un diagnostic. En cas de symptômes graves ou qui s'aggravent, consultez en urgence."],
ar:["الرئيسية","المساعد","الأطباء","حول","صف أعراضك...","احصل على إرشاد","استشر","ما يمكنك فعله","استمع","حالة طوارئ محتملة — اتصل بـ 112 الآن","لأغراض تعليمية فقط وليس تشخيصًا. في حال الأعراض الشديدة أو المتفاقمة اطلب رعاية طبية عاجلة."],
zh:["首页","助手","医生","关于","描述您的症状...","获取指导","咨询","您可以怎么做","朗读","可能是紧急情况——请立即拨打 112","仅供教育参考，不构成诊断。症状严重或加重时请尽快就医。"]};
// EDIT HERE: extra labels. Index: 0 Precautions,1 Consult a doctor if,2 Input language,3 Translate to,4 Auto detect,5 Call,6 Consult online,7 Doctors to contact,8 Helplines
const T2={
en:["Precautions","Consult a doctor if","Input language","Translate to","Auto detect","Call","Consult online","Doctors to contact","Helplines"],
hi:["सावधानियां","इन स्थितियों में डॉक्टर से मिलें","इनपुट भाषा","अनुवाद की भाषा","स्वतः पहचानें","कॉल करें","ऑनलाइन परामर्श","संपर्क के लिए डॉक्टर","हेल्पलाइन"],
te:["జాగ్రత్తలు","ఈ సందర్భాల్లో వైద్యుడిని కలవండి","ఇన్‌పుట్ భాష","అనువాద భాష","ఆటో గుర్తింపు","కాల్ చేయండి","ఆన్‌లైన్ సంప్రదింపు","సంప్రదించాల్సిన వైద్యులు","హెల్ప్‌లైన్లు"],
ta:["முன்னெச்சரிக்கைகள்","இவ்வாறு இருந்தால் மருத்துவரை அணுகவும்","உள்ளீட்டு மொழி","மொழிபெயர்ப்பு மொழி","தானாக கண்டறி","அழைக்கவும்","ஆன்லைன் ஆலோசனை","தொடர்பு கொள்ள வேண்டிய மருத்துவர்கள்","உதவி எண்கள்"],
kn:["ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು","ಹೀಗಿದ್ದರೆ ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಿ","ಇನ್‌ಪುಟ್ ಭಾಷೆ","ಅನುವಾದ ಭಾಷೆ","ಸ್ವಯಂ ಪತ್ತೆ","ಕರೆ ಮಾಡಿ","ಆನ್‌ಲೈನ್ ಸಮಾಲೋಚನೆ","ಸಂಪರ್ಕಿಸಬೇಕಾದ ವೈದ್ಯರು","ಸಹಾಯವಾಣಿಗಳು"],
ml:["മുൻകരുതലുകൾ","ഇങ്ങനെയെങ്കിൽ ഡോക്ടറെ കാണുക","ഇൻപുട്ട് ഭാഷ","വിവർത്തന ഭാഷ","സ്വയം കണ്ടെത്തുക","വിളിക്കുക","ഓൺലൈൻ കൺസൾട്ടേഷൻ","ബന്ധപ്പെടാവുന്ന ഡോക്ടർമാർ","ഹെൽപ്പ്‌ലൈനുകൾ"],
bn:["সতর্কতা","এমন হলে ডাক্তার দেখান","ইনপুট ভাষা","অনুবাদের ভাষা","স্বয়ংক্রিয় শনাক্তকরণ","কল করুন","অনলাইন পরামর্শ","যোগাযোগের জন্য ডাক্তার","হেল্পলাইন"],
mr:["खबरदारी","अशा वेळी डॉक्टरांना भेटा","इनपुट भाषा","भाषांतर भाषा","आपोआप ओळखा","कॉल करा","ऑनलाइन सल्ला","संपर्कासाठी डॉक्टर","हेल्पलाइन"],
gu:["સાવચેતીઓ","આવું થાય તો ડૉક્ટરને મળો","ઇનપુટ ભાષા","અનુવાદ ભાષા","આપોઆપ ઓળખો","કૉલ કરો","ઑનલાઇન સલાહ","સંપર્ક માટે ડૉક્ટરો","હેલ્પલાઇન"],
pa:["ਸਾਵਧਾਨੀਆਂ","ਅਜਿਹਾ ਹੋਵੇ ਤਾਂ ਡਾਕਟਰ ਨੂੰ ਮਿਲੋ","ਇਨਪੁੱਟ ਭਾਸ਼ਾ","ਅਨੁਵਾਦ ਭਾਸ਼ਾ","ਆਪਣੇ-ਆਪ ਪਛਾਣੋ","ਕਾਲ ਕਰੋ","ਔਨਲਾਈਨ ਸਲਾਹ","ਸੰਪਰਕ ਲਈ ਡਾਕਟਰ","ਹੈਲਪਲਾਈਨ"],
ur:["احتیاطیں","ایسی صورت میں ڈاکٹر سے ملیں","ان پٹ زبان","ترجمے کی زبان","خود بخود شناخت","کال کریں","آن لائن مشورہ","رابطے کے لیے ڈاکٹر","ہیلپ لائنز"],
es:["Precauciones","Consulta a un médico si","Idioma de entrada","Traducir a","Detección automática","Llamar","Consulta en línea","Médicos de contacto","Líneas de ayuda"],
fr:["Précautions","Consultez un médecin si","Langue d'entrée","Traduire en","Détection auto","Appeler","Consultation en ligne","Médecins à contacter","Numéros d'aide"],
ar:["احتياطات","استشر الطبيب إذا","لغة الإدخال","الترجمة إلى","كشف تلقائي","اتصل","استشارة عبر الإنترنت","أطباء للتواصل","خطوط المساعدة"],
zh:["注意事项","出现以下情况请就医","输入语言","翻译为","自动检测","拨打","在线咨询","可联系的医生","求助热线"]};

const M={lang:localStorage.lang||"en"};
if(!T[M.lang])M.lang="en";
M.info=()=>LANGS.find(l=>l[0]===M.lang);
M.infoOf=c=>LANGS.find(l=>l[0]===c)||LANGS[0];
M.t=i=>T[M.lang][i];
M.t2=i=>(T2[M.lang]||T2.en)[i];
// Assistant languages: input (what the user speaks/types, or "auto") and output (language of the answer + voice)
M.inLang=localStorage.inLang||M.lang;if(M.inLang!=="auto"&&!T[M.inLang])M.inLang=M.lang;
M.outLang=localStorage.outLang||M.lang;if(!T[M.outLang])M.outLang=M.lang;
M.setIn=c=>{M.inLang=c;localStorage.inLang=c};
M.setOut=c=>{M.outLang=c;localStorage.outLang=c};
M.to=i=>T[M.outLang][i];            // label in the ANSWER language
M.to2=i=>(T2[M.outLang]||T2.en)[i];
M.nameOf=c=>c==="auto"?"auto-detect":M.infoOf(c)[1]+" ("+c+")";

document.documentElement.lang=M.lang;
document.documentElement.dir=RTL.includes(M.lang)?"rtl":"ltr";
if(localStorage.theme==="light")document.body.classList.add("light");

// shared header (logo, nav, language dropdown, theme toggle)
const here=location.pathname.split("/").pop()||"index.html";
const links=[["index.html",0],["assistant.html",1],["doctors.html",2],["about.html",3]]; // EDIT HERE: nav links [file, label index]
document.getElementById("hdr").innerHTML=`<header class="topbar"><a class="brand" href="index.html"><span class="brandmark">✚</span><span>MEDLINGO<span class="dot">.</span><small>HEALTH COMPANION</small></span></a>
<nav>${links.map(([h,i])=>`<a href="${h}" class="${h===here?"nav-on":""}">${M.t(i)}</a>`).join("")}</nav>
<div class="topright"><select id="langSel" aria-label="Language">${LANGS.map(l=>`<option value="${l[0]}" ${l[0]===M.lang?"selected":""}>${l[1]}</option>`).join("")}</select><button id="themeToggle" class="theme" aria-label="Theme">◐</button></div></header>`;
document.getElementById("langSel").onchange=e=>{const v=e.target.value;localStorage.lang=v;localStorage.inLang=v;localStorage.outLang=v;location.reload()};
document.getElementById("themeToggle").onclick=()=>{document.body.classList.toggle("light");localStorage.theme=document.body.classList.contains("light")?"light":"dark"};

// voice output: voices for the ANSWER language (accent = choose a voice)
M.voices=(c=M.outLang)=>("speechSynthesis" in window)?speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith(c)):[];
// cb = {onStart, onBoundary(charIndex), onEnd}
M.speak=(text,cb={})=>{if(!("speechSynthesis" in window))return alert("Voice output is not supported in this browser.");
  speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=M.infoOf(M.outLang)[2];
  const v=speechSynthesis.getVoices().find(v=>v.name===localStorage.voice&&v.lang.toLowerCase().startsWith(M.outLang))||M.voices()[0];
  if(v)u.voice=v;u.rate=parseFloat(localStorage.rate||1);
  u.onstart=()=>cb.onStart&&cb.onStart();
  u.onboundary=e=>cb.onBoundary&&cb.onBoundary(e.charIndex);
  u.onend=u.onerror=()=>cb.onEnd&&cb.onEnd();
  speechSynthesis.speak(u)};
M.stop=()=>{if("speechSynthesis" in window)speechSynthesis.cancel()};

// voice input: recognises in the INPUT language (UI language when input is "auto")
M.listen=(onText,onEnd)=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){alert("Voice input needs Chrome or Edge.");return null}
  const r=new SR();r.lang=M.infoOf(M.inLang==="auto"?M.lang:M.inLang)[2];r.interimResults=false;
  r.onresult=e=>onText(e.results[0][0].transcript);r.onend=onEnd;r.onerror=onEnd;r.start();return r};


// Translate static page copy into the selected site language. Header controls already use
// the built-in dictionaries above. Text is cached per language to avoid repeated API calls.
(async function translatePageCopy(){
  if(M.lang==="en" || !document.body) return;
  const excluded="script,style,noscript,textarea,input,select,option,svg,#hdr,[contenteditable=true]";
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{
    acceptNode(node){
      const p=node.parentElement;
      if(!p || p.closest(excluded) || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      if(node.nodeValue.trim().length<2) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  const unique=[...new Set(nodes.map(n=>n.nodeValue.trim()))].slice(0,120);
  if(!unique.length)return;
  const cacheKey="medlingo-page-copy-v1-"+M.lang;
  let translated={};
  try{translated=JSON.parse(localStorage.getItem(cacheKey)||"{}")}catch{}
  const missing=unique.filter(s=>!translated[s]);
  if(missing.length){
    try{
      const response=await fetch("/api/translate",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({texts:missing,target:M.infoOf(M.lang)[1]})});
      if(!response.ok)return;
      const data=await response.json();
      if(data.translations && Array.isArray(data.translations)){
        missing.forEach((s,i)=>{if(data.translations[i])translated[s]=data.translations[i]});
        try{localStorage.setItem(cacheKey,JSON.stringify(translated))}catch{}
      }
    }catch(err){console.warn("Page translation unavailable:",err)}
  }
  nodes.forEach(n=>{const original=n.nodeValue.trim();if(translated[original])n.nodeValue=n.nodeValue.replace(original,translated[original])});
})();
