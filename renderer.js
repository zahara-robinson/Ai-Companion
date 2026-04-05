const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatContainer = document.getElementById("chatContainer");
const startupGreeting = document.getElementById("startupGreeting");

function getStartupGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning. I was wondering when you’d open me.";
  } else if (hour < 18) {
    return "Welcome back. I’m awake now.";
  } else {
    return "There you are. Cozy evening, huh?";
  }
}

function addMessage(text, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender);

  const bubbleDiv = document.createElement("div");
  bubbleDiv.classList.add("bubble");
  bubbleDiv.textContent = text;

  messageDiv.appendChild(bubbleDiv);
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function getFakeReply(message) {
  const lower = message.toLowerCase();

  if (lower.includes("hello") || lower.includes("hi")) {
    return "Hello. You have my attention now.";
  }

  if (lower.includes("study")) {
    return "Then let’s lock in. Tell me what we’re focusing on.";
  }

  if (lower.includes("tired")) {
    return "Then we do something small, not nothing.";
  }

  return "I’m still in my early form, but I’m listening.";
}

startupGreeting.textContent = getStartupGreeting();

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  userInput.value = "";

  setTimeout(() => {
    addMessage(getFakeReply(message), "ai");
  }, 500);
});