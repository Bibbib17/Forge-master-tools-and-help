const canvas = document.getElementById("game");
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 8, -15);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.3));

// Track
const track = new THREE.Group();
scene.add(track);

function createTrack() {
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const lineMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

  const segments = 80;
  const radius = 25;
  const roadWidth = 6;

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const nextAngle = ((i + 1) / segments) * Math.PI * 2;

    const x1 = Math.cos(angle) * radius;
    const z1 = Math.sin(angle) * radius;
    const x2 = Math.cos(nextAngle) * radius;
    const z2 = Math.sin(nextAngle) * radius;

    const roadGeo = new THREE.BoxGeometry(roadWidth, 0.1, 2.2);
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);

    roadMesh.position.set((x1 + x2) / 2, 0, (z1 + z2) / 2);

    const rot = Math.atan2(z2 - z1, x2 - x1);
    roadMesh.rotation.y = -rot + Math.PI / 2;
    track.add(roadMesh);

    if (i % 10 === 0) {
      const lineGeo = new THREE.BoxGeometry(roadWidth * 0.1, 0.12, 0.8);
      const lineMesh = new THREE.Mesh(lineGeo, lineMat);
      lineMesh.position.set((x1 + x2) / 2, 0.05, (z1 + z2) / 2);
      lineMesh.rotation.y = roadMesh.rotation.y;
      track.add(lineMesh);
    }
  }
}
createTrack();

// Car
const car = new THREE.Group();
scene.add(car);

const body = new THREE.Mesh(
  new THREE.BoxGeometry(1.8, 0.5, 3),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
body.position.y = 0.6;
car.add(body);

car.position.set(0, 0, -20);
car.rotation.y = Math.PI;

// Car movement
let speed = 0;
let turn = 0;

const keys = { left: false, right: false, accel: false, brake: false };

document.getElementById("left").addEventListener("touchstart", () => keys.left = true);
document.getElementById("left").addEventListener("touchend", () => keys.left = false);
document.getElementById("right").addEventListener("touchstart", () => keys.right = true);
document.getElementById("right").addEventListener("touchend", () => keys.right = false);
document.getElementById("accel").addEventListener("touchstart", () => keys.accel = true);
document.getElementById("accel").addEventListener("touchend", () => keys.accel = false);
document.getElementById("brake").addEventListener("touchstart", () => keys.brake = true);
document.getElementById("brake").addEventListener("touchend", () => keys.brake = false);

// Lap system
let lap = 1;
const totalLaps = 3;
let startTime = performance.now();
let bestTime = null;

function updateUI() {
  document.getElementById("lap").innerText = `Lap: ${lap} / ${totalLaps}`;
  const elapsed = performance.now() - startTime;
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  const ms = Math.floor((elapsed % 1000) / 10);
  document.getElementById("timer").innerText = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}.${String(ms).padStart(2,'0')}`;
  document.getElementById("speed").innerText = `Speed: ${Math.floor(speed * 10)}`;
}

// Track loop logic
function trackPosition(t) {
  const radius = 25;
  const angle = t * Math.PI * 2;
  return new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
}

let trackProgress = 0;

function animate() {
  requestAnimationFrame(animate);

  if (keys.accel) speed += 0.02;
  if (keys.brake) speed -= 0.05;
  if (!keys.accel && !keys.brake) speed -= 0.01;

  speed = Math.max(0, Math.min(1.6, speed));

  if (keys.left) turn = -0.05;
  else if (keys.right) turn = 0.05;
  else turn = 0;

  car.rotation.y += turn * (0.5 + speed);
  const forward = new THREE.Vector3(0, 0, 1);
  forward.applyQuaternion(car.quaternion);
  car.position.addScaledVector(forward, speed);

  // Track progress check
  const pos = car.position.clone();
  const angle = Math.atan2(pos.z, pos.x);
  trackProgress = (angle / (Math.PI * 2) + 1) % 1;

  // Lap detection (cross near starting line)
  if (trackProgress > 0.98 && speed > 0.5) {
    lap++;
    if (lap > totalLaps) {
      lap = totalLaps;
      speed = 0;
      document.getElementById("timer").innerText = "FINISHED";
    }
  }

  camera.position.lerp(new THREE.Vector3(car.position.x, car.position.y + 6, car.position.z - 12), 0.05);
  camera.lookAt(car.position);

  updateUI();
  renderer.render(scene, camera);
}

animate();
