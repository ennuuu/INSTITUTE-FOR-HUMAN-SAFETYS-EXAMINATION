document.addEventListener("DOMContentLoaded", () => {
  const pages = document.querySelectorAll(".page");

  function showPage(id) {
    pages.forEach((p) => p.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
  }

  // CONTINUE buttons
  document.querySelectorAll(".start[data-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      if (target.endsWith(".html")) {
        window.location.href = target;
      } else {
        showPage(target);
      }
    });
  });

  // Webcam logic
  const yesBtn = document.getElementById("yes-camera");
  const noBtn = document.getElementById("no-camera");
  const video = document.getElementById("webcam");
  let streamRef = null;

  yesBtn.addEventListener("click", async () => {
    try {
      streamRef = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = streamRef;
      showPage("stage3-camera");
    } catch (err) {
      showPage("stage3-denied");
    }
  });

  noBtn.addEventListener("click", () => {
    showPage("stage3-denied");
  });
});

// p5.js
let faceMesh;
let predictions = [];

function setup() {
  const canvas = createCanvas(640, 480);
  canvas.parent("p5-canvas");

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  frameRate(10);

  faceMesh = new FaceMesh({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
  });
  faceMesh.setOptions({ maxNumFaces: 1 });
  faceMesh.onResults(onResults);

  const cam = new Camera(video.elt, {
    onFrame: async () => {
      await faceMesh.send({ image: video.elt });
    },
    width: 640,
    height: 480,
  });
  cam.start();
}

function applyVHS() {
  loadPixels();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let i = (y * width + x) * 4;

      // --- 1. Low analog resolution (downscale + blocky look)
      if (x % 3 === 0) {
        // horizontal resolution loss
        pixels[i] = pixels[i - 4] || pixels[i];
        pixels[i + 1] = pixels[i - 3] || pixels[i + 1];
        pixels[i + 2] = pixels[i - 2] || pixels[i + 2];
      }

      // --- 2. Add analog noise (grain)
      let noiseStrength = 30; // higher = noisier
      pixels[i] = constrain(
        pixels[i] + random(-noiseStrength, noiseStrength),
        0,
        255
      );
      pixels[i + 1] = constrain(
        pixels[i + 1] + random(-noiseStrength, noiseStrength),
        0,
        255
      );
      pixels[i + 2] = constrain(
        pixels[i + 2] + random(-noiseStrength, noiseStrength),
        0,
        255
      );

      // --- 3. Poor color reproduction (desaturation)
      let avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
      pixels[i] = lerp(pixels[i], avg, 0.4); // wash out colors
      pixels[i + 1] = lerp(pixels[i + 1], avg, 0.4);
      pixels[i + 2] = lerp(pixels[i + 2], avg, 0.4);
    }
  }
  updatePixels();

  // --- 4. VHS distortion stripes (horizontal lines + glitch)
  noStroke();
  for (let i = 0; i < 5; i++) {
    let y = int(random(height));
    fill(255, random(50, 100)); // light gray flicker stripe
    rect(0, y, width, 2);
  }

  // --- 5. Occasional RGB offset glitch
  if (random() < 0.02) {
    let glitchY = int(random(height));
    let glitchH = int(random(10, 40));
    let imgSlice = get(0, glitchY, width, glitchH);
    tint(255, 0, 0, 150); // red tint
    image(imgSlice, random(-10, 10), glitchY);
    noTint();
  }
}

function draw() {
  if (video.elt.readyState >= 2) {
    faceMesh.send({ image: video.elt });
  }
  // --- FLIPPED SECTION (video + tracking) ---
  push();
  translate(width, 0); // move to right edge
  scale(-1, 1); // flip X axis

  // Video feed
  image(video, 0, 0, width, height);
  applyVHS();

  // Apply monochrome effect
  let baseR = 15; // from #0f0fff
  let baseG = 15;
  let baseB = 255;

  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    let r = pixels[i];
    let g = pixels[i + 1];
    let b = pixels[i + 2];
    let gray = (r + g + b) / 3;

    // optional threshold for dither effect
    if (gray > 150) {
      // adjust 0–255 for harshness
      gray = 255;
    } else {
      gray = 50; // darker band, not pure black
    }

    // scale neon color by gray brightness
    let factor = gray / 255.0;
    pixels[i] = baseR * factor;
    pixels[i + 1] = baseG * factor;
    pixels[i + 2] = baseB * factor;
  }
  updatePixels();

  // Landmarks
  noFill();
  stroke(0, 255, 0);
  strokeWeight(1);

  predictions.forEach((face) => {
    checkMovement(face);

    face.forEach((pt) => {
      let x = pt.x * width;
      let y = pt.y * height;

      if (status === "CLONE") {
        x += random(-5, 5);
        y += random(-5, 5);
      }
      ellipse(x, y, 2, 2);
    });
  });

  pop(); // ✅ end flip (text/UI will not be flipped)

  // --- CLONE EFFECTS ---
  if (status === "CLONE") {
    // 1. Distort slices of face (glitch filter)
    for (let i = 0; i < 15; i++) {
      let sx = int(random(width));
      let sy = int(random(height));
      let sw = int(random(40, 120));
      let sh = int(random(30, 80));
      let imgSlice = get(sx, sy, sw, sh);
      image(imgSlice, sx + random(-40, 40), sy + random(-40, 40));
    }

    // 2. Red flicker overlay
    noStroke();
    fill(255, 0, 0, random(80, 180));
    rect(0, 0, width, height);

    // 3. Big warning text (steady, #ff2b2b)
    push();
    textAlign(CENTER, CENTER);
    textSize(60);
    fill("#ff2b2b");
    textStyle(BOLD);
    text("CLONE DETECTED", width / 2, height / 2);
    pop();
  } else {
    // HUMAN status subtle text (✅ stays unflipped)
    noStroke();
    fill(0, 255, 0);
    textSize(16);
    text("HUMAN DETECTED", 20, height - 20);
  }
}

function connectPoints(face, i1, i2) {
  line(
    face[i1].x * width,
    face[i1].y * height,
    face[i2].x * width,
    face[i2].y * height
  );
}

function onResults(results) {
  predictions = results.multiFaceLandmarks || [];
}

// --- Movement Detection ---
let lastPos = null;
let lastMoveTime = Date.now();
let status = "HUMAN"; // default state

function checkMovement(face) {
  // use nose tip landmark (index 1) as anchor
  const nose = face[1];
  const x = nose.x * width;
  const y = nose.y * height;

  if (lastPos) {
    const dx = x - lastPos.x;
    const dy = y - lastPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // 👇 bigger threshold (ignore micro movements / noise)
    if (dist > 8) {
      lastMoveTime = Date.now();
      status = "HUMAN";
    }
  }
  lastPos = { x, y };

  // check how long since last real movement
  const elapsed = (Date.now() - lastMoveTime) / 1000;
  if (elapsed >= 10) {
    status = "CLONE";
  }
}
