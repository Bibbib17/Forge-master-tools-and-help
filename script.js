const calculateBtn = document.getElementById("calculateBtn");
const result = document.getElementById("result");

calculateBtn.addEventListener("click", () => {
  const currentLevel = Number(document.getElementById("currentLevel").value);
  const targetLevel = Number(document.getElementById("targetLevel").value);
  const baseCost = Number(document.getElementById("baseCost").value);
  const multiplier = Number(document.getElementById("multiplier").value);

  if (targetLevel <= currentLevel) {
    result.innerText = "Target level must be higher than current level.";
    return;
  }

  let totalCost = 0;
  let output = "";

  for (let level = currentLevel; level < targetLevel; level++) {
    const cost = Math.floor(baseCost * Math.pow(multiplier, level - 1));
    totalCost += cost;
    output += `Level ${level} → ${level + 1}: ${cost}\n`;
  }

  output += `\nTotal cost: ${totalCost}`;
  result.innerText = output;
});
