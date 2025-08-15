function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  console.log("Sending message:", message);

  if (message === "") return;

  addMessage("You: " + message, "user");
  input.value = "";

  fetch("/search?query=" + encodeURIComponent(message))
    .then((res) => res.json())
    .then((data) => {
      if (data.results && data.results.length > 0) {
        const lines = data.results
          .map((r, i) => `${i + 1}. <a href="${r.link}" target="_blank">${r.title}</a>`)
          .join("<br>");
        addMessage("Bot:<br>" + lines, "bot");
      } else {
        addMessage("Bot: No results found.", "bot");
      }
    })
    .catch((err) => {
      addMessage("Bot: Error getting response.", "bot");
      console.error(err);
    });
}

function addMessage(text, cls) {
  const chatBox = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.className = "message " + cls;
  div.innerHTML = text; // Use innerHTML to render <a> and <br>
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 🎤 Voice input with animation and listening UI
function startVoice() {
  const micBtn = document.getElementById("mic-btn");
  const listeningIndicator = document.getElementById("listening-indicator");

  if (!('webkitSpeechRecognition' in window)) {
    alert("Speech recognition not supported");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.start();

  // UI: animate and show listening
  micBtn.style.animation = "pulse 1s infinite";
  listeningIndicator.style.display = "block";

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("user-input").value = transcript;
    stopVoiceUI();
    sendMessage();
  };

  recognition.onerror = function (event) {
    alert("Speech recognition error: " + event.error);
    stopVoiceUI();
  };

  recognition.onend = function () {
    stopVoiceUI();
  };

  function stopVoiceUI() {
    micBtn.style.animation = "";
    listeningIndicator.style.display = "none";
  }
}
