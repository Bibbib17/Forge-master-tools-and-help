const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const hpText = document.getElementById("hp");
const waveText = document.getElementById("wave");

let width, height;
let keys = { left: false, right: false, shoot: false };

let player = { x: 0, y: 0, size: 24, speed: 6, hp: 100 };
let bullets = [];
let enemies = [];
let wave = 1;
let spawnTimer = 0;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  player.x = width / 2;
  player.y = height - 80;
}

window.addEventListener("resize", resize);
resize();

function spawnWave() {
  enemies = [];
  for (let i = 0; i < wave * 3; i++) {
    enemies.push({
      x: Math.random() * width,
      y: -Math.random() * 200,
      size: 26,
      speed: 1.2 + wave * 0.2,
    });
  }
}

spawnWave();

function update() {
  // move player
  if (keys.left) player.x -= player.speed;
  if (keys.right) player.x += player.speed;
  player.x = Math.max(20, Math.min(width - 20, player.x));

  // shoot
  if (keys.shoot && bullets.length < 5) {
    bullets.push({ x: player.x, y: player.y - 20, speed: 9 });
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
    if (
      Math.abs(e.x - player.x) < (e.size + player.size) / 2 &&
      Math.abs(e.y - player.y) < (e.size + player.size) / 2
    ) {
      enemies.splice(i, 1);
      player.hp -= 10;
      if (player.hp <= 0) {
        player.hp = 0;
      }
    }

    // hit bullet
    bullets.forEach((b, bi) => {
      if (Math.abs(e.x - b.x) < (e.size + 6) / 2 && Math.abs(e.y - b.y) < (e.size + 6) / 2) {
        enemies.splice(i, 1);
        bullets.splice(bi, 1);
      }
    });
  });

  // wave complete
  if (enemies.length === 0) {
    wave++;
    spawnWave();
  }

  hpText.textContent = "HP: " + player.hp;
  waveText.textContent = "Wave: " + wave;

  if (player.hp <= 0) {
    ctx.fillStyle = "white";
    ctx.font = "48px system-ui";
    ctx.fillText("GAME OVER", width / 2 - 150, height / 2);
    return;
  }

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

update();

document.getElementById("left").addEventListener("touchstart", () => keys.left = true);
document.getElementById("left").addEventListener("touchend", () => keys.left = false);

document.getElementById("right").addEventListener("touchstart", () => keys.right = true);
document.getElementById("right").addEventListener("touchend", () => keys.right = false);

document.getElementById("shoot").addEventListener("touchstart", () => keys.shoot = true);
document.getElementById("shoot").addEventListener("touchend", () => keys.shoot = false);
