// ===============================================
// The Scream - Interactive Prototype (v0.3)
// Author: Mjay (Myeonghee) Kim
// Description:
// This version adds background tint, face jitter,
// and a simple help overlay on screen.
// ===============================================

class FaceGame {
  constructor() {
    this.reset();          // reset all values at start
    this.size = 80;        // face size
    this.showHelp = true;  // show help text by default
  }

  // Reset all movement and animation variables
  reset() {
    this.x = width * 0.5;  // start position X (middle)
    this.y = height * 0.65;// start position Y (lower area)
    this.vx = 0;           // velocity X
    this.vy = 0;           // velocity Y
    this.charge = 0;       // charge level (0~1)
    this.charging = false; // mouse hold state
    this.waves = [];       // store expanding wave data
  }

  // Update movement, charge, and waves each frame
  update() {
    // --- 1. Movement (keyboard) ---
    let ax = 0, ay = 0;
    const accel = 0.45; // how quickly it accelerates

    // Move with arrow keys or WASD
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) ax -= accel; // A / ←
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) ax += accel; // D / →
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) ay -= accel; // W / ↑
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) ay += accel; // S / ↓

    // Add acceleration and slow down slightly (friction)
    this.vx = (this.vx + ax) * 0.9;
    this.vy = (this.vy + ay) * 0.9;

    // Limit max speed so it doesn’t move too fast
    const maxSp = 5.5;
    const sp = sqrt(this.vx * this.vx + this.vy * this.vy);
    if (sp > maxSp) {
      this.vx = (this.vx / sp) * maxSp;
      this.vy = (this.vy / sp) * maxSp;
    }

    // Apply the movement and keep inside canvas
    this.x = constrain(this.x + this.vx, 0, width);
    this.y = constrain(this.y + this.vy, 0, height);

    // --- 2. Charging (mouse hold) ---
    // When holding the mouse, increase charge; when released, decrease
    this.charge = this.charging
      ? min(1, this.charge + 0.015)
      : max(0, this.charge - 0.02);

    // --- 3. Shockwaves ---
    // Each wave grows and fades over time
    for (let i = this.waves.length - 1; i >= 0; i--) {
      const w = this.waves[i];
      w.r += 10 + w.power * 20;      // expand radius
      w.alpha -= 4 + w.power * 2;    // fade out slowly
      if (w.alpha <= 0) this.waves.splice(i, 1); // remove when invisible
    }
  }

  // Add a new wave when the mouse is released
  addWave(x, y) {
    this.waves.push({
      x: x,
      y: y,
      r: 10,
      alpha: 200,
      power: this.charge
    });
  }

  // Draw everything (background tint, waves, face, help text)
  overlayDraw() {
    // --- Background tint changes with emotion level ---
    const bg = lerpColor(color(30, 30, 60), color(255, 80, 60), this.charge);
    fill(red(bg), green(bg), blue(bg), 50);
    noStroke();
    rect(0, 0, width, height);

    // --- Shockwaves ---
    for (const w of this.waves) {
      noFill();
      stroke(255, 150, 0, w.alpha);
      strokeWeight(3);
      circle(w.x, w.y, w.r * 2);
    }

    // --- Draw the face with small jitter motion ---
    drawFace(this.x, this.y, this.size, this.charge, true);

    // --- Help text overlay ---
    if (this.showHelp) {
      fill(0, 150);
      noStroke();
      rect(10, height - 84, 340, 74, 8);
      fill(255);
      textSize(12);
      textAlign(LEFT, TOP);
      textStyle(BOLD);
      text("The Scream", 16, height - 80);
      textStyle(NORMAL);
      text(
        "\nHold Mouse: Charge | Release: Shockwave\n" +
        "W/A/S/D or Arrows: Move\nH: Toggle Help | R: Reset",
        16, height - 70
      );
    }
  }
}

// Create a new instance of the game
let game = null;
function initUserInput() { game = new FaceGame(); }

// Main overlay loop
function overlayDraw() {
  if (!game) return;
  game.update();
  game.overlayDraw();
}

// Mouse controls
function mousePressed() { if (game) game.charging = true; }
function mouseReleased() {
  if (game) {
    game.charging = false;
    game.addWave(mouseX, mouseY);
  }
}

// Keyboard controls
function keyPressed() {
  if (!game) return;
  if (key === 'h' || key === 'H') game.showHelp = !game.showHelp;
  if (key === 'r' || key === 'R') game.reset();
}

// ----------------------------------------------------
// Draw the face (with optional jitter for emotion)
// ----------------------------------------------------
function drawFace(x, y, s, charge, withJitter) {
  // Color changes depending on charge level
  const faceCol  = lerpColor(color(255, 220, 180), color(255, 90, 60), charge);
  const mouthCol = lerpColor(color(255, 140, 0),   color(120, 0, 80), charge);
  const eyeCol   = lerpColor(color(0, 0, 0),       color(255, 230, 180), charge);

  // Small random motion to make it feel alive
  const wob = withJitter ? (1 + charge * 4) : 0;
  const jx = withJitter ? sin(frameCount * 0.3) * wob : 0;
  const jy = withJitter ? cos(frameCount * 0.29) * wob : 0;

  // Draw the head
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

  // Mouth expands as the charge increases
  fill(mouthCol);
  const mh = map(charge, 0, 1, s * 0.25, s * 0.55);
  ellipse(x + jx * 0.2, y + s * 0.18 + jy * 0.2, s * 0.28, mh);
}