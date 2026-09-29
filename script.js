/* ===== SETTINGS (change these to tune the game) ===== */
const DIFFICULTY = {
  easy:   { time: 90, sensitivity: 0.7 },
  normal: { time: 60, sensitivity: 1.0 },
  hard:   { time: 45, sensitivity: 1.5 }
};
// width = size on screen, points = score, risk = how much it wakes Butch
const BONES = {
  white: { img: "images/bone_white.png", width: 46, points: 10, risk: 1.0 },
  blue:  { img: "images/bone_blue.png",  width: 64, points: 25, risk: 1.5 },
  gold:  { img: "images/bone_gold.png",  width: 84, points: 50, risk: 2.2 }
};
const BONE_LIST = ["white","white","white","blue","blue","blue","gold","gold"];
const SAFE_SPEED = 0.45;   // px per ms that is still "quiet"
const MOVE_GAIN = 0.25;    // wake % per move event when too fast
const HOLD_GAIN = 1.2;     // wake % per second just for holding a bone
const CALM_RATE = 4;       // wake % per second lost when not holding
const STAGES = [           // [max %, image name, message, color]
  [30, "sleeping", "Butch is sleeping...", "#2e9b3f"],
  [60, "restless", "Butch is getting restless...", "#f0b400"],
  [80, "alert", "Butch heard something...", "#e07b10"],
  [99, "almost", "Careful! Butch is about to wake up!", "#d32f2f"],
  [100, "awake", "BUTCH WOKE UP!", "#7a1515"]
];

/* ===== ELEMENTS ===== */
const $ = id => document.getElementById(id);
const form = $("registerForm"), nameInput = $("playerName");
const arena = $("arena"), basket = $("basket"), bowl = $("bowl");
let state = null;

/* ===== REGISTRATION FORM ===== */
function showError(id, msg, input) {
  $(id).textContent = msg;
  if (input) input.classList.toggle("invalid", !!msg);
}

function validate(data) {
  let ok = true;
  const name = (data.get("playerName") || "").trim();
  if (name.length < 2) { showError("nameError", "Name must be at least 2 characters.", nameInput); ok = false; }
  else if (name.length > 15) { showError("nameError", "Name must be 15 characters or less.", nameInput); ok = false; }
  else if (!/^[A-Za-z0-9 ]+$/.test(name)) { showError("nameError", "Use letters, numbers and spaces only.", nameInput); ok = false; }
  else showError("nameError", "", nameInput);

  if (!data.get("difficulty")) { showError("difficultyError", "Please choose a difficulty."); ok = false; }
  else showError("difficultyError", "");

  if (!$("agree").checked) { showError("agreeError", "You must tick the box to continue."); ok = false; }
  else showError("agreeError", "");
  return ok;
}

// clear a field's error as soon as the player fixes it
nameInput.addEventListener("input", () => showError("nameError", "", nameInput));
form.querySelectorAll("[name=difficulty]").forEach(r => r.addEventListener("change", () => showError("difficultyError", "")));
$("agree").addEventListener("change", () => showError("agreeError", ""));

form.addEventListener("submit", e => {
  e.preventDefault();
  const data = new FormData(form);
  $("formSuccess").textContent = "";
  if (!validate(data)) { Sound.init(); Sound.play("formError"); return; }
  const player = { name: data.get("playerName").trim(), difficulty: data.get("difficulty") };
  Sound.init(); Sound.play("formSuccess");
  $("formSuccess").textContent = `Welcome, ${player.name}! Starting the game...`;
  setTimeout(() => startGame(player), 900);
});

/* ===== GAME ===== */
function startGame(player) {
  $("registerScreen").classList.add("hidden");
  $("gameScreen").classList.remove("hidden");
  $("result").classList.add("hidden");
  arena.querySelectorAll(".bone").forEach(b => b.remove());
  const cfg = DIFFICULTY[player.difficulty];
  state = { player, cfg, wake: 0, score: 0, bones: 0, time: cfg.time, stage: 0, sec: 99, drag: null, over: false, last: performance.now() };
  $("hudName").textContent = player.name;
  spawnBones();
  updateHud(); updateWake();
  clearInterval(state.timer);
  state.timer = setInterval(tick, 100);
  Sound.init(); Sound.snoreOn();
}

function spawnBones() {
  const a = arena.getBoundingClientRect(), b = bowl.getBoundingClientRect();
  const slots = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) slots.push([c, r]);
  slots.sort(() => Math.random() - 0.5);
  BONE_LIST.forEach((type, i) => {
    const t = BONES[type], el = document.createElement("img");
    el.src = t.img; el.className = "bone"; el.draggable = false; el.dataset.type = type;
    el.style.width = t.width + "px";
    const [c, r] = slots[i];
    const x = b.left - a.left + 20 + c * ((b.width - 100) / 3);
    const y = b.top - a.top + 20 + r * 44 + Math.random() * 8;
    el.style.left = x + "px"; el.style.top = y + "px";
    el.style.transform = `rotate(${Math.round(Math.random() * 40 - 20)}deg)`;
    el.addEventListener("pointerdown", e => grab(e, el));
    arena.appendChild(el);
  });
}

function grab(e, el) {
  if (state.over) return;
  e.preventDefault();
  el.setPointerCapture(e.pointerId);
  const a = arena.getBoundingClientRect();
  state.drag = { el, risk: BONES[el.dataset.type].risk, dx: e.clientX - a.left - el.offsetLeft, dy: e.clientY - a.top - el.offsetTop, lx: e.clientX, ly: e.clientY, lt: performance.now() };
  el.classList.add("drag");
  Sound.play("pickup");
  el.onpointermove = move;
  el.onpointerup = el.onpointercancel = drop;
}

function move(e) {
  const d = state.drag; if (!d || state.over) return;
  const now = performance.now(), dt = Math.max(now - d.lt, 1);
  const speed = Math.hypot(e.clientX - d.lx, e.clientY - d.ly) / dt;
  d.lx = e.clientX; d.ly = e.clientY; d.lt = now;
  if (speed > SAFE_SPEED) addWake((speed - SAFE_SPEED) * MOVE_GAIN * state.cfg.sensitivity * d.risk * 10);
  const a = arena.getBoundingClientRect();
  const x = Math.min(Math.max(e.clientX - a.left - d.dx, 0), a.width - d.el.offsetWidth);
  const y = Math.min(Math.max(e.clientY - a.top - d.dy, 0), a.height - d.el.offsetHeight);
  d.el.style.left = x + "px"; d.el.style.top = y + "px";
}

function drop() {
  const d = state.drag; if (!d) return;
  d.el.classList.remove("drag");
  d.el.onpointermove = d.el.onpointerup = d.el.onpointercancel = null;
  state.drag = null;
  if (state.over) return;
  const r = d.el.getBoundingClientRect(), k = basket.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  if (cx > k.left && cx < k.right && cy > k.top && cy < k.bottom) {
    Sound.play("bone", d.el.dataset.type);
    state.score += BONES[d.el.dataset.type].points;
    state.bones++;
    d.el.remove();
    updateHud();
    if (state.bones === BONE_LIST.length) endGame(true);
  } else Sound.play("miss");
}

function addWake(n) {
  state.wake = Math.min(100, Math.max(0, state.wake + n));
  updateWake();
  if (state.wake >= 100) endGame(false, "Butch woke up!");
}

function tick() {
  if (state.over) return;
  const now = performance.now(), dt = (now - state.last) / 1000; state.last = now;
  state.time -= dt;
  if (state.drag) addWake(HOLD_GAIN * state.cfg.sensitivity * state.drag.risk * dt);
  else addWake(-CALM_RATE * dt);
  if (state.time <= 0) { state.time = 0; updateHud(); endGame(false, "Time's up!"); return; }
  const sec = Math.ceil(state.time);
  if (sec <= 10 && sec !== state.sec) Sound.play("tick");
  state.sec = sec;
  updateHud();
}

function updateHud() {
  $("hudScore").textContent = state.score;
  $("hudBones").textContent = state.bones + "/" + BONE_LIST.length;
  $("hudTime").textContent = Math.ceil(state.time);
}

function updateWake() {
  const w = state.wake, s = STAGES.find(s => w <= s[0]) || STAGES[4];
  $("wakeFill").style.width = w + "%";
  $("wakeFill").style.background = s[3];
  $("wakeText").textContent = Math.round(w) + "%";
  $("wakeMsg").textContent = s[2];
  const idx = STAGES.indexOf(s);
  if (idx !== state.stage) {
    if (idx > state.stage) Sound.play("stage" + idx);
    if (idx === 0) Sound.snoreOn(); else Sound.snoreOff();
    state.stage = idx;
  }
  $("butch").src = `images/butch_${s[1]}.png`;
  $("butchHead").src = `images/butch_head_${s[1]}.png`;
}

function endGame(win, reason) {
  if (state.over) return;
  state.over = true; clearInterval(state.timer);
  if (state.drag) state.drag.el.classList.remove("drag");
  Sound.snoreOff();
  if (win) Sound.play("win"); else if (reason !== "Butch woke up!") Sound.play("lose");
  const bonus = win ? Math.ceil(state.time) : 0;
  $("resultTitle").textContent = win ? "You stole all the bones!" : reason;
  $("resultText").textContent = win
    ? `Nice, ${state.player.name}! Score: ${state.score} + ${bonus} time bonus = ${state.score + bonus}.`
    : `${state.player.name}, you got ${state.bones}/${BONE_LIST.length} bones. Score: ${state.score}.`;
  $("result").classList.remove("hidden");
}

$("restartBtn").addEventListener("click", () => startGame(state.player));
$("quitBtn").addEventListener("click", () => {
  clearInterval(state.timer); state.over = true; Sound.stopAll();
  $("gameScreen").classList.add("hidden");
  $("registerScreen").classList.remove("hidden");
  $("formSuccess").textContent = "";
});

$("muteBtn").addEventListener("click", () => {
  const m = Sound.toggleMute();
  $("muteBtn").textContent = m ? "🔇 Sound off" : "🔊 Sound on";
  if (!m && state && !state.over && state.stage === 0) Sound.snoreOn();
});