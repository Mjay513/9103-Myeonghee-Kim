// ===============================================
// The Scream - User Input Interaction
// Author: Mjay (Myeonghee) Kim
// Description: Basic class structure that moves a face
//              using keyboard input (W, A, S, D / Arrows).
// ===============================================

// Main class that controls the face movement and drawing
class FaceGame {
  constructor() {
    // Start position near the middle of the screen
    this.x = width * 0.5;
    this.y = height * 0.65;

    // Initial speed (x and y direction)
    this.vx = 0;
    this.vy = 0;

    // Basic face size
    this.size = 45;
  }

  // Update face position according to user input
  update() {
    let ax = 0, ay = 0;
    const accel = 0.4; // movement acceleration

    // Move left or right (A or LEFT_ARROW / D or RIGHT_ARROW)
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) ax -= accel;
    if (keyIsDown(RIGHT_ARROW)|| keyIsDown(68)) ax += accel;

    // Move up or down (W or UP_ARROW / S or DOWN_ARROW)
    if (keyIsDown(UP_ARROW)   || keyIsDown(87)) ay -= accel;
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) ay += accel;

    // Add acceleration to velocity (basic motion logic)
    this.vx += ax; 
    this.vy += ay;

    // Apply the new position, keeping it inside the canvas
    this.x = constrain(this.x + this.vx, 0, width);
    this.y = constrain(this.y + this.vy, 0, height);
  }

  // Draw the moving face on top of the main sketch
  overlayDraw() {
    drawFace(this.x, this.y, this.size, 0); // charge=0 (static face, no color change)
  }
}

// Global variable for the face game
let game = null;

// Initialize user input system
function initUserInput() {
  game = new FaceGame();
}

// Called repeatedly to update and draw the overlay
function overlayDraw() {
  if (!game) return;
  game.update();
  game.overlayDraw();
}

// Function to draw a simple "Scream" face
function drawFace(x, y, s, charge) {
  // Head base color
  fill(255, 220, 180);
  noStroke();
  ellipse(x, y, s, s * 1.25); // head shape

  // Outline
  stroke(50);
  noFill();
  strokeWeight(2.5);
  ellipse(x, y, s * 1.02, s * 1.27);

  // Eyes
  noStroke();
  fill(0);
  ellipse(x - s * 0.18, y - s * 0.15, s * 0.18, s * 0.26);
  ellipse(x + s * 0.18, y - s * 0.15, s * 0.18, s * 0.26);

  // Mouth (simple version, no dynamic charge yet)
  fill(255, 140, 0);
  ellipse(x, y + s * 0.18, s * 0.28, s * 0.25);
}