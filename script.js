/* =========================================================
   STEAL BUTCH'S BONES
   ========================================================= */

// --- POWER-UP SYSTEM VARIABLES ---
let coins = 99999; // Starting coins for testing
let activePowerUps = {
    slowTime: false,
    silentGloves: false,
    boneMagnet: false,
    freezeButch: false
};

let powerUpInventory = {
    sleepSpray: 0,
    slowTime: 0,
    silentGloves: 0,
    boneMagnet: 0,
    freezeButch: 0
};

/* =========================
   DIFFICULTY
   ========================= */

const DIFFICULTY = {

    easy: {
        time: 90,
        sensitivity: 0.7
    },

    normal: {
        time: 60,
        sensitivity: 1.0
    },

    hard: {
        time: 45,
        sensitivity: 1.5
    }

};


/* =========================
   BONE TYPES
   ========================= */

const BONES = {

    white: {
        img: "images/bone_white.png",
        width: 46,
        points: 10,
        risk: 1.0,
        control: 1.0,
        name: "White Bone"
    },

    blue: {
        img: "images/bone_blue.png",
        width: 64,
        points: 25,
        risk: 1.5,
        control: 1.28,
        name: "Slippery Bone"
    },

    gold: {
        img: "images/bone_gold.png",
        width: 84,
        points: 50,
        risk: 2.2,
        control: 0.70,
        name: "Heavy Gold Bone"
    }

};


const BONE_LIST = [
    "white",
    "white",
    "white",

    "blue",
    "blue",
    "blue",

    "gold",
    "gold"
];


/* =========================
   GAME SETTINGS
   ========================= */

const SAFE_SPEED = 0.45;

const MOVE_GAIN = 0.25;

const HOLD_GAIN = 1.2;

const CALM_RATE = 4;


/* =========================
   COMBO
   ========================= */

const COMBO_MAX = 5;

const COMBO_TIME = 5;

const BASKET_SLOTS = [
    [38, 34, -15],
    [65, 36,   5],
    [92, 34,  15],
    [50, 22,  -8],
    [80, 22,  10],
    [65, 10,   0],
    [34, 20, -20],
    [96, 20,  20]
];

function addBoneToBasket(type, index) {

    // gagawa ng holder kung wala sa HTML
    let holder = document.getElementById("basketBones");

    if (!holder) {
        holder = document.createElement("div");
        holder.id = "basketBones";
        basket.appendChild(holder);
    }

    Object.assign(holder.style, {
        position: "absolute",
        left: "0",
        top: "0",
        width: "100%",
        height: "100%",
        zIndex: "2",
        pointerEvents: "none",
        display: "block"
    });

    const bone = BONES[type];
    const slot = BASKET_SLOTS[index % BASKET_SLOTS.length];

    const mini = document.createElement("img");

    mini.src = bone.img;
    mini.alt = bone.name;
    mini.className = "basketBone";

    Object.assign(mini.style, {
        position: "absolute",
        width: `${bone.width * 0.6}px`,
        height: "auto",
        left: `${slot[0]}px`,
        top: `${slot[1]}px`,
        margin: "0",
        transform: `translate(-50%, -50%) rotate(${slot[2]}deg)`,
        filter: "drop-shadow(0 2px 2px rgba(0,0,0,.3))",
        animation: "none"
    });

    holder.appendChild(mini);

    basket.classList.remove("bounce");
    void basket.offsetWidth;
    basket.classList.add("bounce");
} 


/* =========================
   PERFECT STEAL
   ========================= */

const PERFECT_MAX_WAKE = 2.5;

const PERFECT_MAX_SPEED = 0.55;

const PERFECT_CENTER_DISTANCE = 42;


/* =========================
   WAKE STAGES
   ========================= */

const STAGES = [

    [
        30,
        "sleeping",
        "Butch is sleeping...",
        "#2e9b3f"
    ],

    [
        60,
        "restless",
        "Butch is getting restless...",
        "#f0b400"
    ],

    [
        80,
        "alert",
        "Butch heard something...",
        "#e07b10"
    ],

    [
        99,
        "almost",
        "Careful! Butch is about to wake up!",
        "#d32f2f"
    ],

    [
        100,
        "awake",
        "BUTCH WOKE UP!",
        "#7a1515"
    ]

];


/* =========================
   ACHIEVEMENTS
   ========================= */

const ACHIEVEMENTS = {

    boneThief: {
        name: "Bone Thief",
        description: "Steal your first bone."
    },

    silentHands: {
        name: "Silent Hands",
        description: "Perform a Perfect Steal."
    },

    gettingGreedy: {
        name: "Getting Greedy",
        description: "Reach a x3 combo."
    },

    masterThief: {
        name: "Master Thief",
        description: "Reach a x5 combo."
    },

    cleanSweep: {
        name: "Clean Sweep",
        description: "Steal every bone in one game."
    },

    goldenGrab: {
        name: "Golden Grab",
        description: "Steal a gold bone."
    },

    thatWasClose: {
        name: "That Was Close!",
        description: "Steal a bone while Butch is at 80%+ wake."
    },

    deepSleeper: {
        name: "Deep Sleeper",
        description: "Finish with Butch below 20% wake."
    },

    noisyThief: {
        name: "Noisy Thief",
        description: "Make Butch reach 50% wake."
    },

    dontTouchButch: {
        name: "Don't Touch Butch!",
        description: "Accidentally click Butch."
    }

};


/* =========================
   DOM
   ========================= */

const $ = id => document.getElementById(id);

const form = $("registerForm");

const nameInput = $("playerName");

const arena = $("arena");

const basket = $("basket");

const bowl = $("bowl");

const butch = $("butch");


let state = null;


/* =========================
   BACKGROUND MUSIC
   ========================= */

const BGM_VOLUME = 0.3;

const INTRO_VOLUME = 0.3;


const bgm =
    new Audio("sounds/game_bg.mp3");

bgm.loop = true;

bgm.volume = BGM_VOLUME;


const intro =
    new Audio("sounds/intro.mp3");

intro.loop = true;

intro.volume = INTRO_VOLUME;


let activeTrack = null;

let bgmMuted = false;


function bgmPlay() {

    introStop();

    activeTrack = "bgm";

    bgm.muted = bgmMuted;

    bgm.currentTime = 0;

    bgm.play().catch(() => {});

}


function bgmStop() {

    if (activeTrack === "bgm") {
        activeTrack = null;
    }

    bgm.pause();

}


function introPlay() {

    bgmStop();

    activeTrack = "intro";

    intro.muted = bgmMuted;

    intro.currentTime = 0;

    intro.play().catch(() => {});

}


function introStop() {

    if (activeTrack === "intro") {
        activeTrack = null;
    }

    intro.pause();

}


function handleFirstInteraction() {

    if (
        activeTrack === "intro" &&
        intro.paused
    ) {
        intro.play().catch(() => {});
    }


    if (
        activeTrack === "bgm" &&
        bgm.paused
    ) {
        bgm.play().catch(() => {});
    }

}


document.addEventListener(
    "pointerdown",
    handleFirstInteraction
);

document.addEventListener(
    "keydown",
    handleFirstInteraction
);


/* =========================
   ACHIEVEMENT STORAGE
   ========================= */

function loadAchievements() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "butchAchievements"
            ) || "{}"
        );

    } catch {

        return {};

    }

}


function getAchievementData() {

    if (state) {
        return state.achievements;
    }

    return loadAchievements();

}


function unlockAchievement(id) {

    if (!ACHIEVEMENTS[id]) {
        return;
    }


    const achievements =
        getAchievementData();


    if (achievements[id]) {
        return;
    }


    achievements[id] = true;


    if (state) {
        state.achievements = achievements;
    }


    localStorage.setItem(
        "butchAchievements",
        JSON.stringify(achievements)
    );


    showAchievementPopup(
        ACHIEVEMENTS[id].name,
        ACHIEVEMENTS[id].description
    );


    Sound.play("achievement");


    renderAchievements();

}


function renderAchievements() {

    const list =
        $("achievementList");


    if (!list) {
        return;
    }


    const unlocked =
        getAchievementData();


    list.innerHTML =
        Object.entries(ACHIEVEMENTS)
            .map(([id, achievement]) => {

                const done =
                    !!unlocked[id];


                return `
                    <div class="achievementItem ${done ? "unlocked" : "locked"}">

                        <div class="achievementIcon">
                            ${done ? "🏆" : "🔒"}
                        </div>

                        <div>
                            <b>${achievement.name}</b>

                            <small>
                                ${achievement.description}
                            </small>
                        </div>

                        <span>
                            ${done ? "UNLOCKED" : "LOCKED"}
                        </span>

                    </div>
                `;

            })
            .join("");


    const count =
        Object.keys(unlocked)
            .filter(
                id =>
                    ACHIEVEMENTS[id] &&
                    unlocked[id]
            )
            .length;


    const total =
        Object.keys(ACHIEVEMENTS).length;


    $("achievementCount").textContent =
        `${count}/${total}`;

}


function showAchievementPopup(
    title,
    description
) {

    const popup =
        document.createElement("div");


    popup.className =
        "achievementPopup";


    popup.innerHTML = `
        <div class="achievementPopupIcon">
            🏆
        </div>

        <div>
            <strong>
                ACHIEVEMENT UNLOCKED!
            </strong>

            <b>
                ${title}
            </b>

            <small>
                ${description}
            </small>
        </div>
    `;


    document.body.appendChild(popup);


    requestAnimationFrame(() => {

        popup.classList.add("show");

    });


    setTimeout(() => {

        popup.classList.remove("show");

        setTimeout(
            () => popup.remove(),
            350
        );

    }, 3000);

}


function toggleAchievements(force) {

    const panel =
        $("achievementPanel");


    const shouldOpen =
        typeof force === "boolean"
            ? force
            : panel.classList.contains("hidden");


    renderAchievements();


    panel.classList.toggle(
        "hidden",
        !shouldOpen
    );

}


/* =========================
   REGISTRATION
   ========================= */

function showError(
    id,
    message,
    input = null
) {

    $(id).textContent = message;


    if (input) {

        input.classList.toggle(
            "invalid",
            !!message
        );

    }

}


function validate(data) {

    let valid = true;


    const name =
        (data.get("playerName") || "")
            .trim();


    if (name.length < 2) {

        showError(
            "nameError",
            "Name must be at least 2 characters.",
            nameInput
        );

        valid = false;

    } else if (name.length > 15) {

        showError(
            "nameError",
            "Name must be 15 characters or less.",
            nameInput
        );

        valid = false;

    } else if (
        !/^[A-Za-z0-9 ]+$/.test(name)
    ) {

        showError(
            "nameError",
            "Use letters, numbers and spaces only.",
            nameInput
        );

        valid = false;

    } else {

        showError(
            "nameError",
            "",
            nameInput
        );

    }


    if (!data.get("difficulty")) {

        showError(
            "difficultyError",
            "Please choose a difficulty."
        );

        valid = false;

    } else {

        showError(
            "difficultyError",
            ""
        );

    }


    /* NEW: game mode check */
    if (!data.get("gameMode")) {

        showError(
            "modeError",
            "Please choose a game mode."
        );

        valid = false;

    } else {

        showError(
            "modeError",
            ""
        );

    }


    if (!$("agree").checked) {

        showError(
            "agreeError",
            "You must tick the box to continue."
        );

        valid = false;

    } else {

        showError(
            "agreeError",
            ""
        );

    }


    return valid;

}

const MODE_INFO = {
  classic: {
    title: "Classic",
    text: "Steal all 8 bones before time runs out.",
    rules: [
      "Win by putting all 8 bones in the basket.",
      "You lose if Butch wakes up or time runs out.",
      "Bigger bones score more but wake Butch more easily."
    ]
  },
  cards: {
    title: "Card Mode",
    text: "Draw a card and steal only the bones shown on it.",
    rules: [
      "Finish a card: +3 seconds.",
      "Wrong bone in the basket: -5 seconds and Butch gets louder.",
      "No finish line: keep drawing cards until time runs out or Butch wakes up."
    ]
  }
};

function showModeInfo(mode) {
  const info = MODE_INFO[mode];
  if (!info) return;
  $("modeInfo").innerHTML =
    `<div class="modeBody"><h3>${info.title}</h3><p>${info.text}</p><ul>` +
    info.rules.map(r => `<li>${r}</li>`).join("") +
    `</ul></div>`;
}


nameInput.addEventListener(
    "input",
    () =>
        showError(
            "nameError",
            "",
            nameInput
        )
);


form
    .querySelectorAll(
        "[name=difficulty]"
    )
    .forEach(radio => {

        radio.addEventListener(
            "change",
            () =>
                showError(
                    "difficultyError",
                    ""
                )
        );

    });


/* NEW: clear the game mode error when a mode is chosen */
form
    .querySelectorAll(
        "[name=gameMode]"
    )
    .forEach(radio => {

        radio.addEventListener(
            "change",
            () => {

                showError(
                    "modeError",
                    ""
                );

                showModeInfo(
                    radio.value
                );

            }
        );

    });


$("agree").addEventListener(
    "change",
    () =>
        showError(
            "agreeError",
            ""
        )
);


/* =========================
   START MENU CLICK SOUNDS
   ========================= */

const MENU_SOUNDS = {
    easy: "menuEasy",
    normal: "menuNormal",
    hard: "menuHard",
    classic: "menuClassic",
    cards: "menuCards"
};


form
    .querySelectorAll(
        "[name=difficulty], [name=gameMode]"
    )
    .forEach(radio => {

        radio.addEventListener(
            "change",
            () => {

                Sound.init();

                Sound.play(
                    MENU_SOUNDS[radio.value]
                );

            }
        );

    });


$("agree").addEventListener(
    "change",
    () => {

        Sound.init();

        Sound.play("menuClick");

    }
);


$("achievementBtn").addEventListener(
    "click",
    () => {

        Sound.init();

        Sound.play("menuClick");

    }
);

form.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const data =
            new FormData(form);


        $("formSuccess").textContent =
            "";


        if (!validate(data)) {

            Sound.init();

            Sound.play("formError");

            return;

        }


        const player = {

            name:
                data
                    .get("playerName")
                    .trim(),

            difficulty:
                data.get("difficulty"),

            mode:
                data.get("gameMode")
        };


        Sound.init();

        Sound.play("menuStart");


        $("formSuccess").textContent =
            `Welcome, ${player.name}! Starting the game...`;


        setTimeout(
            () => startGame(player),
            700
        );

    }
);


/* =========================
   START GAME
   ========================= */

function startGame(player) {

    $("registerScreen")
        .classList
        .add("hidden");


    $("gameScreen")
        .classList
        .remove("hidden");


    $("result")
        .classList
        .add("hidden");


    toggleAchievements(false);

    // Reset Power-Ups for new game
    activePowerUps = { slowTime: false, silentGloves: false, boneMagnet: false, freezeButch: false };


    arena
        .querySelectorAll(".bone")
        .forEach(
            bone => bone.remove()
        );
  const oldBasketBones = document.getElementById("basketBones");
    if (oldBasketBones) oldBasketBones.innerHTML = "";


    const cfg =
        DIFFICULTY[player.difficulty];


    state = {

        player,

        cfg,

        wake: 0,

        score: 0,

        bones: 0,

        time: cfg.time,

        stage: 0,

        sec: 99,

        drag: null,

        over: false,

        last: performance.now(),

        combo: 0,

        comboTimer: 0,

        bestCombo: 0,

        currentDragWake: 0,

        currentDragMaxSpeed: 0,

        achievements:
            loadAchievements(),

        perfectSteals: 0,

        goldStolen: 0,

        butchClicks: 0

    };


    $("hudName").textContent =
        player.name;


    spawnBones();

    state.mode = player.mode;
    state.boneScore = 0;
    if (state.mode === "cards") Cards.start(); else Cards.stop();

    updateHud();

    updateWake();

    updateCombo();
    updateInventoryUI();


    clearInterval(state.timer);

    state.timer =
        setInterval(
            tick,
            100
        );


    Sound.init();

    Sound.snoreOn();

    introStop();

    bgmPlay();

}

/* =========================
   SPAWN BONES
   ========================= */

function spawnBones() {

    /* gumagamit ng offset values: parehong coordinate system ng left/top ng bones */
    const bx = bowl.offsetLeft;
    const by = bowl.offsetTop;
    const bw = bowl.offsetWidth;
    const bh = bowl.offsetHeight;

    const shuffle = list => list.sort(() => Math.random() - 0.5);

    /*
       Loob ng SVG bowl (dark navy oval):
       gitna = (0.50, 0.45), ang laman ay mga y = 0.20 hanggang 0.70
       [x, y] bilang fraction ng bowl
    */
    const SLOTS = [
        [0.20, 0.34], [0.40, 0.34], [0.60, 0.34], [0.80, 0.34],
        [0.20, 0.55], [0.40, 0.55], [0.60, 0.55], [0.80, 0.55]
    ];

    /* gold = malalaki, kaya sa gitnang columns at magkaibang row */
    const goldSlots = [SLOTS[1], SLOTS[6]];

    const others = shuffle(
        SLOTS.filter(slot => !goldSlots.includes(slot))
    );


    BONE_LIST.forEach(type => {

        const bone = BONES[type];

        const [fx, fy] =
            type === "gold"
                ? goldSlots.pop()
                : others.pop();

        const targetX = bx + bw * fx;
        const targetY = by + bh * fy;


        const element = document.createElement("img");

        element.src = bone.img;
        element.alt = bone.name;
        element.className = `bone bone-${type}`;
        element.draggable = false;
        element.dataset.type = type;
        element.style.width = `${bone.width}px`;


        /* i-center gamit ang AKTWAL na laki ng image */
        const place = () => {

            element.style.left =
                `${targetX - element.offsetWidth / 2}px`;

            element.style.top =
                `${targetY - element.offsetHeight / 2}px`;

        };


        arena.appendChild(element);

        place();

        /* ulitin pag tapos mag-load ang image (para tama ang taas) */
        if (!element.complete) {
            element.addEventListener("load", place, { once: true });
        }


        element.style.setProperty(
            "--rotation",
            `${Math.round(Math.random() * 30 - 15)}deg`
        );


        element.addEventListener(
            "pointerdown",
            event => grab(event, element)
        );

    });

}

/* =========================
   GRAB BONE
   ========================= */

function grab(event, element) {

    if (!state || state.over || state.paused) {
        return;
    }


    event.preventDefault();

    event.stopPropagation();


    if (element.setPointerCapture) {

        try {

            element.setPointerCapture(
                event.pointerId
            );

        } catch {}

    }


    const arenaRect =
        arena.getBoundingClientRect();


    const type =
        element.dataset.type;


    const bone =
        BONES[type];


    state.drag = {

        el: element,

        type,

        risk: bone.risk,

        control: bone.control,

        dx:
            event.clientX -
            arenaRect.left -
            element.offsetLeft,

        dy:
            event.clientY -
            arenaRect.top -
            element.offsetTop,

        lx: event.clientX,

        ly: event.clientY,

        lt: performance.now(),

        startWake:
            state.wake,

        maxSpeed: 0,

        pointerId:
            event.pointerId

    };


    state.currentDragWake = 0;

    state.currentDragMaxSpeed = 0;


    element.classList.add("drag");


    Sound.play("pickup");


    element.onpointermove = move;

    element.onpointerup = drop;

    element.onpointercancel = drop;

}


/* =========================
   MOVE BONE
   ========================= */

/* =========================
   MOVE BONE
   ========================= */

function move(event) {
    const drag = state.drag;
    if (!drag || state.over) return;
 
    const now = performance.now();
    const dt = Math.max(now - drag.lt, 1);
 
    const speed = Math.hypot(event.clientX - drag.lx, event.clientY - drag.ly) / dt;
    drag.maxSpeed = Math.max(drag.maxSpeed, speed);
    state.currentDragMaxSpeed = Math.max(state.currentDragMaxSpeed, speed);
 
    drag.lx = event.clientX;
    drag.ly = event.clientY;
    drag.lt = now;
 
    if (speed > SAFE_SPEED) {
        let noise = (speed - SAFE_SPEED) * MOVE_GAIN * state.cfg.sensitivity * drag.risk * 10;
        
        // --- POWER-UP: SILENT GLOVES (100% Silent) ---
        if (activePowerUps.silentGloves) {
            noise = 0; 
        }

        addWake(noise);
        state.currentDragWake += noise;
    }
 
    const arenaRect = arena.getBoundingClientRect();
    const basketRect = basket.getBoundingClientRect(); 
    const targetX = event.clientX - arenaRect.left - drag.dx;
    const targetY = event.clientY - arenaRect.top - drag.dy;
 
    const follow = drag.type === "gold" ? 0.72 : 1;
    let x = drag.el.offsetLeft + (targetX - drag.el.offsetLeft) * follow;
    let y = drag.el.offsetTop + (targetY - drag.el.offsetTop) * follow;
 
    // Keep blue bones slippery normally
    if (drag.type === "blue") {
        x += Math.sin(now / 75) * 1.2;
    }
 
    // --- POWER-UP: BONE MAGNET (Pulls bones to hover over the basket) ---
    if (activePowerUps.boneMagnet) {
        const basketCenterX = basketRect.left - arenaRect.left + (basketRect.width / 2);
        const basketCenterY = basketRect.top - arenaRect.top + (basketRect.height / 2);
        
        // 1. Pull the dragged bone slightly
        x += (basketCenterX - (drag.el.offsetWidth / 2) - x) * 0.08; 
        y += (basketCenterY - (drag.el.offsetHeight / 2) - y) * 0.08;

        // 2. Visually pull the identical bones to hover at the basket
        const allBones = arena.querySelectorAll('.bone');
        allBones.forEach(otherBone => {
            if (otherBone !== drag.el && otherBone.dataset.type === drag.type) {
                let otherX = otherBone.offsetLeft;
                let otherY = otherBone.offsetTop;
                
                otherX += (basketCenterX - (otherBone.offsetWidth / 2) - otherX) * 0.04;
                otherY += (basketCenterY - (otherBone.offsetHeight / 2) - otherY) * 0.04;
                
                otherBone.style.left = `${otherX}px`;
                otherBone.style.top = `${otherY}px`;
            }
        });
    }
 
    x = Math.min(Math.max(x, 0), arenaRect.width - drag.el.offsetWidth);
    y = Math.min(Math.max(y, 0), arenaRect.height - drag.el.offsetHeight);
 
    drag.el.style.left = `${x}px`;
    drag.el.style.top = `${y}px`;
}


/* =========================
   DROP BONE
   ========================= */

function drop() {
    const drag = state.drag;
    if (!drag) return;

    drag.el.classList.remove("drag");
    drag.el.onpointermove = null;
    drag.el.onpointerup = null;
    drag.el.onpointercancel = null;

    if (drag.el.hasPointerCapture?.(drag.pointerId)) {
        try { drag.el.releasePointerCapture(drag.pointerId); } catch {}
    }

    // Save the type we were dragging before clearing the state
    const draggedType = drag.type; 

    state.drag = null;
    if (state.over) return;

    const boneRect = drag.el.getBoundingClientRect();
    const basketRect = basket.getBoundingClientRect();

    const centerX = boneRect.left + boneRect.width / 2;
    const centerY = boneRect.top + boneRect.height / 2;

    // --- POWER-UP: BONE MAGNET ---
    let magnetOffset = activePowerUps.boneMagnet ? 150 : 0;

    const insideBasket =
        centerX > (basketRect.left - magnetOffset) &&
        centerX < (basketRect.right + magnetOffset) &&
        centerY > (basketRect.top - magnetOffset) &&
        centerY < (basketRect.bottom + magnetOffset);

    if (insideBasket) {
        if (state.mode === "cards" && typeof Cards !== 'undefined' && !Cards.accept(draggedType)) {
            Cards.reject(drag.el); 
            breakCombo();          
            return;                
        }

        // 1. Score the bone you were holding
        handleSuccessfulSteal(drag, boneRect, basketRect);

        // 2. Score the extra bones that were hovering over the basket!
        if (activePowerUps.boneMagnet) {
            const allBones = arena.querySelectorAll('.bone');
            allBones.forEach(otherBone => {
                // Only collect bones that matched the type you just dropped
                if (otherBone.dataset.type === draggedType) {
                    const otherRect = otherBone.getBoundingClientRect();
                    const otherCX = otherRect.left + otherRect.width / 2;
                    const otherCY = otherRect.top + otherRect.height / 2;

                    const otherInside =
                        otherCX > (basketRect.left - magnetOffset) &&
                        otherCX < (basketRect.right + magnetOffset) &&
                        otherCY > (basketRect.top - magnetOffset) &&
                        otherCY < (basketRect.bottom + magnetOffset);

                    if (otherInside) {
                        let fakeDrag = {
                            el: otherBone,
                            type: otherBone.dataset.type,
                            risk: BONES[otherBone.dataset.type].risk
                        };
                        
                        if (state.mode === "cards" && typeof Cards !== 'undefined' && !Cards.accept(fakeDrag.type)) {
                            Cards.reject(fakeDrag.el);
                            breakCombo();
                        } else {
                            handleSuccessfulSteal(fakeDrag, otherRect, basketRect);
                        }
                    }
                }
            });
        }

    } else {
        /* MISSED BASKET */
        let missNoise = 3 * state.cfg.sensitivity * drag.risk;

        // --- POWER-UP: SILENT GLOVES ---
        if (activePowerUps.silentGloves) {
            missNoise = 0;
        }

        addWake(missNoise);
        breakCombo();
        Sound.play("miss");
        showFloatingText("MISS! +NOISE!", null, null, "bad");
    }
}


/* =========================
   SUCCESSFUL STEAL
   ========================= */

function handleSuccessfulSteal(
    drag,
    boneRect,
    basketRect
) {

    const bone =
        BONES[drag.type];


    const basketCenterX =
        basketRect.left +
        basketRect.width / 2;


    const basketCenterY =
        basketRect.top +
        basketRect.height / 2;


    const boneCenterX =
        boneRect.left +
        boneRect.width / 2;


    const boneCenterY =
        boneRect.top +
        boneRect.height / 2;


    const centerDistance =
        Math.hypot(
            boneCenterX -
            basketCenterX,

            boneCenterY -
            basketCenterY
        );


    /* PERFECT STEAL */

    const perfect =
        state.currentDragWake <=
            PERFECT_MAX_WAKE &&

        state.currentDragMaxSpeed <=
            PERFECT_MAX_SPEED &&

        centerDistance <=
            PERFECT_CENTER_DISTANCE;


    /* COMBO */

    state.combo =
        Math.min(
            state.combo + 1,
            COMBO_MAX
        );


    state.comboTimer =
        COMBO_TIME;


    state.bestCombo =
        Math.max(
            state.bestCombo,
            state.combo
        );


    let points =
        bone.points *
        state.combo;


    if (perfect) {

        points += 25;

        state.perfectSteals++;


        unlockAchievement(
            "silentHands"
        );


        showFloatingText(
            "PERFECT STEAL! +25",
            null,
            null,
            "perfect"
        );

    } else {

        showFloatingText(
            `+${points} COMBO x${state.combo}`,
            null,
            null,
            "good"
        );

    }


    /* ACHIEVEMENTS */

    if (state.bones === 0) {

        unlockAchievement(
            "boneThief"
        );

    }


    if (drag.type === "gold") {

        state.goldStolen++;

        unlockAchievement(
            "goldenGrab"
        );

    }


    if (state.wake >= 80) {

        unlockAchievement(
            "thatWasClose"
        );

    }


    if (state.combo >= 3) {

        unlockAchievement(
            "gettingGreedy"
        );

    }


    if (state.combo >= 5) {

        unlockAchievement(
            "masterThief"
        );

    }


    state.score += points;

    state.bones++;
    state.boneScore += bone.points;


    Sound.play(
        "bone",
        drag.type
    );


    drag.el.remove();

    addBoneToBasket(
        drag.type,
        (state.bones - 1) % BONE_LIST.length
    );

    updateHud();

    updateCombo();


    /* tell the current card that a right bone was delivered */
    if (state.mode === "cards") {

        /* CARD MODE: keep going, the card decides what to collect */
        Cards.deliver(drag.type);

    } else if (state.bones === BONE_LIST.length) {

        /* CLASSIC MODE: win at 8 bones */
        unlockAchievement("cleanSweep");

        if (state.wake < 20) {
            unlockAchievement("deepSleeper");
        }

        endGame(true);

        }

    }



/* =========================
   BREAK COMBO
   ========================= */

function breakCombo() {

    if (
        !state ||
        state.combo <= 0
    ) {
        return;
    }


    state.combo = 0;

    state.comboTimer = 0;


    updateCombo();

}


/* =========================
   CLICK BUTCH
   ========================= */

function clickButch(event) {

    if (!state || state.over) {
        return;
    }


    event.preventDefault();

    event.stopPropagation();


    state.butchClicks++;


    unlockAchievement(
        "dontTouchButch"
    );


    const penalty =
        Math.min(
            100,
            18 +
            (state.butchClicks - 1) *
            22
        );


    addWake(
        penalty *
        state.cfg.sensitivity
    );


    breakCombo();


    butch.classList.remove(
        "butchHit"
    );


    void butch.offsetWidth;


    butch.classList.add(
        "butchHit"
    );


    showFloatingText(
        state.wake >= 100
            ? "BUTCH WOKE UP!"
            : `HEY! +${Math.round(penalty)} WAKE`,
        null,
        null,
        "bad"
    );


    Sound.play(
        "butchClick"
    );

}


butch.addEventListener(
    "pointerdown",
    clickButch
);


/* =========================
   WAKE SYSTEM
   ========================= */

function addWake(amount) {

    if (!state || state.over) {
        return;
    }

    // --- POWER-UP: FREEZE BUTCH ---
    if (activePowerUps.freezeButch && amount > 0) {
        return;
    }


    const previous =
        state.wake;


    state.wake =
        Math.min(
            100,
            Math.max(
                0,
                state.wake + amount
            )
        );


    if (
        previous < 50 &&
        state.wake >= 50
    ) {

        unlockAchievement(
            "noisyThief"
        );

    }


    updateWake();


    if (state.wake >= 100) {

        endGame(
            false,
            "Butch woke up!"
        );

    }

}


/* =========================
   GAME TIMER
   ========================= */

function tick() {
    if (state.over || state.paused) return;

    const now = performance.now();
    const dt = (now - state.last) / 1000;
    state.last = now;

    // --- POWER-UP: SLOW TIME ---
    let timeModifier = activePowerUps.slowTime ? 0.5 : 1;
    state.time -= (dt * timeModifier);

    /* HOLDING BONE CREATES NOISE */
    if (state.drag) {
        let holdNoise = HOLD_GAIN * state.cfg.sensitivity * state.drag.risk * dt;
        
        // --- POWER-UP: SILENT GLOVES (100% Silent) ---
        if (activePowerUps.silentGloves) {
            holdNoise = 0;
        }

        addWake(holdNoise);
        state.currentDragWake += holdNoise;
    } else {
        /* BUTCH CALMS DOWN */
        addWake(-CALM_RATE * dt);
    }

    /* COMBO TIMER */
    if (state.combo > 0) {
        state.comboTimer -= dt;
        if (state.comboTimer <= 0) breakCombo();
    }

    /* TIME UP */
    if (state.time <= 0) {
        state.time = 0;
        updateHud();
        endGame(false, "Time's up!");
        return;
    }

    const seconds = Math.ceil(state.time);
    if (seconds <= 10 && seconds !== state.sec) Sound.play("tick");
    
    state.sec = seconds;
    updateHud();
    updateCombo();
}


/* =========================
   HUD
   ========================= */

function updateHud() {

    $("hudScore").textContent =
        state.score;


    $("hudBones").textContent =
        state.mode === "cards"
            ? state.bones
            : `${state.bones}/${BONE_LIST.length}`;


    $("hudTime").textContent =
        Math.ceil(state.time);


    $("hudCombo").textContent =
        `x${Math.max(1, state.combo)}`;

}


/* =========================
   COMBO UI
   ========================= */

function updateCombo() {

    const box =
        $("comboBox");


    const text =
        $("comboText");


    const fill =
        $("comboTimerFill");


    if (
        !box ||
        !text ||
        !fill
    ) {
        return;
    }


    if (state.combo >= 2) {

        box.classList.add(
            "active"
        );


        text.textContent =
            `🔥 COMBO x${state.combo}`;


        fill.style.width =
            `${Math.max(
                0,
                (state.comboTimer /
                    COMBO_TIME) *
                    100
            )}%`;

    } else if (
        state.combo === 1
    ) {

        box.classList.add(
            "active"
        );


        text.textContent =
            "COMBO READY x1";


        fill.style.width =
            `${Math.max(
                0,
                (state.comboTimer /
                    COMBO_TIME) *
                    100
            )}%`;

    } else {

        box.classList.remove(
            "active"
        );


        text.textContent =
            "NO COMBO";


        fill.style.width =
            "0%";

    }

}


/* =========================
   WAKE METER UI
   ========================= */

function updateWake() {

    const wake =
        state.wake;


    const stage =
        STAGES.find(
            item =>
                wake <= item[0]
        ) ||
        STAGES[4];


    $("wakeFill").style.width =
        `${wake}%`;


    $("wakeFill").style.background =
        stage[3];


    $("wakeText").textContent =
        `${Math.round(wake)}%`;


    $("wakeMsg").textContent =
        stage[2];


    const stageIndex =
        STAGES.indexOf(stage);


    if (
        stageIndex !==
        state.stage
    ) {

        if (
            stageIndex >
            state.stage
        ) {

            Sound.play(
                `stage${stageIndex}`
            );

        }


        if (stageIndex === 0) {

            Sound.snoreOn();

        } else {

            Sound.snoreOff();

        }


        state.stage =
            stageIndex;

    }


    $("butch").src =
        `images/butch_${stage[1]}.png`;


    $("butchHead").src =
        `images/butch_head_${stage[1]}.png`;

}


/* =========================
   FLOATING TEXT
   ========================= */

function showFloatingText(
    text,
    x,
    y,
    type = "good"
) {

    const element =
        document.createElement("div");


    element.className =
        `floatingText ${type}`;


    element.textContent =
        text;


    if (
        x !== null &&
        y !== null
    ) {

        const arenaRect =
            arena.getBoundingClientRect();


        element.style.left =
            `${x - arenaRect.left}px`;


        element.style.top =
            `${y - arenaRect.top}px`;

    } else {

        element.style.left =
            "50%";


        element.style.top =
            "50%";

    }


    arena.appendChild(
        element
    );


    requestAnimationFrame(
        () =>
            element.classList.add(
                "show"
            )
    );


    setTimeout(
        () => element.remove(),
        1000
    );

}


/* =========================
   GAME OVER
   ========================= */

function endGame(
    win,
    reason = ""
) {

    if (state.over) {
        return;
    }


    state.over = true;


    clearInterval(
        state.timer
    );


    if (state.drag) {

        state.drag.el.classList.remove(
            "drag"
        );

    }


    Sound.snoreOff();

    bgmStop();


    if (win) {

        Sound.play("win");

    } else {

        Sound.play("lose");

    }


    const timeBonus =
        win
            ? Math.ceil(state.time)
            : 0;


    const finalScore =
        state.score +
        timeBonus;

    /* Card Mode shows Bone Score, Classic keeps "You stole" */
    const boneLine =
        state.mode === "cards"
            ? `🦴 Bone Score:
               <b>${state.bones} bones · ${state.boneScore} pts</b>`
            : `🦴 You stole:
               <b>${state.bones}/${BONE_LIST.length}</b>`;


const result =
    $("result");

const box =
    result.querySelector(
        ".box"
    );

const resultButch =
    $("resultButch");


    result.classList.remove(
        "victory",
        "defeat"
    );


    box.classList.remove(
        "victoryAnimation",
        "defeatAnimation"
    );


if (win) {

    resultButch.src =
        "images/butch_head_sleeping.png";

    resultButch.alt =
        "Sleeping Butch";

    resultButch.classList.remove(
        "awake"
    );

    resultButch.classList.add(
        "sleeping"
    );

    result.classList.add(
        "victory"
    );


        box.classList.add(
            "victoryAnimation"
        );


        $("resultTitle")
            .textContent =
            "🎉 PERFECT HEIST! 🎉";


        $("resultText")
            .innerHTML = `

                Nice work,
                <b>${state.player.name}</b>!

                <br><br>

                🦴 Bones stolen:
                <b>
                    ${state.bones}/${BONE_LIST.length}
                </b>

                <br>

                🔥 Best combo:
                <b>
                    x${Math.max(
                        1,
                        state.bestCombo
                    )}
                </b>

                <br>

                🎯 Perfect steals:
                <b>
                    ${state.perfectSteals}
                </b>

                <br><br>

                Score:
                <b>${state.score}</b>

                <br>

                Time bonus:
                <b>+${timeBonus}</b>

                <br>

                Final score:
                <b>${finalScore}</b>

            `;

} else {

    resultButch.src =
        "images/butch_head_awake.png";

    resultButch.alt =
        "Awake Butch";

    resultButch.classList.remove(
        "sleeping"
    );

    resultButch.classList.add(
        "awake"
    );

    result.classList.add(
        "defeat"
    );


        box.classList.add(
            "defeatAnimation"
        );


        $("resultTitle")
            .textContent =
                reason === "Butch woke up!"
                ? "BUTCH CAUGHT YOU!"
                : state.mode === "cards"
                    ? "TIME'S UP!"
                    : "HEIST FAILED!";


        $("resultText")
            .innerHTML = `

                ${reason ||
                "The heist didn't go as planned."}

                <br><br>

                ${boneLine}

                <br>

                🔥 Best combo:
                <b>
                    x${Math.max(
                        1,
                        state.bestCombo
                    )}
                </b>

                <br>

                🎯 Perfect steals:
                <b>
                    ${state.perfectSteals}
                </b>

                <br><br>

                Score:
                <b>${state.score}</b>

            `;

    }


    result.classList.remove(
        "hidden"
    );


    introPlay();

}


/* =========================
   RESTART
   ========================= */

$("restartBtn").addEventListener(
    "click",
    () => {

        startGame(
            state.player
        );

    }
);


/* =========================
   QUIT
   ========================= */

$("quitBtn").addEventListener(
    "click",
    () => {
        
        clearInterval(
            state.timer
        );


        state.over = true;


        Cards.stop();


        Sound.stopAll();

        bgmStop();

        introPlay();


        $("gameScreen")
            .classList
            .add("hidden");


        $("registerScreen")
            .classList
            .remove("hidden");


        $("formSuccess")
            .textContent = "";


        toggleAchievements(
            false
        );

    }
);


/* =========================
   MUTE
   ========================= */

$("muteBtn").addEventListener(
    "click",
    () => {

        const muted =
            Sound.toggleMute();


        bgmMuted =
            muted;


        bgm.muted =
            muted;


        intro.muted =
            muted;


        $("muteBtn")
            .textContent =
            muted
                ? "🔇 Sound off"
                : "🔊 Sound on";


        if (
            !muted &&
            state &&
            !state.over &&
            state.stage === 0
        ) {

            Sound.snoreOn();

        }

    }
);


/* =========================
   ACHIEVEMENT BUTTONS
   ========================= */

$("achievementBtn")
    .addEventListener(
        "click",
        () =>
            toggleAchievements()
    );


$("achievementBtnGame")
    .addEventListener(
        "click",
        () =>
            toggleAchievements()
    );


$("achievementClose")
    .addEventListener(
        "click",
        () =>
            toggleAchievements(false)
    );


/* =========================
   INITIALIZE
   ========================= */

renderAchievements();

introPlay();

/* =========================================================
   🛒 POWER-UP SYSTEM (SHOP & INVENTORY FUNCTIONS)
   ========================================================= */

const shopModal = document.getElementById('powerup-shop-modal');
const closeShopBtn = document.getElementById('close-shop-btn');
const shopCoinCount = document.getElementById('shop-coin-count');

function updateCoinDisplay() {
    if (shopCoinCount) {
        shopCoinCount.innerText = coins; 
    }
}

window.openShop = function() {
    if (shopModal) {
        shopModal.classList.remove('hidden');
        updateCoinDisplay();
    }
};

if (closeShopBtn) {
    closeShopBtn.addEventListener('click', () => {
        shopModal.classList.add('hidden');
    });
}

window.buyPowerUp = function(powerUpType, cost) {
    if (coins >= cost) {
        coins -= cost; 
        updateCoinDisplay(); 
        powerUpInventory[powerUpType]++;
        updateInventoryUI();
    } else {
        alert("Not enough coins!");
    }
};

window.usePowerUp = function(type) {
    if (!state || state.over) return; 

    if (powerUpInventory[type] > 0) {
        powerUpInventory[type]--; 
        updateInventoryUI();      
        activatePowerUp(type);    
        showFloatingText("POWER-UP ACTIVATED!", null, null, "perfect");
    } else {
        console.log("You don't have any of this power-up!");
    }
};

function updateInventoryUI() {
    const qtySleep = document.getElementById('qty-sleep');
    const qtySlow = document.getElementById('qty-slow');
    const qtyGloves = document.getElementById('qty-gloves');
    const qtyMagnet = document.getElementById('qty-magnet');
    const qtyFreeze = document.getElementById('qty-freeze');

    if (qtySleep) qtySleep.innerText = powerUpInventory.sleepSpray;
    if (qtySlow) qtySlow.innerText = powerUpInventory.slowTime;
    if (qtyGloves) qtyGloves.innerText = powerUpInventory.silentGloves;
    if (qtyMagnet) qtyMagnet.innerText = powerUpInventory.boneMagnet;
    if (qtyFreeze) qtyFreeze.innerText = powerUpInventory.freezeButch;
}

function activatePowerUp(type) {
    switch(type) {
        case 'sleepSpray':
            // Instantly lower wake meter by 40%
            if (state && !state.over) {
                state.wake = Math.max(0, state.wake - 40);
                updateWake(); 
                showFloatingText("-40% WAKE!", null, null, "perfect");
            }
            break;
            
        case 'slowTime':
            activePowerUps.slowTime = true;
            showFloatingText("TIME SLOWED!", null, null, "perfect");
            setTimeout(() => { activePowerUps.slowTime = false; }, 10000); // Lasts 10 seconds
            break;
            
        case 'silentGloves':
            activePowerUps.silentGloves = true;
            showFloatingText("100% SILENT!", null, null, "perfect");
            setTimeout(() => { activePowerUps.silentGloves = false; }, 5000); // Lasts 5 seconds
            break;
            
        case 'boneMagnet':
            activePowerUps.boneMagnet = true;
            showFloatingText("MAGNET ACTIVE!", null, null, "perfect");
            // Changed from 10000 to 3000 (3 seconds)
            setTimeout(() => { activePowerUps.boneMagnet = false; }, 3000); 
            break;
            
        case 'freezeButch':
            activePowerUps.freezeButch = true;
            showFloatingText("BUTCH FROZEN!", null, null, "perfect");
            setTimeout(() => { activePowerUps.freezeButch = false; }, 8000); // Lasts 8 seconds
            break;
    }
}

/* =========================
   SVG BOWL (self-contained)
   ========================= */

function buildBowl() {

    if (bowl.querySelector(".bowlSvg")) return;

    Object.assign(bowl.style, {
        background: "none",
        border: "0",
        boxShadow: "none",
        borderRadius: "0"
    });

    bowl.insertAdjacentHTML("afterbegin", `
      <svg class="bowlSvg" viewBox="0 0 400 130" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <radialGradient id="bowlInner" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stop-color="#2c448f"/>
            <stop offset="100%" stop-color="#0f1b4d"/>
          </radialGradient>
          <linearGradient id="bowlBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#22377e"/>
            <stop offset="100%" stop-color="#0c163d"/>
          </linearGradient>
          <linearGradient id="bowlRim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffe27a"/>
            <stop offset="100%" stop-color="#f2a91e"/>
          </linearGradient>
        </defs>

        <ellipse cx="200" cy="116" rx="180" ry="11" fill="#0004"/>

        <path d="M8 56 Q10 106 72 113 Q200 124 328 113 Q390 106 392 56 Z"
              fill="url(#bowlBody)" stroke="#0c163d" stroke-width="4" stroke-linejoin="round"/>

        <ellipse cx="200" cy="54" rx="194" ry="48" fill="url(#bowlRim)" stroke="#a85a0f" stroke-width="4"/>

        <ellipse cx="200" cy="58" rx="170" ry="37" fill="url(#bowlInner)" stroke="#0c163d" stroke-width="3"/>

        <path d="M44 52 Q200 12 356 52" fill="none" stroke="#0007" stroke-width="6" stroke-linecap="round"/>
        <path d="M70 80 Q200 98 330 80" fill="none" stroke="#fff3" stroke-width="3" stroke-linecap="round"/>
        <path d="M40 32 Q110 10 190 8" fill="none" stroke="#fff9" stroke-width="5" stroke-linecap="round"/>
      </svg>
    `);

    Object.assign(bowl.querySelector(".bowlSvg").style, {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: "0"
    });

    const label = bowl.querySelector("span");

    if (label) {
        Object.assign(label.style, {
            zIndex: "1",
            bottom: "2px",
            color: "#ffd34d",
            webkitTextStroke: "3px #0c163d",
            paintOrder: "stroke fill"
        });
    }
}

buildBowl();