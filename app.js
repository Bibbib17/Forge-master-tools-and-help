const damage = document.getElementById("damage");
const atkSpeed = document.getElementById("atkSpeed");
const critChance = document.getElementById("critChance");
const critDamage = document.getElementById("critDamage");
const doubleChance = document.getElementById("doubleChance");

const dpsEl = document.getElementById("dps");
const critDpsEl = document.getElementById("critDps");
const avgDmgEl = document.getElementById("avgDmg");

const calcBtn = document.getElementById("calcBtn");
const themeBtn = document.getElementById("themeBtn");

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function calculate() {
  const dmg = Number(damage.value || 0);
  const speed = Number(atkSpeed.value || 0) / 100;
  const crit = clamp(Number(critChance.value || 0) / 100, 0, 1);
  const critDmg = clamp(Number(critDamage.value || 0) / 100, 0, 10);
  const dbl = clamp(Number(doubleChance.value || 0) / 100, 0, 1);

  if (!dmg || !speed) {
    dpsEl.textContent = "—";
    critDpsEl.textContent = "—";
    avgDmgEl.textContent = "—";
    return;
  }

  const baseDmg = dmg * speed;
  const expectedCrit = baseDmg * crit * critDmg;
  const expectedDouble = baseDmg * dbl;

  const avgDmg = baseDmg + expectedCrit + expectedDouble;
  const dps = avgDmg;
  const critDps = baseDmg + expectedCrit;

  dpsEl.textContent = dps.toFixed(2);
  critDpsEl.textContent = critDps.toFixed(2);
  avgDmgEl.textContent = avgDmg.toFixed(2);
}

calcBtn.addEventListener("click", calculate);

themeBtn.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  document.documentElement.setAttribute("data-theme", current === "light" ? "dark" : "light");
});

// Default theme
document.documentElement.setAttribute("data-theme", "dark");
