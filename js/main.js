// p5
let osc, env;
let reverb;

let depressingTones = [
  311.13, // Eb4
  392.0, // G4
  415.3, // Ab4
  440.0, // A4
  450.0, // A#4
];

let currentTextElement = null;
let textToType = "";
let typedText = "";
let charIndex = 0;
let isTyping = false;
let typeTimeout;

function setup() {
  noCanvas();

  env = new p5.Envelope();
  env.setADSR(0.001, 0.1, 0, 0.15);
  env.setRange(0.25, 0);

  osc = new p5.Oscillator();
  osc.setType("square");
  osc.freq(440);
  osc.amp(env);
  osc.start();

  reverb = new p5.Reverb();
  reverb.process(osc, 2, 1);

  initializeExperience();
}

function initializeExperience() {
  document.querySelectorAll(".start[data-target]").forEach((el) => {
    el.addEventListener("click", () => {
      userStartAudio();
      const targetId = el.getAttribute("data-target");
      transitionToPage(targetId);
    });
  });

  startTyping("page-1-text");
}

function transitionToPage(pageId) {
  if (!pageId) return;

  stopTyping();

  document.querySelectorAll(".page").forEach((p) => p.classList.add("hidden"));

  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.remove("hidden");
  }

  const textElementId = pageId + "-text";
  if (document.getElementById(textElementId)) {
    startTyping(textElementId);
  }
}

function stopTyping() {
  clearTimeout(typeTimeout);
  isTyping = false;
}

function typeWriter() {
  if (!isTyping || !currentTextElement) return;

  if (charIndex < textToType.length) {
    typedText += textToType.charAt(charIndex);
    currentTextElement.innerHTML = typedText;
    charIndex++;

    osc.freq(random(depressingTones));
    env.play();

    let randomDelay = random(60, 180);
    typeTimeout = setTimeout(typeWriter, randomDelay);
  } else {
    isTyping = false;

    if (currentTextElement.id === "page-3-text") {
      setTimeout(() => {
        transitionToPage("page-4");
      }, 1500);
    }
  }
}

function startTyping(elementId) {
  stopTyping();

  if (isTyping) {
    clearTimeout(typeTimeout);
    isTyping = false;
  }

  currentTextElement = document.getElementById(elementId);
  if (!currentTextElement) {
    console.error("Element with ID '" + elementId + "' not found.");
    return;
  }

  if (!currentTextElement.dataset.originalText) {
    currentTextElement.dataset.originalText = currentTextElement.innerHTML;
  }
  textToType = currentTextElement.dataset.originalText;

  typedText = "";
  charIndex = 0;
  currentTextElement.innerHTML = "";
  isTyping = true;

  typeWriter();
}
