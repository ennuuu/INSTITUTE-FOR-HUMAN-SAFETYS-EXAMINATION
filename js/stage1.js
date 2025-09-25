let correctSound, wrongSound;

function preload() {
  soundFormats("mp3", "ogg");
  correctSound = loadSound("assets/stage 1/correct.mp3");
  wrongSound = loadSound("assets/stage 1/wrong.mp3");
}

function setup() {
  noCanvas(); // We don't need a canvas for this sketch
}

document.addEventListener("DOMContentLoaded", () => {
  const crt = document.querySelector(".crt");
  const pages = document.querySelectorAll(".page");

  function showPage(id) {
    pages.forEach((p) => p.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
  }

  // CONTINUE buttons
  document.querySelectorAll(".start").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      if (target) showPage(target);
    });
  });

  // CHOICES (global delegation)
  document.querySelectorAll(".choices").forEach((choiceContainer) => {
    let locked = false;

    choiceContainer.addEventListener(
      "click",
      (e) => {
        const choice = e.target.closest(".choice");
        if (!choice || locked) return;

        locked = true;
        choiceContainer.classList.add("locked");
        choiceContainer.style.pointerEvents = "none";

        // reset blink
        crt.classList.remove("correct-blink", "wrong-blink");
        void crt.offsetWidth;

        // pick blink depending on answer
        if (choice.dataset.answer === "correct") {
          crt.classList.add("correct-blink");
          correctSound.play(); // Play correct sound
        } else {
          crt.classList.add("wrong-blink");
          wrongSound.play(); // Play wrong sound
        }

        // move to next page / Stage 2
        setTimeout(() => {
          const currentPage = choice.closest(".page");
          const nextPage = currentPage.nextElementSibling;

          if (nextPage && nextPage.classList.contains("page")) {
            showPage(nextPage.id);
          } else {
            window.location.href = "stage2.html";
          }
        }, 1200);
      },
      { capture: true }
    );
  });
});
