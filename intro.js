/* ===== EDIT THIS: ABOUT US ===== */
const ABOUT = {
  blurb: "Steal Butch's Bones is a stealth browser game made by Group ERID (Group 1) for the subject of Integrative Programming and Technologies at National University.",
  team: [
    { name: "Katelyn Urbano", role: "Project Lead" },
    { name: "John Carlo Cabral", role: "UI/UX Designer" },
    { name: "Mahathir Kusain", role: "Programmer" },
    { name: "Jerome Tugadi", role: "Programmer" },
    { name: "Marky Villagonzalo", role: "Programmer" }
  ],
  credits: "Dog sound effects from Pixabay."
};

/* ===== WELCOME SCREEN (shown only on the first visit) ===== */
const WELCOME = {
  title: "Welcome to Steal Butch's Bones!",
  imgs: ["butch_sleeping_big.png"],
  lines: ["Butch is sound asleep, and his bones are up for grabs.",
          "Take a quick tour to learn the rules and meet the team behind the game."]
};

/* ===== HOW TO PLAY SLIDES (edit the text if the game rules change) ===== */
const SLIDES = [
  { title: "The Goal",
    imgs: ["butch_sleeping.png"],
    lines: ["Steal the bones from Butch's bowl and drop them in the basket.",
            "Hold the mouse button on a bone and move it SLOWLY.",
            "Don't wake Butch, and beat the timer!"] },
  { title: "Bone Sizes & Points",
    imgs: ["bone_white.png", "bone_blue.png", "bone_gold.png"],
    lines: ["White (small): 10 points.", "Blue (medium): 25 points.",
            "Gold (large): 50 points.", "Bigger bones are worth more but wake Butch more easily."] },
  { title: "The Wake Meter",
    imgs: ["butch_head_sleeping.png", "butch_head_restless.png", "butch_head_alert.png", "butch_head_almost.png", "butch_head_awake.png"],
    lines: ["Moving fast or too roughly fills the meter.",
            "0-30% Sleeping, 31-60% Restless, 61-80% Alert, 81-99% Almost awake.",
            "At 100% Butch wakes up and the heist is over!"] },
  { title: "Difficulty",
    imgs: ["butch_sleeping.png", "butch_alert.png", "butch_awake.png"],
    lines: ["Easy: more time and a calm Butch.", "Normal: balanced.",
            "Hard: less time and Butch wakes up easily."] },
  { title: "Card Mode",
    imgs: ["cards/card_back.png", "cards/card_small2.png", "cards/card_large1.png", "cards/card_bonus.png"],
    lines: ["Pick one of 3 face-down cards, then steal only the bones on your card.",
            "Wrong bone in the basket: -5 seconds and Butch gets louder.",
            "Finish a card: +3 seconds and coins. Empty bowl: fresh bones +5 seconds.",
            "No finish line: keep going until time runs out or Butch wakes up."] },
  { title: "Power-Ups & Shop",
    imgs: ["powerups/sleep_spray.png", "powerups/slow_time.png", "powerups/silent_gloves.png", "powerups/bone_magnet.png", "powerups/freeze_butch.png"],
    lines: ["Buy power-ups in the Power-Up Shop with coins, then tap them above the arena during a game.",
            "Sleep Spray calms Butch, Slow Time slows the clock, Silent Gloves quiets your moves.",
            "Bone Magnet pulls same-colour bones to the one you hold. Freeze Butch pauses his wake meter."] },
  { title: "Coins",
    imgs: ["coins/coin.png", "coins/coin_pile3.png", "coins/coin_pile4.png"],
    lines: ["Classic: coins for every bone you steal (white 2, blue 5, gold 10) plus 20 for a win.",
            "Card Mode: each finished card pays coins (small 5, medium 10, large 20, bonus 15).",
            "Spend them in the Power-Up Shop!"] }
];

(function () {
  let idx = 0, mode = "how", tour = false;
  const modal = document.createElement("div");
  modal.className = "introModal hidden";
  modal.innerHTML =
    '<div class="introBox"><button class="introClose" type="button" aria-label="Close">&times;</button>' +
    '<div class="introBody"></div><div class="introNav"></div></div>';
  document.body.appendChild(modal);
  const body = modal.querySelector(".introBody"), nav = modal.querySelector(".introNav");

  const click = () => { if (typeof Sound !== "undefined") { Sound.init(); Sound.play("menuClick"); } };

  function render() {
    if (mode === "welcome") {
      body.innerHTML = `<h2>${WELCOME.title}</h2><div class="introImgs">` +
        WELCOME.imgs.map(f => `<img src="images/${f}" alt="">`).join("") +
        `</div><ul>` + WELCOME.lines.map(l => `<li>${l}</li>`).join("") + `</ul>`;
      nav.innerHTML =
        '<button type="button" class="btn gray" data-act="close">Skip</button>' +
        '<button type="button" class="btn" data-act="next">Start tour</button>';
      return;
    }
    if (mode === "about") {
      body.innerHTML = `<h2>About Us</h2><p>${ABOUT.blurb}</p><ul class="team">` +
        ABOUT.team.map(m => `<li><b>${m.name}</b><span>${m.role}</span></li>`).join("") +
        `</ul><p class="credits">${ABOUT.credits}</p>`;
      nav.innerHTML = tour
        ? '<button type="button" class="btn gray" data-act="back">Back</button>' +
          '<button type="button" class="btn" data-act="close">Let\'s play!</button>'
        : '<button type="button" class="btn" data-act="close">Close</button>';
      return;
    }
    const s = SLIDES[idx];
    const last = idx === SLIDES.length - 1;
    body.innerHTML = `<h2>${s.title}</h2><div class="introImgs">` +
      s.imgs.map(f => `<img src="images/${f}" alt="">`).join("") +
      `</div><ul>` + s.lines.map(l => `<li>${l}</li>`).join("") + `</ul>`;
    nav.innerHTML =
      `<button type="button" class="btn gray" data-act="back" ${idx === 0 && !tour ? "disabled" : ""}>Back</button>` +
      `<span class="dots">` + SLIDES.map((_, i) => `<i data-dot="${i}" class="${i === idx ? "on" : ""}"></i>`).join("") + `</span>` +
      `<button type="button" class="btn" data-act="next">${last && !tour ? "Got it!" : "Next"}</button>`;
  }

  // m = "welcome" | "how" | "about"; silent = no click sound; asTour = Welcome > How to Play > About Us
  function open(m, silent, asTour) {
    mode = m; tour = !!asTour; idx = 0; render();
    modal.classList.remove("hidden");
    if (!silent) click();
  }
  function close() { modal.classList.add("hidden"); tour = false; click(); }

  function go(d) {
    if (mode === "welcome") { if (d > 0) { mode = "how"; idx = 0; render(); click(); } return; }
    if (mode === "about")   { if (d < 0) { mode = "how"; idx = SLIDES.length - 1; render(); click(); } return; }
    idx += d;
    if (idx < 0) {
      if (tour) { mode = "welcome"; render(); click(); } else idx = 0;
      return;
    }
    if (idx >= SLIDES.length) {
      if (tour) { mode = "about"; render(); click(); } else close();
      return;
    }
    render(); click();
  }

  modal.addEventListener("click", e => {
    const t = e.target;
    if (t === modal || t.classList.contains("introClose") || t.dataset.act === "close") close();
    else if (t.dataset.act === "next") go(1);
    else if (t.dataset.act === "back") go(-1);
    else if (t.dataset.dot !== undefined) { idx = +t.dataset.dot; render(); click(); }
  });
  document.addEventListener("keydown", e => {
    if (modal.classList.contains("hidden")) return;
    if (e.key === "Escape") close();
    if ((mode === "how" || tour) && e.key === "ArrowRight") go(1);
    if ((mode === "how" || tour) && e.key === "ArrowLeft") go(-1);
  });

  document.getElementById("howBtn").addEventListener("click", () => open("how"));
  document.getElementById("aboutBtn").addEventListener("click", () => open("about"));

  // First visit: Welcome > How to Play > About Us (saved in this browser)
  const SEEN_KEY = "sbb_howToPlaySeen";
  try {
    if (!localStorage.getItem(SEEN_KEY)) {
      open("welcome", true, true);
      localStorage.setItem(SEEN_KEY, "1");
    }
  } catch (e) {
    // localStorage blocked (private mode, etc.): skip the auto-open
  }
})();