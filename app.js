const damage = document.getElementById("damage");
const atkSpeed = document.getElementById("atkSpeed");
const critChance = document.getElementById("critChance");
const critDamage = document.getElementById("critDamage");
const doubleChance = document.getElementById("doubleChance");

const dpsResult = document.getElementById("dpsResult");
const hitTime = document.getElementById("hitTime");
const notes = document.getElementById("notes");
const resetBtn = document.getElementById("resetBtn");
const themeBtn = document.getElementById("themeBtn");

const speedTable = [
  {max: 0, time: 1.7},
  {max: 7.1, time: 1.6},
  {max: 15.4, time: 1.5},
  {max: 25, time: 1.4},
  {max: 36.4, time: 1.3},
  {max: 50, time: 1.2},
  {max: 66.7, time: 1.1},
  {max: 87.5, time: 1.0},
  {max: 114, time: 0.9},
  {max: 150, time: 0.8},
  {max: 200, time: 0.7},
  {max: 275, time: 0.6},
  {max: 400, time: 0.5},
  {max: Infinity, time: 0.4},
];

function getHitTime(as){
  for (let i=0; i<speedTable.length; i++){
    if (as <= speedTable[i].max) return speedTable[i].time;
  }
  return 1.7;
}

function calculate(){
  const dmg = parseFloat(damage.value) || 0;
  const as = parseFloat(atkSpeed.value) || 0;
  const cc = parseFloat(critChance.value) || 0;
  const cd = parseFloat(critDamage.value) || 0;
  const dc = parseFloat(doubleChance.value) || 0;

  const ht = getHitTime(as);

  // base DPS
  const baseDPS = dmg / ht;

  // crit multiplier
  const critMult = (cc / 100) * (cd / 100);

  // double multiplier
  const doubleMult = dc / 100;

  // final DPS
  const finalDPS = baseDPS * (1 + critMult + doubleMult);

  dpsResult.textContent = `DPS: ${finalDPS.toFixed(2)}`;
  hitTime.textContent = `Hit Time: ${ht.toFixed(2)}s`;
}

function reset(){
  damage.value = "";
  atkSpeed.value = "";
  critChance.value = "";
  critDamage.value = "";
  doubleChance.value = "";
  dpsResult.textContent = "DPS: —";
  hitTime.textContent = "Hit Time: —";
}

function toggleTheme(){
  document.body.classList.toggle("light");
  themeBtn.textContent = document.body.classList.contains("light") ? "🌞" : "🌙";
}

damage.addEventListener("input", calculate);
atkSpeed.addEventListener("input", calculate);
critChance.addEventListener("input", calculate);
critDamage.addEventListener("input", calculate);
doubleChance.addEventListener("input", calculate);

resetBtn.addEventListener("click", reset);
themeBtn.addEventListener("click", toggleTheme);

calculate();
