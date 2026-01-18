const display = document.getElementById("display");
const subdisplay = document.getElementById("subdisplay");
const expr = document.getElementById("expr");
const evalBtn = document.getElementById("eval");
const history = document.getElementById("history");
let ans = 0;

const tabs = document.querySelectorAll(".tab");
const calcPanel = document.getElementById("calc");
const graphPanel = document.getElementById("graph");
const formulasPanel = document.getElementById("formulas");
const logPanel = document.getElementById("changelog");

const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const closeSettings = document.getElementById("closeSettings");
const toggleTheme = document.getElementById("toggleTheme");

const formulaList = document.getElementById("formulaList");
const log = document.getElementById("log");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    document.querySelectorAll(".tabContent").forEach(content => content.classList.remove("active"));
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

const buttons = [
  "7","8","9","C",
  "4","5","6","/",
  "1","2","3","*",
  "0",".","(",")",
  "ans","^","=","sqrt(",
  "log10(","ln(","!","pi",
  "sin(","cos(","tan(","e",
  "asin(","acos(","atan(","%",
];

const grid = document.getElementById("buttons");
buttons.forEach(val => {
  const btn = document.createElement("button");
  btn.className = "calc-btn";
  btn.dataset.val = val;
  btn.textContent = val === "C" ? "C" : val;
  if (val === "C") btn.classList.add("danger");
  grid.appendChild(btn);
});

document.querySelectorAll(".calc-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const val = btn.dataset.val;
    if (val === "C") {
      display.textContent = "0";
      subdisplay.textContent = "";
      expr.value = "";
      return;
    }
    if (val === "=") {
      evaluate();
      return;
    }
    if (val === "ans") {
      expr.value += ans;
      return;
    }
    expr.value += val;
  });
});

function evaluate() {
  try {
    const input = expr.value;
    const result = math.evaluate(input);
    ans = result;
    display.textContent = result;
    subdisplay.textContent = input;
    history.value += `${input} = ${result}\n`;
  } catch (e) {
    display.textContent = "Error";
    subdisplay.textContent = "";
  }
}

evalBtn.addEventListener("click", evaluate);

expr.addEventListener("keydown", (e) => {
  if (e.key === "Enter") evaluate();
});

// Settings
settingsBtn.addEventListener("click", () => settingsModal.style.display = "flex");
closeSettings.addEventListener("click", () => settingsModal.style.display = "none");

toggleTheme.addEventListener("click", () => {
  document.body.classList.toggle("light");
  if (document.body.classList.contains("light")) {
    document.documentElement.style.setProperty("--bg", "#f3f4f6");
    document.documentElement.style.setProperty("--panel", "#ffffff");
    document.documentElement.style.setProperty("--text", "#111827");
    document.documentElement.style.setProperty("--muted", "#6b7280");
    document.documentElement.style.setProperty("--btn", "#e5e7eb");
    document.documentElement.style.setProperty("--btnHover", "#c7d2fe");
    document.documentElement.style.setProperty("--accent", "#2563eb");
  } else {
    document.documentElement.style.setProperty("--bg", "#0b0d12");
    document.documentElement.style.setProperty("--panel", "#141a22");
    document.documentElement.style.setProperty("--text", "#e9edf2");
    document.documentElement.style.setProperty("--muted", "#a7b1bf");
    document.documentElement.style.setProperty("--btn", "#1c2430");
    document.documentElement.style.setProperty("--btnHover", "#2a3b4c");
    document.documentElement.style.setProperty("--accent", "#4da6ff");
  }
});

// Graphing
const graphBtn = document.getElementById("graphBtn");
const graphCanvas = document.getElementById("graphCanvas");
let chart;

graphBtn.addEventListener("click", () => {
  const input = document.getElementById("graphExpr").value;
  const xValues = [];
  const yValues = [];
  for (let x = -10; x <= 10; x += 0.2) {
    xValues.push(x);
    const y = math.evaluate(input.replaceAll("x", `(${x})`));
    yValues.push(y);
  }

  if (chart) chart.destroy();
  chart = new Chart(graphCanvas, {
    type: 'line',
    data: {
      labels: xValues,
      datasets: [{
        label: input,
        data: yValues,
        borderColor: '#4da6ff',
        borderWidth: 2,
        pointRadius: 0,
      }]
    },
    options: {
      scales: {
        x: { grid: { color: '#2a3445' } },
        y: { grid: { color: '#2a3445' } }
      }
    }
  });
});

// Formula library
const formulas = [
  { name: "Area of Circle", formula: "A = πr^2" },
  { name: "Pythagorean Theorem", formula: "a^2 + b^2 = c^2" },
  { name: "Quadratic Formula", formula: "x = (-b ± sqrt(b^2 - 4ac)) / (2a)" },
  { name: "Slope", formula: "m = (y2 - y1) / (x2 - x1)" },
];

formulas.forEach(f => {
  const div = document.createElement("div");
  div.className = "formulaItem";
  div.innerHTML = `<b>${f.name}</b><br>${f.formula}`;
  formulaList.appendChild(div);
});

// Changelog
log.innerHTML = `
  <div><b>v1.0</b> - Calculator + graph + formulas + settings</div>
`;
