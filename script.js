const calculateBtn = document.getElementById("calculateBtn");
const result = document.getElementById("result");

calculateBtn.addEventListener("click", () => {
  const currentLevel = Number(document.getElementById("currentLevel").value);
  const targetLevel = Number(document.getElementById("targetLevel").value);
  const costPerLevel = Number(document.getElementById("costPerLevel").value);

  if (targetLevel <= currentLevel) {
    result.innerText = "Target level must be higher than current level.";
    return;
  }

  const levelsToUpgrade = targetLevel - currentLevel;
  const totalCost = levelsToUpgrade * costPerLevel;

  result.innerText = `You need ${levelsToUpgrade} upgrades.\nTotal cost: ${totalCost}`;
});
