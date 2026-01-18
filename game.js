const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const hpText = document.getElementById("hp");
const waveText = document.getElementById("wave");
const scoreText = document.getElementById("score");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const overlayBtn = document.getElementById("overlay-btn");

const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");
const shootBtn = document.getElementById("shootBtn");
const pauseBtn = document.getElementById("pause");

let width, height;
let dt = 0;
let last = 0;

let gameState = "running"; // running, paused, wave, gameover

let player = {
  x: 0,
  y: 0,
  size: 28,
  speed: 5,
  hp: 100,
  dmg: 1,
  fireRate: 10,
};

let bullets = [];
let enemies = [];
let wave = 1;
let score = 0;

let shootTimer = 0;
let joystickDir = { x: 0, y: 0 };
let joystickActive = false;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  player.x = width / 2;
  player.y = height - 90;
}

window.addEventListener("resize", resize);
resize();

function spawnWave() {
  enemies = [];
  for (let i = 0; i < wave * 4; i++) {
    enemies.push(createEnemy());
  }
}

function createEnemy() {
  const type = Math.random() < 0.15 ? "fast" : Math.random() < 0.15 ? "tank" : "normal";

  if (type === "fast") {
    return {
      x: Math.random() * width,
      y: -Math.random() * 200,
      size: 18,
      speed: 2.2 + wave * 0.1,
      hp: 1,
      color: "orange",
    };
  }

  if (type === "tank") {
    return {
      x: Math.random() * width,
      y: -Math.random() * 200,
      size: 34,
      speed: 1 + wave * 0.05,
      hp: 3 + Math.floor(wave / 3),
      color: "purple",
    };
  }

  return {
    x: Math.random() * width,
    y: -Math.random() * 200,
    size: 24,
    speed: 1.5 + wave * 0.1,
    hp: 1 + Math.floor(wave / 4),
    color: "red",
  };
}

function update(delta) {
  if (gameState !== "running") return;

  // move player
  player.x += joystickDir.x * player.speed;
  player.y += joystickDir.y * player.speed;

  // clamp
  player.x = Math.max(20, Math.min(width - 20, player.x));
  player.y = Math.max(60, Math.min(height - 60, player.y));

  // auto shoot
  shootTimer++;
  if (shootTimer >= player.fireRate) {
    bullets.push({ x: player.x, y: player.y - 20, speed: 10, dmg: player.dmg });
    shootTimer = 0;
  }

  // bullets update
  bullets = bullets.filter(b => b.y > -20);
  bullets.forEach(b => b.y -= b.speed);

  // enemies update
  enemies.forEach((e, i) => {
    e.y += e.speed;

    // enemy hits player
    if (Math.abs(e.x - player.x) < (e.size + player.size) / 2 && Math.abs(e.y - player.y) < (e.size + player.size) / 2) {
      enemies.splice(i, 1);
      player.hp -= e.size > 25 ? 20 : 10;
    }

    // bullets hit enemy
    bullets.forEach((b, bi) => {
      if (Math.abs(e.x - b.x) < (e.size + 6) / 2 && Math.abs(e.y - b.y) < (e.size + 6) / 2) {
        e.hp -= b.dmg;
        bullets.splice(bi, 1);

        if (e.hp <= 0) {
          enemies.splice(i, 1);
          score += 10;
        }
      }
    });
  });

  // wave complete
  if (enemies.length === 0) {
    gameState = "wave";
    overlayTitle.textContent = "Wave Complete!";
    overlayText.textContent = "Pick an upgrade.";
    overlay.classList.remove("hidden");
  }

  if (player.hp <= 0) {
    gameState = "gameover";
    overlayTitle.textContent = "GAME OVER";
    overlayText.textContent = `Score: ${score}`;
    overlayBtn.textContent = "Restart";
    overlay.classList.remove("hidden");
  }

  hpText.textContent = `HP: ${player.hp}`;
  waveText.textContent = `Wave: ${wave}`;
  scoreText.textContent = `Score: ${score}`;
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  // player
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size / 2, 0, Math.PI * 2);
  ctx.fill();

  // bullets
  ctx.fillStyle = "cyan";
  bullets.forEach(b => ctx.fillRect(b.x - 3, b.y - 10, 6, 12));

  // enemies
  enemies.forEach(e => {
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size / 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function loop(timestamp) {
  dt = timestamp - last;
  last = timestamp;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

function reset() {
  player.hp = 100;
  player.dmg = 1;
  player.speed = 5;
  player.fireRate = 10;
  wave = 1;
  score = 0;
  bullets = [];
  spawnWave();
  gameState = "running";
  overlay.classList.add("hidden");
}

function nextWave() {
  wave++;
  spawnWave();
  gameState = "running";
  overlay.classList.add("hidden");
}

// pause
pauseBtn.addEventListener("click", () => {
  if (gameState === "running") {
    gameState = "paused";
    overlayTitle.textContent = "Paused";
    overlayText.textContent = "Tap continue to resume.";
    overlayBtn.textContent = "Continue";
    overlay.classList.remove("hidden");
  } else if (gameState === "paused") {
    gameState = "running";
    overlay.classList.add("hidden");
  }
});

// upgrades
overlayBtn.addEventListener("click", () => {
  if (gameState === "gameover") {
    reset();
    return;
  }

  if (gameState === "paused") {
    gameState = "running";
    overlay.classList.add("hidden");
    return;
  }

  // choose upgrade
  // random upgrade
  const choice = Math.floor(Math.random() * 3);
  if (choice === 0) player.dmg += 1;
  if (choice === 1) player.speed += 1;
  if (choice === 2) player.hp = Math.min(100, player.hp + 25);

  nextWave();
});

// joystick
let startX, startY;

joystick.addEventListener("touchstart", (e) => {
  joystickActive = true;
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

joystick.addEventListener("touchmove", (e) => {
  if (!joystickActive) return;
  const x = e.touches[0].clientX;
  const y = e.touches[0].clientY;

  const dx = x - startX;
  const dy = y - startY;

  const dist = Math.min(50, Math.hypot(dx, dy));
  const angle = Math.atan2(dy, dx);

  stick.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;

  joystickDir.x = Math.cos(angle) * (dist / 50);
  joystickDir.y = Math.sin(angle) * (dist / 50);
});

joystick.addEventListener("touchend", () => {
  joystickActive = false;
  joystickDir = { x: 0, y: 0 };
  stick.style.transform = `translate(0px, 0px)`;
});
