const { ipcRenderer } = require("electron");

const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatContainer = document.getElementById("chatContainer");
const statusText = document.getElementById("statusText");
const clearChatBtn = document.getElementById("clearChatBtn");

let messages = JSON.parse(localStorage.getItem("chatHistory")) || [];
let memoryFacts = JSON.parse(localStorage.getItem("memoryFacts")) || [];
let currentMood = localStorage.getItem("airiMood") || "neutral";
let awaitingClearConfirm = false;
let idleTimer = null;

function getLastSeenTime() {
  return localStorage.getItem("lastSeenTime");
}

function setLastSeenTime() {
  localStorage.setItem("lastSeenTime", Date.now().toString());
}

function saveMood() {
  localStorage.setItem("airiMood", currentMood);
}

function getHour() {
  return new Date().getHours();
}

function isLateNight() {
  const hour = getHour();
  return hour >= 23 || hour < 5;
}

function getReturnGreeting() {
  const lastSeen = getLastSeenTime();
  const now = Date.now();

  if (!lastSeen) {
    if (isLateNight()) return "you're opening me this late?";
    return "mm. so this is where you left me.";
  }

  const diffMinutes = Math.floor((now - parseInt(lastSeen, 10)) / 60000);

  if (isLateNight() && diffMinutes > 30) {
    return "it's late. why are you back up?";
  }

  if (diffMinutes < 5) {
    return "you came right back?";
  }

  if (diffMinutes < 60) {
    return "there you are.";
  }

  if (diffMinutes < 300) {
    return "you were gone for a while.";
  }

  if (diffMinutes < 720) {
    return "finally. I was getting bored.";
  }

  if (diffMinutes < 1440) {
    return "wow. took you long enough.";
  }

  return "you really left me here that long?";
}

function updateMood(newMood) {
  currentMood = newMood;
  saveMood();

  const moodStatuses = {
    neutral: "Just here",
    calm: "Quiet for now",
    happy: "In a good mood",
    sad: "A little down",
    mad: "Annoyed",
    sleepy: "Sleepy",
    focused: "Locked in",
    clingy: "Wants attention",
    playful: "Feeling cheeky"
  };

  statusText.textContent = moodStatuses[currentMood] || "Just here";
}

function detectMood(message) {
  const lower = message.toLowerCase();

  if (
    lower.includes("study") ||
    lower.includes("work") ||
    lower.includes("focus") ||
    lower.includes("homework") ||
    lower.includes("code")
  ) {
    return "focused";
  }

  if (
    lower.includes("tired") ||
    lower.includes("sleepy") ||
    lower.includes("nap") ||
    lower.includes("rest") ||
    lower.includes("goodnight")
  ) {
    return "sleepy";
  }

  if (
    lower.includes("leave me alone") ||
    lower.includes("shut up") ||
    lower.includes("annoying") ||
    lower.includes("stop")
  ) {
    return "mad";
  }

  if (
    lower.includes("happy") ||
    lower.includes("yay") ||
    lower.includes("excited") ||
    lower.includes("good news")
  ) {
    return "happy";
  }

  if (
    lower.includes("sad") ||
    lower.includes("cry") ||
    lower.includes("upset") ||
    lower.includes("depressed")
  ) {
    return "sad";
  }

  if (
    lower.includes("missed you") ||
    lower.includes("come here") ||
    lower.includes("stay with me")
  ) {
    return "clingy";
  }

  if (
    lower.includes("hehe") ||
    lower.includes("lol") ||
    lower.includes("lmao") ||
    lower.includes("brat")
  ) {
    return "playful";
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

  const labelDiv = document.createElement("div");
  labelDiv.classList.add("message-label");
  labelDiv.textContent = sender === "user" ? "Me" : "Airi";

  const bubbleDiv = document.createElement("div");
  bubbleDiv.classList.add("bubble");
  bubbleDiv.textContent = text;

  messageDiv.appendChild(labelDiv);
  messageDiv.appendChild(bubbleDiv);
  chatContainer.appendChild(messageDiv);

  if (save) {
    messages.push({ text, sender, timestamp: new Date().toISOString() });
    saveChatHistory();
  }

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function renderStartupGreeting() {
  chatContainer.innerHTML = "";

  const greeting = getReturnGreeting();

  const wrapper = document.createElement("div");
  wrapper.classList.add("message", "ai");

  const labelDiv = document.createElement("div");
  labelDiv.classList.add("message-label");
  labelDiv.textContent = "Airi";

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.textContent = greeting;

  wrapper.appendChild(labelDiv);
  wrapper.appendChild(bubble);
  chatContainer.appendChild(wrapper);

  setLastSeenTime();
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
    mood: currentMood,
    currentTime: new Date().toLocaleString()
  });

  return result;
}

function showTypingBubble() {
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("message", "ai");

  const labelDiv = document.createElement("div");
  labelDiv.classList.add("message-label");
  labelDiv.textContent = "Airi";

  const typingBubble = document.createElement("div");
  typingBubble.classList.add("bubble");

  const options = ["...", "mm...", "wait.", "hold on."];
  typingBubble.textContent = options[Math.floor(Math.random() * options.length)];

  typingDiv.appendChild(labelDiv);
  typingDiv.appendChild(typingBubble);
  chatContainer.appendChild(typingDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  return typingDiv;
}

function clearAllChat() {
  localStorage.removeItem("chatHistory");
  messages = [];
  renderStartupGreeting();
}

function getIdleLine() {
  const hour = getHour();

  const byMood = {
    neutral: [
      "you got quiet.",
      "so... now what?",
      "you're just staring at me now?"
    ],
    calm: [
      "you got quiet.",
      "mm. okay.",
      "you're thinking too hard again."
    ],
    happy: [
      "you're in a better mood now. I can tell.",
      "so are we doing something fun or what?"
    ],
    sad: [
      "...you okay?",
      "you went quiet on me.",
      "don't drift off too far."
    ],
    mad: [
      "still sulking?",
      "are we done being dramatic?",
      "you got real quiet all of a sudden."
    ],
    sleepy: [
      "you're fading again.",
      "go to sleep if you're that tired.",
      "mm. you sound exhausted."
    ],
    focused: [
      "don't lose the plot now.",
      "stay with it.",
      "you were working. what happened?"
    ],
    clingy: [
      "you gonna talk to me or just keep me open?",
      "wow. clingy and quiet. interesting."
    ],
    playful: [
      "you're too quiet. I don't trust it.",
      "what are you plotting now?"
    ]
  };

  let pool = byMood[currentMood] || byMood.neutral;

  if (hour >= 23 || hour < 5) {
    pool = [
      "it's late, you know.",
      "why are you still up?",
      "mm. this is getting into bad decisions hours."
    ];
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

function resetIdleTimer() {
  if (idleTimer) clearTimeout(idleTimer);

  idleTimer = setTimeout(() => {
    addMessage(getIdleLine(), "ai");
  }, 180000);
}

renderStartupGreeting();
updateMood(currentMood);
loadSavedMessages();
resetIdleTimer();

clearChatBtn.addEventListener("click", () => {
  awaitingClearConfirm = true;
  addMessage("are you sure? y or n", "ai");
  resetIdleTimer();
});

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  userInput.value = "";
  resetIdleTimer();

  if (awaitingClearConfirm) {
    const answer = message.toLowerCase();

    if (answer === "y" || answer === "yes") {
      awaitingClearConfirm = false;
      clearAllChat();
      addMessage("fine. it's gone.", "ai");
      return;
    }

    if (answer === "n" || answer === "no") {
      awaitingClearConfirm = false;
      addMessage("okay. leaving it alone.", "ai");
      return;
    }

    addMessage("just say y or n.", "ai");
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
    setLastSeenTime();
    resetIdleTimer();
  } catch (error) {
    typingDiv.remove();
    addMessage("...okay, something broke.", "ai");
    console.error(error);
  }
});

window.addEventListener("beforeunload", () => {
  setLastSeenTime();
});

document.addEventListener("click", resetIdleTimer);
document.addEventListener("keydown", resetIdleTimer);