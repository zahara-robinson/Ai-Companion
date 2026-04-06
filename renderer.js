const { ipcRenderer } = require("electron");

const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatContainer = document.getElementById("chatContainer");
const statusText = document.getElementById("statusText");
const clearChatBtn = document.getElementById("clearChatBtn");

let messages = JSON.parse(localStorage.getItem("chatHistory")) || [];
let memoryFacts = JSON.parse(localStorage.getItem("memoryFacts")) || [];
let currentMood = "calm";
let awaitingClearConfirm = false;

function getStartupGreeting() {
  const hour = new Date().getHours();

  const morning = [
    "You’re up early… I like that.",
    "Good morning. Took you long enough.",
    "I’ve been waiting for you."
  ];

  const afternoon = [
    "Welcome back. Don’t disappear again.",
    "There you are.",
    "You’re late… but I’ll allow it."
  ];

  const night = [
    "You’re still awake?",
    "It’s quiet… I was hoping you’d come back.",
    "Late night again, huh?"
  ];

  if (hour < 12) return morning[Math.floor(Math.random() * morning.length)];
  if (hour < 18) return afternoon[Math.floor(Math.random() * afternoon.length)];
  return night[Math.floor(Math.random() * night.length)];
}

function updateMood(newMood) {
  currentMood = newMood;

  const moodStatuses = {
    calm: "Calm and present",
    focused: "Locked in",
    sleepy: "Sleepy but listening",
    annoyed: "A little irritated"
  };

  statusText.textContent = moodStatuses[currentMood] || "Calm and present";
}

function detectMood(message) {
  const lower = message.toLowerCase();

  if (
    lower.includes("study") ||
    lower.includes("work") ||
    lower.includes("focus") ||
    lower.includes("homework")
  ) {
    return "focused";
  }

  if (
    lower.includes("tired") ||
    lower.includes("sleepy") ||
    lower.includes("nap") ||
    lower.includes("rest")
  ) {
    return "sleepy";
  }

  if (
    lower.includes("shut up") ||
    lower.includes("annoying") ||
    lower.includes("leave me alone")
  ) {
    return "annoyed";
  }

  return "calm";
}

function saveChatHistory() {
  localStorage.setItem("chatHistory", JSON.stringify(messages));
}

function saveMemoryFacts() {
  localStorage.setItem("memoryFacts", JSON.stringify(memoryFacts));
}

function addMessage(text, sender, save = true) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender);

  const bubbleDiv = document.createElement("div");
  bubbleDiv.classList.add("bubble");
  bubbleDiv.textContent = text;

  messageDiv.appendChild(bubbleDiv);
  chatContainer.appendChild(messageDiv);

  if (save) {
    messages.push({ text, sender });
    saveChatHistory();
  }

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function renderStartupGreeting() {
  chatContainer.innerHTML = "";
  const greeting = getStartupGreeting();

  const wrapper = document.createElement("div");
  wrapper.classList.add("message", "ai");

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.textContent = greeting;

  wrapper.appendChild(bubble);
  chatContainer.appendChild(wrapper);
}

function loadSavedMessages() {
  messages.forEach((msg) => {
    addMessage(msg.text, msg.sender, false);
  });
}

function addMemoryFact(fact) {
  if (!fact) return;

  const cleaned = fact.trim();
  if (!cleaned) return;

  const exists = memoryFacts.some(
    (item) => item.toLowerCase() === cleaned.toLowerCase()
  );

  if (!exists) {
    memoryFacts.push(cleaned);
    saveMemoryFacts();
  }
}

async function getAIReply(userMessage) {
  const result = await ipcRenderer.invoke("airi-chat", {
    userMessage,
    chatHistory: messages,
    memoryFacts,
    mood: currentMood
  });

  return result;
}

function showTypingBubble() {
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("message", "ai");

  const typingBubble = document.createElement("div");
  typingBubble.classList.add("bubble");
  typingBubble.textContent = "...";

  typingDiv.appendChild(typingBubble);
  chatContainer.appendChild(typingDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  return typingDiv;
}

function clearAllChat() {
  localStorage.removeItem("chatHistory");
  messages = [];
  updateMood("calm");
  renderStartupGreeting();
}

renderStartupGreeting();
updateMood("calm");
loadSavedMessages();

clearChatBtn.addEventListener("click", () => {
  awaitingClearConfirm = true;
  addMessage("Are you sure? Y or N", "ai");
});

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  userInput.value = "";

  if (awaitingClearConfirm) {
    const answer = message.toLowerCase();

    if (answer === "y" || answer === "yes") {
      awaitingClearConfirm = false;
      clearAllChat();
      addMessage("Alright. I cleared it.", "ai");
      return;
    }

    if (answer === "n" || answer === "no") {
      awaitingClearConfirm = false;
      addMessage("Okay. I’ll leave everything where it is.", "ai");
      return;
    }

    addMessage("Just answer with Y or N.", "ai");
    return;
  }

  const detectedMood = detectMood(message);
  updateMood(detectedMood);

  const typingDiv = showTypingBubble();

  try {
    const result = await getAIReply(message);

    typingDiv.remove();

    if (result.memory) {
      addMemoryFact(result.memory);
    }

    addMessage(result.reply, "ai");
  } catch (error) {
    typingDiv.remove();
    addMessage("Something interrupted my thoughts.", "ai");
    console.error(error);
  }
});