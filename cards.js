/* ===== CARD SYSTEM =====
   Draw a card -> collect the bones on it. Wrong bones in the basket wake Butch.
   Finish a card and you draw the next one, until time runs out or Butch wakes. */
const CARD_PENALTY_WAKE = 15;  // wake % added when a wrong bone goes in the basket
const CARD_BONUS_TIME = 3;     // seconds added when a card is finished
const CARD_PENALTY_TIME = 5;   // seconds removed for a wrong bone
const BOWL_REFILL_TIME = 5;
const BONUS_CARD_POINTS = 20;  // extra points for finishing the bonus card (any 1 bone)
const CARD_DECK = [            // [image name, bone type (null = any), amount, chance weight]
  ["small1", "white", 1, 2], ["small2", "white", 2, 2], ["small3", "white", 3, 1],
  ["medium1", "blue", 1, 2], ["medium2", "blue", 2, 2], ["medium3", "blue", 3, 1],
  ["large1", "gold", 1, 2],  ["large2", "gold", 2, 1],  ["bonus", null, 1, 1]
];

const Cards = (() => {
  let cur = null, done = 0, picking = false, panel = null, overlay = null;

  let left = { white: 0, blue: 0, gold: 0 };   // bones still in the bowl
  function resetLeft() {
    left = { white: 0, blue: 0, gold: 0 };
    BONE_LIST.forEach(t => left[t]++);
  }
  const leftTotal = () => left.white + left.blue + left.gold;

  const byId = id => document.getElementById(id);

  function build() {
    if (overlay) return;
    panel = document.createElement("div");
    panel.id = "cardPanel";
    panel.innerHTML = '<img id="cardImg" alt="Current card"><div id="cardInfo"></div>';
    arena.appendChild(panel);
    overlay = document.createElement("div");
    overlay.id = "cardPicker"; overlay.className = "hidden";
    byId("gameScreen").appendChild(overlay);
  }

  function draw() {
    const pool = [];
    CARD_DECK.forEach(c => {
      const possible = c[1] === null ? leftTotal() > 0 : left[c[1]] >= c[2];
      if (possible) for (let i = 0; i < c[3]; i++) pool.push(c);
    });
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function showPicker() {
    picking = true; state.paused = true;
    overlay.innerHTML = '<div class="pbox"><h2>Pick a card</h2><p>Collect the bones on your card. Wrong bones wake Butch!</p><div class="prow"></div></div>';
    const row = overlay.querySelector(".prow");
    for (let i = 0; i < 3; i++) {
      const c = draw(), b = document.createElement("button");
      b.className = "pcard"; b.type = "button";
      b.style.setProperty("--i", i);
      b.style.setProperty("--r", (i - 1) * 9 + "deg");   // fan angle
      b.innerHTML = `<span class="pdeal"><span class="pin"><img class="pback" src="images/cards/card_back.png" alt="Card"><img class="pfront" src="images/cards/card_${c[0]}.png" alt=""></span></span>`;
      b.addEventListener("click", () => choose(c, b, row));
      b.addEventListener("pointerenter", () => { if (picking) Sound.play("cardHover"); });
      row.appendChild(b);
    }
    overlay.classList.remove("hidden");
    Sound.play("cardDeal");
  }

  function flyToPanel(btn, onDone) {        // the chosen card flies to the corner panel
    const from = btn.getBoundingClientRect();
    panel.style.display = ""; panel.style.visibility = "hidden";
    render();
    const to = byId("cardImg").getBoundingClientRect();
    const fly = document.createElement("img");
    fly.className = "cardFly"; fly.src = `images/cards/card_${cur.key}.png`;
    Object.assign(fly.style, { left: from.left + "px", top: from.top + "px", width: from.width + "px", height: from.height + "px" });
    document.body.appendChild(fly);
    btn.style.visibility = "hidden";
    overlay.classList.add("fade");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const dx = to.left + to.width / 2 - (from.left + from.width / 2);
      const dy = to.top + to.height / 2 - (from.top + from.height / 2);
      fly.style.transform = `translate(${dx}px,${dy}px) scale(${to.height / from.height})`;
    }));
    setTimeout(() => {
      fly.remove();
      overlay.classList.add("hidden"); overlay.classList.remove("fade");
      panel.style.visibility = "";
      panel.classList.add("pop");
      setTimeout(() => panel.classList.remove("pop"), 500);
      onDone();
    }, 650);
  }

  function choose(c, btn, row) {
    if (!picking) return;
    picking = false;
    row.querySelectorAll(".pcard").forEach(b => { b.disabled = true; if (b !== btn) b.classList.add("dim"); });
    btn.classList.add("flip");
    cur = { key: c[0], type: c[1], need: c[2], got: 0 };
    Sound.play("cardFlip");
    setTimeout(() => Sound.play("cardReveal", cur.type), 450);
    setTimeout(() => {
      Sound.play("cardFly");
      flyToPanel(btn, () => { state.paused = false; state.last = performance.now(); });
    }, 1100);
  }

  function render() {
    panel.style.display = "";
    
    byId("cardImg").src = `images/cards/card_${cur.key}.png`;
    byId("cardInfo").innerHTML = `${cur.got}/${cur.need}<small>Cards done: ${done}</small>`;
  }

  function flash(cls) {
    panel.classList.add(cls);
    setTimeout(() => panel.classList.remove(cls), 450);
  }

  function setInBowl(el) {
    const a = arena.getBoundingClientRect(), b = bowl.getBoundingClientRect();
    el.style.left = (b.left - a.left + 20 + Math.random() * Math.max(b.width - 120, 10)) + "px";
    el.style.top = (b.top - a.top + 20 + Math.random() * 50) + "px";
  }

  function refill(type) {            // keep the bowl full: a new bone of the same size appears
    const t = BONES[type], el = document.createElement("img");
    el.src = t.img; el.className = "bone"; el.draggable = false;
    el.dataset.type = type; el.style.width = t.width + "px";
    el.style.transform = `rotate(${Math.round(Math.random() * 40 - 20)}deg)`;
    setInBowl(el);
    el.addEventListener("pointerdown", e => grab(e, el));
    arena.appendChild(el);
  }

  return {
    start() { build(); resetLeft(); done = 0; cur = null; panel.style.display = "none"; showPicker(); },
    stop() { if (overlay) overlay.classList.add("hidden"); if (panel) panel.style.display = "none"; picking = false; },
    accept(type) { return !cur || cur.type === null || cur.type === type; },
    reject(el) {                     // wrong bone: back to the bowl, -time, Butch gets louder
      setInBowl(el);
      Sound.play("formError");
      flash("bad");
      state.time = Math.max(0, state.time - CARD_PENALTY_TIME);
      updateHud();
      showFloatingText(`WRONG BONE! -${CARD_PENALTY_TIME}s`, null, null, "bad");
      addWake(CARD_PENALTY_WAKE);
    },
    deliver(type) {                  // right bone in the basket
      cur.got++;
      left[type]--;
      if (cur.got < cur.need) { render(); return; }
      done++;
      state.paused = true;           // stop the clock while the card is celebrated
      state.time += CARD_BONUS_TIME;
      if (cur.type === null) state.score += BONUS_CARD_POINTS;
      updateHud(); render(); flash("good"); Sound.play("win");
      setTimeout(() => showFloatingText(`CARD DONE! +${CARD_BONUS_TIME}s`, null, null, "good"), 700);
      const empty = leftTotal() === 0;
      if (empty) setTimeout(() => {  // bowl is empty: fresh bones
        if (state.over) return;
        resetLeft(); spawnBones();
        state.time += BOWL_REFILL_TIME; updateHud();
        showFloatingText(`NEW BONES! +${BOWL_REFILL_TIME}s`, null, null, "perfect");
        Sound.play("bone", "gold");
      }, 1600);
      setTimeout(() => { if (!state.over) showPicker(); }, empty ? 2500 : 1700);
    }
  };
})();
