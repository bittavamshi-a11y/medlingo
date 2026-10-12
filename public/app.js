const input = document.getElementById("symptomInput");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");

function addMessage(text, role) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;
  if (role === "assistant") {
    const avatar = document.createElement("span");
    avatar.className = "miniavatar";
    avatar.textContent = "✚";
    wrapper.appendChild(avatar);
  }
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  const p = document.createElement("p");
  p.textContent = text;
  bubble.appendChild(p);
  wrapper.appendChild(bubble);
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
}

function showResult(data) {
  document.getElementById("emptyResult").classList.add("hidden");
  document.getElementById("resultContent").classList.remove("hidden");
  document.getElementById("resultCategory").textContent = data.category;
  document.getElementById("resultSpecialist").textContent = data.specialist;
  document.getElementById("resultMessage").textContent = data.message;
  document.getElementById("resultDisclaimer").textContent = data.disclaimer;
  document.querySelector(".summary").classList.toggle("urgent", Boolean(data.urgent));
}

async function submitSymptom() {
  const symptom = input.value.trim();
  if (!symptom) { input.focus(); return; }
  addMessage(symptom, "user");
  input.value = "";
  sendBtn.disabled = true;
  sendBtn.innerHTML = "Working…";
  try {
    const response = await fetch("/api/symptoms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptom })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed.");
    addMessage(`${data.category}. ${data.message} Suggested professional: ${data.specialist}`, "assistant");
    showResult(data);
  } catch (error) {
    console.error(error);
    addMessage("I couldn't reach the server. Check that MEDLINGO is running, then try again.", "assistant");
  } finally {
    sendBtn.disabled = false;
    sendBtn.innerHTML = 'Get guidance <span>↗</span>';
  }
}

sendBtn.addEventListener("click", submitSymptom);
input.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    submitSymptom();
  }
});
document.querySelectorAll("[data-example]").forEach(button => {
  button.addEventListener("click", () => { input.value = button.dataset.example; input.focus(); });
});
document.getElementById("themeToggle").addEventListener("click", () => document.body.classList.toggle("light"));
