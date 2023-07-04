let audioContext;

try {
  audioContext =
    new (window.AudioContext || window.webkitAudioContext)();
} catch (error) {
  window.alert(
    `Sorry, but your browser doesn't support the Web Audio API!`
  );
}

if (audioContext !== undefined) {
  console.log("audioContext created");
  
  const oscillator = audioContext.createOscillator();
  oscillator.connect(audioContext.destination);
  oscillator.start();
}

function startContext() {
  console.log("test")
  oscillator.start();
}

btn.addEventListener("click", startContext);