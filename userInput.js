// ======================================================
// The Scream - Final Interactive Overlay
// Author: Mjay (Myeonghee) Kim
// Description:
// - Keyboard controls move a stylised "scream" face.
// - Mouse press charges emotion; mouse release emits a shockwave.
// - Background tint and subtle face jitter reflect the charge level.
// - On-screen help overlay explains controls.
// Note: This file is designed to run alongside the existing group sketch.
//       It should be loaded AFTER sketch.js without modifying group code.
// ======================================================

// Class to manage face state, movement, charging, waves, and help UI
class FaceGame {
  constructor() {
    this.reset();          // Initialize position, velocity, charge, waves
    this.size = 80;        // Default face size for visibility
    this.showHelp = true;  // Show the help overlay on start
  }

  // Reset the whole simulation to a known state
  reset() {
    // Initial face position (center-ish horizontally, lower vertically)
    this.x = width * 0.5;
    this.y = height * 0.65;

    // Initial velocity (px/frame).
    // These non-zero values make the face start drifting immediately.
    this.vx = -5;
    this.vy = -65;

    // Charge system (0..1). Increases while mouse is pressed.
    this.charge = 0;
    this.charging = false;

    // Shockwaves emitted on mouse release (array of ring objects)
    // Each wave: { x, y, r, alpha, power }
    this.waves = [];
  }

  // Update the simulation each frame (movement, charge, waves)
  update() {
    this.updateMovement();
    this.updateCharge();
    this.updateWaves();
  }

  // --- Movement: keyboard-driven acceleration with friction and speed cap
  updateMovement() {
    let ax = 0, ay = 0;

    // Hold Shift to accelerate more quickly (feels like a "sprint")
    const accel = keyIsDown(SHIFT) ? 0.9 : 0.45;

    // Horizontal input (A / D or Left / Right)
    if (keyIsDown(LEFT_ARROW)  || keyIsDown(65)) ax -= accel; // 65 = 'A'
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) ax += accel; // 68 = 'D'

    // Vertical input (W / S or Up / Down)
    if (keyIsDown(UP_ARROW)    || keyIsDown(87)) ay -= accel; // 87 = 'W'
    if (keyIsDown(DOWN_ARROW)  || keyIsDown(83)) ay += accel; // 83 = 'S'

    // Integrate acceleration and apply simple friction (0.9)
    this.vx = (this.vx + ax) * 0.9;
    this.vy = (this.vy + ay) * 0.9;

    // Clamp maximum speed (higher cap when Shift is held)
    const maxSp = keyIsDown(SHIFT) ? 8 : 5.5;
    const sp = sqrt(this.vx * this.vx + this.vy * this.vy);
    if (sp > maxSp) {
      this.vx = (this.vx / sp) * maxSp;
      this.vy = (this.vy / sp) * maxSp;
    }

    // Move the face and keep it inside the canvas bounds
    this.x = constrain(this.x + this.vx, 0, width);
    this.y = constrain(this.y + this.vy, 0, height);
  }

  // --- Charge: increases while mouse is down, decays when released
  updateCharge() {
    if (this.charging) {
      // Build up emotion slowly (cap at 1.0)
      this.charge = min(1, this.charge + 0.015);
    } else {
      // Calm down gradually when not charging
      this.charge = max(0, this.charge - 0.02);
    }
  }

  // Create a new shockwave ring at the given position
  addWave(x, y) {
    this.waves.push({
      x: x,
      y: y,
      r: 10,           // initial radius
      alpha: 200,      // initial visibility (fades to 0)
      power: this.charge // snapshot of charge at release time
    });
  }

  // --- Waves: expand outward and fade away; remove when invisible
  updateWaves() {
    for (let i = this.waves.length - 1; i >= 0; i--) {
      let w = this.waves[i];
      w.r     += 10 + w.power * 20; // stronger charge → faster expansion
      w.alpha -= 4 + w.power * 2;   // stronger charge → faster fade
      if (w.alpha <= 0) this.waves.splice(i, 1);
    }
  }

  // Draw everything this overlay is responsible for
  overlayDraw() {
    // 1) Background tint blends from cool to warm with charge
    const bg = lerpColor(color(30, 30, 60), color(255, 80, 60), this.charge);
    fill(red(bg), green(bg), blue(bg), 50);
    noStroke();
    rect(0, 0, width, height);

    // 2) Shockwaves (orange rings)
    for (const w of this.waves) {
      noFill();
      stroke(255, 150, 0, w.alpha);
      strokeWeight(3);
      circle(w.x, w.y, w.r * 2);
    }

    // 3) Face reacts to charge (colour + jitter + mouth height)
    drawFace(this.x, this.y, this.size, this.charge);

    // 4) Help overlay (toggle with 'H')
    if (this.showHelp) {
      fill(0, 150);
      noStroke();
      rect(10, height - 84, 340, 74, 8);
      fill(255);
      textSize(12);
      textAlign(LEFT, TOP);
      textStyle(BOLD);
      text("The Scream", 16, height - 80); // title
      textStyle(NORMAL);
      text(
        "\nHold Mouse: Charge | Release: Shockwave\n" +
        "W/A/S/D or Arrows: Move | Shift: Speed Boost\n" +
        "H: Toggle Help | R: Reset",
        16, height - 70
      );
    }
  }
}

// Global game object (created by initUserInput, called from group sketch)
let game = null;

// Called once from sketch.js setup() to start this overlay
function initUserInput() {
  game = new FaceGame();
}

// Called from sketch.js draw() each frame to update and render overlay
function overlayDraw() {
  if (!game) return;
  game.update();
  game.overlayDraw();
}

// Mouse events: press to charge, release to emit a wave at cursor
function mousePressed()  { if (game) game.charging = true; }
function mouseReleased() {
  if (game) {
    game.charging = false;
    game.addWave(mouseX, mouseY);
  }
}

// Keyboard events: toggle help, reset all state quickly
function keyPressed() {
  if (!game) return;
  if (key === 'h' || key === 'H') game.showHelp = !game.showHelp;
  if (key === 'r' || key === 'R') game.reset();
}

// ------------------------------------------------------
// drawFace: draws the stylised “scream” face
// - Colour changes with charge (calm → warm)
// - Mouth grows taller with charge (more “scream”)
// - Small jitter makes it feel alive at higher charge
// ------------------------------------------------------
function drawFace(x, y, s, charge) {
  // Colours interpolate with charge
  const faceCol  = lerpColor(color(255, 220, 180), color(255, 90, 60), charge);
  const mouthCol = lerpColor(color(255, 140, 0),   color(120, 0, 80),  charge);
  const eyeCol   = lerpColor(color(0, 0, 0),       color(255, 230, 180), charge);

  // Subtle oscillation based on charge (emotional jitter)
  const wob = 1 + charge * 4;
  const jx  = sin(frameCount * 0.3)  * wob;
  const jy  = cos(frameCount * 0.29) * wob;

  // Head
  noStroke();
  fill(faceCol);
  ellipse(x + jx, y + jy, s, s * 1.25);

  // Outline
  noFill();
  stroke(50, 30, 30);
  strokeWeight(2.5);
  ellipse(x + jx, y + jy, s * 1.02, s * 1.27);

  // Eyes
  noStroke();
  fill(eyeCol);
  ellipse(x - s * 0.18 + jx * 0.3, y - s * 0.15 + jy * 0.3, s * 0.18, s * 0.26);
  ellipse(x + s * 0.18 + jx * 0.3, y - s * 0.15 + jy * 0.3, s * 0.18, s * 0.26);

  // Mouth: taller = louder scream (maps 0..1 to small..large)
  fill(mouthCol);
  const mouthH = map(charge, 0, 1, s * 0.25, s * 0.55);
  ellipse(x + jx * 0.2, y + s * 0.18 + jy * 0.2, s * 0.28, mouthH);
}