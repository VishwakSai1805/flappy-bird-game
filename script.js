// BOARD SETUP
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// BIRD SETUP
let birdWidth = 34; // width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

// PIPES SETUP
let pipeArray = [];
let pipeWidth = 64; // width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// GAME PHYSICS
let velocityX = -2; // pipes' moving left speed
let velocityY = 0; // bird's jump speed
let gravity = 0.4;

let gameOver = false;
let score = 0;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); // Used for drawing on the board

    // Load bird image
    birdImg = new Image();
    birdImg.src = "./assets/flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    // Load pipe images
    topPipeImg = new Image();
    topPipeImg.src = "./assets/toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./assets/bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); // every 1.5 seconds
    document.addEventListener("keydown", moveBird);
}

// Main game loop
function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // BIRD
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); // Apply gravity, prevent bird from going off top
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    // PIPES
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; // 0.5 because there are 2 pipes (top/bottom), so it scores 1 per set
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    // Clear pipes that have gone off screen
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); // removes first element from the array
    }

    // SCORE
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);
    
    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    // Calculate a random Y position for the pipes
    // (0-1) * pipeHeight/2 -> (0-256)
    // 128 is pipeHeight/4, so the range is...
    // pipeY is from top of screen, so -128 to -384 for top pipe
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        // Jump
        velocityY = -6;

        // Reset game on jump if game is over
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    // AABB - Axis-Aligned Bounding Box collision detection
    return a.x < b.x + b.width &&   // a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   // a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  // a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    // a's bottom left corner passes b's top left corner
}