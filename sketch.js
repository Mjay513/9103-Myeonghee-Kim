let video;
let segmenter;
let segmentation;
let bgImg;  
let isModelReady = false;

function preload() {
  // Load background image (you can replace with your own path)
  bgImg = loadImage('assets/Edvard_Munch_The_Scream.jpeg');
}

function setup() {
  // Create canvas
    createCanvas(480, 600);

  // Added to connect individual interaction code (userInput.js) with the group sketch. 
  // This enables the face character and user input system to be initialised when setup() runs.
  initUserInput();

  // Create save button
  let saveBtn = createButton('💾 Save your scream');
  saveBtn.position(10, 10); // Position
  saveBtn.mousePressed(saveSnapshot);
  
  // Video settings
  let constraints = {
    video: {
      width: 100,    // Width
      height: 100    // Height
    },
    audio: false
  };

  video = createCapture(constraints);
  video.size(100, 100);
  video.hide();

  // Load UNet real-time person segmentation model
  segmenter = ml5.uNet('person', modelReady);
}

// Model callback
function modelReady() {
  console.log('✅ Model loaded!');
  isModelReady = true;
}

function draw() {
  // Background image
  background(bgImg);

  if (isModelReady) {
    segmenter.segment(video, gotResult);
  }

  if (segmentation) {
    image(segmentation.backgroundMask, 50, 200, 400, 400);
  }
  
  drawStatusText();
  applyPixelation(10);

  // Added for individual project:
  // Calls the overlay layer from userInput.js to display the interactive face,
  // shockwave effects, and user input system on top of the group project visuals.
  overlayDraw();
}

function applyPixelation(pixelSize) {
  // Create a smaller temporary canvas
  let smallGraphics = createGraphics(width / pixelSize, height / pixelSize);
  smallGraphics.noSmooth();

  // Draw the current frame onto the smaller canvas
  smallGraphics.image(get(), 0, 0, smallGraphics.width, smallGraphics.height);

  // Then scale it back up to create the pixelation effect
  noSmooth();
  image(smallGraphics, 0, 0, width, height);
  smooth();
}

// Do not modify this section
function gotResult(err, result) {
  if (err) {
    console.error(err);
    return;
  }
  segmentation = result;
}

// Screenshot function
function saveSnapshot() {
  saveCanvas('myCanvas', 'png');
}

// "I forget ddl" text style
function drawStatusText() {
  fill(255);
  textSize(80);
  textAlign(CENTER, CENTER);
  text("I forgot ddl", width / 2, height * 1 / 4);
}