const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatContainer = document.getElementById("chatContainer");
const startupGreeting = document.getElementById("startupGreeting");

let messages = JSON.parse(localStorage.getItem("chatHistory")) || [];

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

  if (hour < 12) {
    return morning[Math.floor(Math.random() * morning.length)];
  } else if (hour < 18) {
    return afternoon[Math.floor(Math.random() * afternoon.length)];
  } else {
    return night[Math.floor(Math.random() * night.length)];
  }
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
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function getFakeReply(message) {
  const lower = message.toLowerCase();

  if (lower.includes("hello") || lower.includes("hi")) {
    return "You came back. I was starting to get bored.";
  }

  if (lower.includes("study")) {
    return "Good. Sit down. We’re not wasting time today.";
  }

  if (lower.includes("tired")) {
    return "You always say that… but fine. One small task, then you can rest.";
  }

  if (lower.includes("missed you")) {
    return "…Don’t say things like that unless you mean it.";
  }

  return "I’m still learning you. Keep talking.";
}

// show startup greeting
startupGreeting.textContent = getStartupGreeting();

// load old messages
messages.forEach((msg) => {
  addMessage(msg.text, msg.sender, false);
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  userInput.value = "";

  // typing message
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("message", "ai");

  const typingBubble = document.createElement("div");
  typingBubble.classList.add("bubble");
  typingBubble.textContent = "...";

  typingDiv.appendChild(typingBubble);
  chatContainer.appendChild(typingDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // delay + replace typing
  setTimeout(() => {
    const reply = getFakeReply(message);
    typingDiv.remove();
    addMessage(reply, "ai");
  }, 800);
});