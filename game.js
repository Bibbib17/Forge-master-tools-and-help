const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const hpText = document.getElementById("hp");
const waveText = document.getElementById("wave");

let width, height;
let player = { x: 0, y: 0, size: 26, speed: 6, hp: 100, dmg: 1, fireRate: 12 };
let bullets = [];
let enemies = [];
let wave = 1;
let enemyTimer = 0;
let enemySpawnRate = 60;
let waveOver = false;
let gameOver = false;
let upgradeOpen = false;
let upgrades = { dmg: 0, speed: 0, hp: 0 };

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
  waveOver = false;
  enemySpawnRate = Math.max(15, 60 - wave * 3);
  for (let i = 0; i < wave * 4; i++) {
    enemies.push({
      x: Math.random() * width,
      y: -Math.random() * 200,
      size: 22 + wave * 1.2,
      speed: 1.2 + wave * 0.15,
      hp: 1 + Math.floor(wave / 3),
    });
  }
}

spawnWave();

let shootTimer = 0;

function update() {
  if (gameOver) {
    drawGameOver();
    return;
  }

  if (upgradeOpen) {
    drawUpgradeScreen();
    requestAnimationFrame(update);
    return;
  }

  // auto shoot
  shootTimer++;
  if (shootTimer >= player.fireRate) {
    bullets.push({ x: player.x, y: player.y - 20, speed: 10, dmg: player.dmg });
    shootTimer = 0;
  }

  // update bullets
  bullets.forEach((b, i) => {
    b.y -= b.speed;
    if (b.y < -10) bullets.splice(i, 1);
  });

  // update enemies
  enemies.forEach((e, i) => {
    e.y += e.speed;

    // hit player
    if (Math.abs(e.x - player.x) < (e.size + player.size) / 2 && Math.abs(e.y - player.y) < (e.size + player.size) / 2) {
      enemies.splice(i, 1);
      player.hp -= 15;
      if (player.hp <= 0) player.hp = 0;
    }

    // bullet collision
    bullets.forEach((b, bi) => {
      if (Math.abs(e.x - b.x) < (e.size + 6) / 2 && Math.abs(e.y - b.y) < (e.size + 6) / 2) {
        e.hp -= b.dmg;
        bullets.splice(bi, 1);
        if (e.hp <= 0) enemies.splice(i, 1);
      }
    });
  });

  // wave complete
  if (enemies.length === 0) {
    wave++;
    upgradeOpen = true;
    return;
  }

  if (player.hp <= 0) {
    gameOver = true;
    return;
  }

  hpText.textContent = "HP: " + player.hp;
  waveText.textContent = "Wave: " + wave;

  draw();
  requestAnimationFrame(update);
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
  bullets.forEach(b => {
    ctx.fillRect(b.x - 3, b.y - 10, 6, 12);
  });

  // enemies
  ctx.fillStyle = "red";
  enemies.forEach(e => {
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size / 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawUpgradeScreen() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "white";
  ctx.font = "32px system-ui";
  ctx.fillText("Wave Complete!", width / 2 - 140, height / 2 - 80);

  ctx.font = "24px system-ui";
  ctx.fillText("Pick one upgrade:", width / 2 - 130, height / 2 - 40);

  ctx.fillStyle = "cyan";
  ctx.fillText("1) Damage +1", width / 2 - 120, height / 2 + 10);
  ctx.fillText("2) Speed +1", width / 2 - 120, height / 2 + 50);
  ctx.fillText("3) HP +20", width / 2 - 120, height / 2 + 90);

  ctx.fillStyle = "white";
  ctx.fillText("Tap the screen to choose", width / 2 - 160, height / 2 + 150);
}

function drawGameOver() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "white";
  ctx.font = "48px system-ui";
  ctx.fillText("GAME OVER", width / 2 - 170, height / 2 - 20);
  ctx.font = "24px system-ui";
  ctx.fillText("Refresh to play again", width / 2 - 130, height / 2 + 40);
}

update();

document.getElementById("left").addEventListener("touchstart", () => player.x -= player.speed);
document.getElementById("right").addEventListener("touchstart", () => player.x += player.speed);

document.getElementById("shoot").addEventListener("touchstart", () => {
  if (upgradeOpen) {
    upgrades.dmg += 1;
    player.dmg += 1;
    upgradeOpen = false;
    spawnWave();
  }
});

document.addEventListener("touchstart", (e) => {
  if (!upgradeOpen) return;

  let y = e.touches[0].clientY;
  if (y < height / 2 + 30) {
    player.dmg += 1;
  } else if (y < height / 2 + 70) {
    player.speed += 1;
  } else {
    player.hp += 20;
    if (player.hp > 100) player.hp = 100;
  }
  upgradeOpen = false;
  spawnWave();
});
