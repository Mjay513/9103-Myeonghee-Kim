// ===============================================
// The Scream - Interactive User Input (v0.2)
// Author: Mjay (Myeonghee) Kim
// Description: Adds mouse-based charging and simple
//              shockwave effects to the moving face.
// ===============================================

class FaceGame {
  constructor(){
    this.reset();          // call reset at start
    this.size = 80;        // face size (enlarged for visibility)
  }

  // Reset all values (used when restarting the scene)
  reset(){
    this.x = width * 0.5;  // starting X position (center)
    this.y = height * 0.65;// starting Y position (slightly lower)
    this.vx = 0;           // velocity X
    this.vy = 0;           // velocity Y
    this.charge = 0;       // charge level (0 to 1)
    this.charging = false; // charging state (true while holding mouse)
    this.waves = [];       // list of shockwave circles
  }

  // Update movement, charge, and waves every frame
  update(){
    // --- 1. Movement (keyboard control) ---
    let ax = 0, ay = 0; 
    const accel = 0.45; // acceleration strength

    // Move using Arrow keys or WASD
    if (keyIsDown(LEFT_ARROW)  || keyIsDown(65)) ax -= accel; // A or ←
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) ax += accel; // D or →
    if (keyIsDown(UP_ARROW)    || keyIsDown(87)) ay -= accel; // W or ↑
    if (keyIsDown(DOWN_ARROW)  || keyIsDown(83)) ay += accel; // S or ↓

    // Add acceleration and apply simple friction
    this.vx = (this.vx + ax) * 0.9;
    this.vy = (this.vy + ay) * 0.9;

    // Limit maximum speed (prevents flying off too fast)
    const maxSp = 5.5;
    const sp = sqrt(this.vx * this.vx + this.vy * this.vy);
    if (sp > maxSp){
      this.vx = (this.vx / sp) * maxSp;
      this.vy = (this.vy / sp) * maxSp;
    }

    // Apply movement and keep face inside canvas area
    this.x = constrain(this.x + this.vx, 0, width);
    this.y = constrain(this.y + this.vy, 0, height);

    // --- 2. Charge system (mouse press builds energy) ---
    if (this.charging) {
      this.charge = min(1, this.charge + 0.015); // slowly increase charge
    } else {
      this.charge = max(0, this.charge - 0.02);  // slowly decrease charge
    }

    // --- 3. Shockwave update (circles fade out) ---
    for (let i = this.waves.length - 1; i >= 0; i--) {
      const w = this.waves[i];
      w.r += 10 + w.power * 20; // grow in size
      w.alpha -= 5;             // fade over time
      if (w.alpha <= 0) this.waves.splice(i, 1); // remove invisible waves
    }
  }

  // Create a new shockwave when the mouse is released
  addWave(x, y){
    this.waves.push({
      x: x,
      y: y,
      r: 10,
      alpha: 200,
      power: this.charge  // store the current charge strength
    });
  }

  // Draw all visual elements (waves + face)
  overlayDraw(){
    // Draw all current waves (expanding circles)
    for (const w of this.waves){
      noFill();
      stroke(255, 150, 0, w.alpha);
      strokeWeight(3);
      circle(w.x, w.y, w.r * 2);
    }

    // Draw the main face with its charge-based color
    drawFace(this.x, this.y, this.size, this.charge);
  }
}

// Global variable to store the face game instance
let game = null;

// Initialize user input and create a new face
function initUserInput(){
  game = new FaceGame();
}

// Continuously update and draw the overlay
function overlayDraw(){
  if (!game) return;
  game.update();
  game.overlayDraw();
}

// Mouse interaction events
function mousePressed(){
  if (game) game.charging = true; // start charging when pressed
}
function mouseReleased(){
  if (game){
    game.charging = false;        // stop charging
    game.addWave(mouseX, mouseY); // release energy as wave
  }
}

// -----------------------------------------------
// Draw the expressive face based on charge level
// -----------------------------------------------
function drawFace(x, y, s, charge){
  // Face and mouth colors change with charge
  const faceCol  = lerpColor(color(255,220,180), color(255,90,60), charge);
  const mouthCol = lerpColor(color(255,140,0),   color(120,0,80),  charge);
  const eyeCol   = color(0);

  // Draw head
  noStroke();
  fill(faceCol);
  ellipse(x, y, s, s * 1.25);

  // Draw outline
  noFill();
  stroke(50, 30, 30);
  strokeWeight(2.5);
  ellipse(x, y, s * 1.02, s * 1.27);

  // Eyes
  noStroke();
  fill(eyeCol);
  ellipse(x - s * 0.18, y - s * 0.15, s * 0.18, s * 0.26);
  ellipse(x + s * 0.18, y - s * 0.15, s * 0.18, s * 0.26);

  // Mouth reacts to charge (gets taller when energy increases)
  fill(mouthCol);
  const mouthH = map(charge, 0, 1, s * 0.25, s * 0.55);
  ellipse(x, y + s * 0.18, s * 0.28, mouthH);
}