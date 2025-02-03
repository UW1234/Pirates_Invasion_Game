const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;

var engine, world, backgroundImg;
var canvas, angle, tower, ground, cannon;
var balls = [];
var boats = [];
var level = 1; 
var boatsDestroyed = 0; 
var gameOver = false; 
var lastShotTime = 0; 
var cooldown = 500; 
var gameWon = false; 

function preload() {
  backgroundImg = loadImage("./assets/background.gif");
  towerImage = loadImage("./assets/tower.png");
}

function setup() {
  canvas = createCanvas(1200, 600);
  engine = Engine.create();
  world = engine.world;
  angleMode(DEGREES);
  angle = 15;

  ground = Bodies.rectangle(0, height - 1, width * 2, 1, { isStatic: true });
  World.add(world, ground);

  tower = Bodies.rectangle(160, 350, 160, 310, { isStatic: true });
  World.add(world, tower);

  cannon = new Cannon(180, 110, 130, 100, angle);
}

function draw() {
  background(189);
  image(backgroundImg, 0, 0, width, height);

  if (gameOver) {
    fill(0);
    stroke(255);
    strokeWeight(4);
    ellipse(width / 2, height / 2, 300, 150);
    fill(255);
    noStroke();
    textSize(24);
    textAlign(CENTER, CENTER);
    text("Game Over", width / 2, height / 2 - 20);
    textSize(16);
    text("Click to Restart", width / 2, height / 2 + 20);
    return; 
  }

  if (gameWon) {
    fill(0);
    stroke(255);
    strokeWeight(4);
    ellipse(width / 2, height / 2, 400, 200);
    fill(255);
    noStroke();
    textSize(32);
    textAlign(CENTER, CENTER);
    text("You Win!", width / 2, height / 2 - 30);
    textSize(20);
    text("Congratulations!", width / 2, height / 2 + 20);
    return; 
  }

  Engine.update(engine);

  rect(ground.position.x, ground.position.y, width * 2, 1);

  push();
  imageMode(CENTER);
  image(towerImage, tower.position.x, tower.position.y, 160, 310);
  pop();

  for (var i = balls.length - 1; i >= 0; i--) {
    balls[i].display();

    // Remove cannonball if it touches the ocean
    if (balls[i].body.position.y >= height - 50) {
      World.remove(world, balls[i].body);
      balls.splice(i, 1);
      continue;
    }

    for (var j = boats.length - 1; j >= 0; j--) {
      if (balls[i] && boats[j] && Matter.SAT.collides(balls[i].body, boats[j].body).collided) {
        World.remove(world, balls[i].body);
        balls.splice(i, 1);

        // Remove the boat
        World.remove(world, boats[j].body);
        boats.splice(j, 1);

        // Increment boats destroyed
        boatsDestroyed++;

        // Check if the player should progress to higher levels
        if (boatsDestroyed >= 3 && level === 1) {
          level = 2; // Transition to Level 2
        } else if (boatsDestroyed >= 9 && level === 2) {
          level = 3; // Transition to Level 3
        } else if (boatsDestroyed >= 15 && level === 3) {
          level = 4; // Transition to Level 4
        } else if (boatsDestroyed >= 18 && level === 4) {
          level = 5; // Transition to Level 5
        } else if (boatsDestroyed >= 21 && level === 5) {
          level = 6; // Transition to Level 6
        } else if (boatsDestroyed >= 24 && level === 6) {
          gameWon = true; // Player has won the game
        }

        break; 
      }
    }
  }

  // Check for collisions between boats and the tower
  for (var i = 0; i < boats.length; i++) {
    if (boats[i] && Matter.SAT.collides(boats[i].body, tower).collided) {
      gameOver = true; // Set game over state
    }
  }

  cannon.display();
  showBoats();

  fill(0); 
  textSize(24);
  text("Level: " + level, 50, 40); 
}

function keyPressed() {
  if (keyCode === 32 && millis() - lastShotTime > cooldown) { 
    var cannonBall = new CannonBall(cannon.x, cannon.y);
    cannonBall.trajectory = [];
    Matter.Body.setAngle(cannonBall.body, cannon.angle);
    balls.push(cannonBall);
    lastShotTime = millis(); 
  }
}

function showCannonBalls(ball) {
  if (ball) {
    ball.display();
  }
}

function keyReleased() {
  if (keyCode === 32) { 
    balls[balls.length - 1].shoot();
  }
}

function showBoats() {
  if (boats.length === 0) {
    // Create the first boat
    var boat = new Boat(width, height - 60, 150, 150, -60);
    boats.push(boat);
  }

  // Adjust boat spawning based on the level
  var spawnDistance;
  if (level === 1) {
    spawnDistance = 300; // Level 1
  } else if (level === 2) {
    spawnDistance = 250; // Level 2
  } else if (level === 3) {
    spawnDistance = 200; // Level 3
  } else if (level === 4) {
    spawnDistance = 150; // Level 4
  } else if (level === 5) {
    spawnDistance = 100; // Level 5
  } else if (level === 6) {
    spawnDistance = 50; // Level 6
  }

  if (
    boats[boats.length - 1] === undefined ||
    boats[boats.length - 1].body.position.x < width - spawnDistance
  ) {
    var positions = [-40, -60, -70, -20];
    var position = random(positions);
    var boat = new Boat(width, height - 100, 150, 150, position); 
    boats.push(boat);
  }

  for (var i = 0; i < boats.length; i++) {
    if (boats[i]) {
      // Adjust boat velocity based on the level
      var velocityX = -2.0 - (level - 1) * 0.5; // Consistent increase of +0.5 per level
      Matter.Body.setVelocity(boats[i].body, {
        x: velocityX,
        y: 0
      });

      boats[i].display();
    }
  }
}
// Restart the game when the player clicks the "Game Over" message
function mousePressed() {
  if (gameOver || gameWon) {
    var d = dist(mouseX, mouseY, width / 2, height / 2);
    if (d < 150) { 
      // Restart the game
      level = 1;
      boatsDestroyed = 0;
      boats = [];
      balls = [];
      gameOver = false;
      gameWon = false;
      Engine.clear(engine); 
      setup(); // Reinitialize the game
    }
  }
}


