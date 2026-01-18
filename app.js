const STORAGE_KEY = "idleForgeMaster_v1";

let state = {
  coins: 0,
  exp: 0,
  prestige: 0,
  upgrades: [
    { id: 1, name: "Pickaxe", desc: "Adds +1 coin/sec", baseCost: 10, level: 0, coinPerSec: 1 },
    { id: 2, name: "Forge", desc: "Adds +5 coin/sec", baseCost: 50, level: 0, coinPerSec: 5 },
    { id: 3, name: "Mining Crew", desc: "Adds +20 coin/sec", baseCost: 200, level: 0, coinPerSec: 20 },
    { id: 4, name: "Auto-Farm", desc: "Adds +1 exp/sec", baseCost: 30, level: 0, expPerSec: 1 },
    { id: 5, name: "Training", desc: "Adds +5 exp/sec", baseCost: 120, level: 0, expPerSec: 5 }
  ],
  achievements: [
    { id: 1, name: "First Coins", goal: 100, unlocked: false },
    { id: 2, name: "Level Up", goal: 1000, unlocked: false },
    { id: 3, name: "Prestige Beginner", goal: 1, unlocked: false }
  ],
  lastTick: Date.now()
};

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function load() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    state = JSON.parse(saved);
  }
}

function format(num) {
  if (num < 1000) return Math.floor(num);
  if (num < 1e6) return (num / 1000).toFixed(1) + "K";
  if (num < 1e9) return (num / 1e6).toFixed(1) + "M";
  return (num / 1e9).toFixed(2) + "B";
}

function getCoinPerSec() {
  let total = 0;
  for (const u of state.upgrades) {
    if (u.coinPerSec) {
      total += u.coinPerSec * u.level;
    }
  }
  total *= (1 + state.prestige * 0.1);
  return total;
}

function getExpPerSec() {
  let total = 0;
  for (const u of state.upgrades) {
    if (u.expPerSec) {
      total += u.expPerSec * u.level;
    }
  }
  total *= (1 + state.prestige * 0.05);
  return total;
}

function cost(upgrade) {
  return Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.level));
}

function render() {
  document.getElementById("coins").textContent = format(state.coins);
  document.getElementById("exp").textContent = format(state.exp);
  document.getElementById("prestige").textContent = state.prestige;

  const upgradeList = document.getElementById("upgradeList");
  upgradeList.innerHTML = "";

  for (const u of state.upgrades) {
    const card = document.createElement("div");
    card.className = "upgrade";

    const left = document.createElement("div");
    left.className = "left";
    left.innerHTML = `<div class="name">${u.name} (Lv ${u.level})</div>
                      <div class="desc">${u.desc}</div>`;

    const right = document.createElement("div");
    right.className = "right";
    right.innerHTML = `<div>Cost: ${format(cost(u))}</div>
                       <button data-id="${u.id}">Buy</button>`;

    card.appendChild(left);
    card.appendChild(right);
    upgradeList.appendChild(card);
  }

  const achList = document.getElementById("achievements");
  achList.innerHTML = "";
  for (const a of state.achievements) {
    const ach = document.createElement("div");
    ach.className = "achievement";
    ach.innerHTML = `<div class="ach-name">${a.name}</div>
                     <div class="ach-status">${a.unlocked ? "Unlocked" : "Locked"}</div>`;
    achList.appendChild(ach);
  }
}

function checkAchievements() {
  for (const a of state.achievements) {
    if (!a.unlocked) {
      if (a.id === 1 && state.coins >= a.goal) a.unlocked = true;
      if (a.id === 2 && state.coins >= a.goal) a.unlocked = true;
      if (a.id === 3 && state.prestige >= a.goal) a.unlocked = true;
    }
  }
}

function tick() {
  const now = Date.now();
  const delta = (now - state.lastTick) / 1000;
  state.lastTick = now;

  const cps = getCoinPerSec();
  const eps = getExpPerSec();

  state.coins += cps * delta;
  state.exp += eps * delta;

  checkAchievements();
  render();
}

document.addEventListener("click", (e) => {
  if (e.target.matches("[data-id]")) {
    const id = parseInt(e.target.getAttribute("data-id"));
    const upgrade = state.upgrades.find(u => u.id === id);
    const c = cost(upgrade);
    if (state.coins >= c) {
      state.coins -= c;
      upgrade.level++;
      render();
    }
  }
});

document.getElementById("prestigeBtn").addEventListener("click", () => {
  if (state.coins < 10000) {
    alert("You need at least 10,000 coins to prestige.");
    return;
  }

  if (!confirm("Prestige resets coins + upgrades but gives prestige points. Continue?")) return;

  const prestigeGain = Math.floor(state.coins / 10000);
  state.prestige += prestigeGain;

  state.coins = 0;
  state.exp = 0;
  state.upgrades.forEach(u => u.level = 0);

  save();
  render();
});

load();
render();
setInterval(() => { save(); }, 10000);
setInterval(tick, 100);
