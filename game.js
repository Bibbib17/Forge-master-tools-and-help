const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const waveText = document.getElementById("wave");
const hpText = document.getElementById("hp");
const upgradesText = document.getElementById("upgrades");

const leftBtn = document.getElementById("left");
const rightBtn = document.getElementById("right");
const shootBtn = document.getElementById("shoot");

let width, height;
function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

const player = {
  x: width / 2,
  y: height - 80,
  size: 25,
  speed: 5,
  hp: 100,
  upgrades: 0,
};

let left = false;
let right = false;
let shooting = false;

leftBtn.addEventListener("touchstart", () => left = true);
leftBtn.addEventListener("touchend", () => left = false);
rightBtn.addEventListener("touchstart", () => right = true);
rightBtn.addEventListener("touchend", () => right = false);
shootBtn.addEventListener("touchstart", () => shooting = true);
shootBtn.addEventListener("touchend", () => shooting = false);

const bullets = [];
const enemies = [];
let wave = 1;

function spawnWave() {
  const count = wave * 3;
  for (let i = 0; i < count; i++) {
    enemies.push({
      x: Math.random() * (width - 40) + 20,
      y: -Math.random() * 200,
      size: 20,
      speed: 1 + wave * 0.2,
      hp: 1 + Math.floor(wave / 2),
    });
  }
}

spawnWave();

function update() {
  if (left) player.x -= player.speed;
  if (right) player.x += player.speed;
  if (player.x < player.size) player.x = player.size;
  if (player.x > width - player.size) player.x = width - player.size;

  if (shooting && bullets.length < 6 + player.upgrades) {
    bullets.push({ x: player.x, y: player.y - 30, speed: 8 });
  }

  bullets.forEach((b, i) => {
    b.y -= b.speed;
    if (b.y < -10) bullets.splice(i, 1);
  });

  enemies.forEach((e, i) => {
    e.y += e.speed;

    if (e.y > height) {
      enemies.splice(i, 1);
      player.hp -= 10;
    }

    bullets.forEach((b, bi) => {
      if (Math.hypot(b.x - e.x, b.y - e.y) < e.size) {
        e.hp--;
        bullets.splice(bi, 1);
        if (e.hp <= 0) {
          enemies.splice(i, 1);
          player.upgrades += 1;
        }
      }
    });
  });

  if (enemies.length === 0) {
    wave++;
    spawnWave();
  }

  if (player.hp <= 0) {
    player.hp = 0;
    enemies.length = 0;
    bullets.length = 0;
    wave = 1;
    player.upgrades = 0;
    player.hp = 100;
    spawnWave();
  }

  waveText.innerText = "Wave: " + wave;
  hpText.innerText = "HP: " + player.hp;
  upgradesText.innerText = "Upgrades: " + player.upgrades;
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fill();

  bullets.forEach((b) => {
    ctx.fillStyle = "cyan";
    ctx.beginPath();
    ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  enemies.forEach((e) => {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
