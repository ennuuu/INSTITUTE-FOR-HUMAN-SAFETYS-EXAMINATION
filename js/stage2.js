document.addEventListener("DOMContentLoaded", () => {
  const pages = document.querySelectorAll(".page");

  function showPage(id) {
    pages.forEach((p) => p.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
  }

  // CONTINUE + BACK buttons
  document.querySelectorAll(".start").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      if (target) {
        if (target.endsWith(".html")) {
          window.location.href = target; // go to stage3.html
        } else {
          showPage(target);
        }
      }
    });
  });

  // ARCHIVE grid items
  document.querySelectorAll(".archive-item").forEach((item) => {
    item.addEventListener("click", () => {
      const target = item.dataset.target;
      if (target) showPage(target);
    });
  });
});

// -----
let showShutdown = false;
let shutdownSound;
let blackoutStartTime;

function preload() {
  shutdownSound = loadSound(
    "assets/stage 2/power-cut.mp3",
    () => console.log("Sound loaded successfully!"),
    (error) => console.error("Error loading sound:", error)
  );
}

function setup() {
  document.addEventListener("click", startExperience);
}

function startExperience() {
  document.removeEventListener("click", startExperience);
  userStartAudio();

  setTimeout(triggerShutdown, 40000);
}

function getActiveOverlay() {
  const activePage = document.querySelector(".page:not(.hidden)");
  if (activePage) {
    return activePage.querySelector("#crt-overlay");
  }
  return null;
}

function triggerShutdown() {
  console.log("triggerShutdown() called");
  showShutdown = true;
  console.log("showShutdown is now:", showShutdown);
  blackoutStartTime = millis();

  // **NEW: Modify the opacity of the crt-overlay**
  let overlay = getActiveOverlay();
  if (overlay) {
    overlay.style.opacity = 1; // Make it black
  } else {
    console.error("crt-overlay element not found in triggerShutdown!");
  }

  if (shutdownSound && !shutdownSound.isPlaying()) {
    shutdownSound.play();
  }

  setTimeout(triggerScreenOn, 2000);
}

function triggerScreenOn() {
  console.log("triggerScreenOn() called");
  showShutdown = false;
  console.log("showShutdown is now:", showShutdown);

  // **NEW: Reset the opacity of the crt-overlay**
  let overlay = getActiveOverlay();
  if (overlay) {
    overlay.style.opacity = 0; // Make it transparent again
  } else {
    console.error("crt-overlay element not found in triggerScreenOn!");
  }

  if (shutdownSound && !shutdownSound.isPlaying()) {
    shutdownSound.play();
  }
}

function windowResized() {}
