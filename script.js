/* =========================================================
   STEAL BUTCH'S BONES
   ========================================================= */


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


$("agree").addEventListener(
    "change",
    () =>
        showError(
            "agreeError",
            ""
        )
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
                data.get("difficulty")

        };


        Sound.init();

        Sound.play("formSuccess");


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


    arena
        .querySelectorAll(".bone")
        .forEach(
            bone => bone.remove()
        );


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


    updateHud();

    updateWake();

    updateCombo();


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

    const arenaRect =
        arena.getBoundingClientRect();


    const bowlRect =
        bowl.getBoundingClientRect();


    const slots = [];


    for (let row = 0; row < 2; row++) {

        for (let col = 0; col < 4; col++) {

            slots.push([
                col,
                row
            ]);

        }

    }


    slots.sort(
        () => Math.random() - 0.5
    );


    BONE_LIST.forEach(
        (type, index) => {

            const bone =
                BONES[type];


            const element =
                document.createElement("img");


            element.src =
                bone.img;


            element.alt =
                bone.name;


            element.className =
                `bone bone-${type}`;


            element.draggable = false;


            element.dataset.type =
                type;


            element.style.width =
                `${bone.width}px`;


            const [col, row] =
                slots[index];


            const x =
                bowlRect.left -
                arenaRect.left +
                20 +
                col *
                ((bowlRect.width - 100) / 3);


            const y =
                bowlRect.top -
                arenaRect.top +
                20 +
                row * 44 +
                Math.random() * 8;


            element.style.left =
                `${x}px`;


            element.style.top =
                `${y}px`;


            element.style.setProperty(
                "--rotation",
                `${Math.round(
                    Math.random() * 40 - 20
                )}deg`
            );


            element.addEventListener(
                "pointerdown",
                event =>
                    grab(
                        event,
                        element
                    )
            );


            arena.appendChild(
                element
            );

        }
    );

}


/* =========================
   GRAB BONE
   ========================= */

function grab(event, element) {

    if (!state || state.over) {
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

function move(event) {

    const drag =
        state.drag;


    if (!drag || state.over) {
        return;
    }


    const now =
        performance.now();


    const dt =
        Math.max(
            now - drag.lt,
            1
        );


    let speed =
        Math.hypot(
            event.clientX - drag.lx,
            event.clientY - drag.ly
        ) / dt;


    speed *= drag.control;


    drag.maxSpeed =
        Math.max(
            drag.maxSpeed,
            speed
        );


    state.currentDragMaxSpeed =
        Math.max(
            state.currentDragMaxSpeed,
            speed
        );


    drag.lx =
        event.clientX;


    drag.ly =
        event.clientY;


    drag.lt =
        now;


    /* FAST MOVEMENT = NOISE */

    if (speed > SAFE_SPEED) {

        const noiseAmount =
            (speed - SAFE_SPEED) *
            MOVE_GAIN *
            state.cfg.sensitivity *
            drag.risk *
            10;


        addWake(noiseAmount);


        state.currentDragWake +=
            noiseAmount;


        /* BLUE BONE = EXTRA NOISE */

        if (drag.type === "blue") {

            const extra =
                noiseAmount * 0.20;


            addWake(extra);

            state.currentDragWake +=
                extra;

        }

    }


    const arenaRect =
        arena.getBoundingClientRect();


    let targetX =
        event.clientX -
        arenaRect.left -
        drag.dx;


    let targetY =
        event.clientY -
        arenaRect.top -
        drag.dy;


    /* GOLD BONE = HEAVY */

    const follow =
        drag.type === "gold"
            ? 0.72
            : 1;


    let x =
        drag.el.offsetLeft +
        (targetX - drag.el.offsetLeft) *
        follow;


    let y =
        drag.el.offsetTop +
        (targetY - drag.el.offsetTop) *
        follow;


    /* BLUE BONE = SLIPPERY */

    if (drag.type === "blue") {

        x +=
            Math.sin(now / 75) *
            1.2;

    }


    x =
        Math.min(
            Math.max(x, 0),
            arenaRect.width -
            drag.el.offsetWidth
        );


    y =
        Math.min(
            Math.max(y, 0),
            arenaRect.height -
            drag.el.offsetHeight
        );


    drag.el.style.left =
        `${x}px`;


    drag.el.style.top =
        `${y}px`;

}


/* =========================
   DROP BONE
   ========================= */

function drop() {

    const drag =
        state.drag;


    if (!drag) {
        return;
    }


    drag.el.classList.remove(
        "drag"
    );


    drag.el.onpointermove =
        null;

    drag.el.onpointerup =
        null;

    drag.el.onpointercancel =
        null;


    if (
        drag.el.hasPointerCapture?.(
            drag.pointerId
        )
    ) {

        try {

            drag.el.releasePointerCapture(
                drag.pointerId
            );

        } catch {}

    }


    state.drag = null;


    if (state.over) {
        return;
    }


    const boneRect =
        drag.el.getBoundingClientRect();


    const basketRect =
        basket.getBoundingClientRect();


    const centerX =
        boneRect.left +
        boneRect.width / 2;


    const centerY =
        boneRect.top +
        boneRect.height / 2;


    const insideBasket =
        centerX > basketRect.left &&
        centerX < basketRect.right &&
        centerY > basketRect.top &&
        centerY < basketRect.bottom;


    if (insideBasket) {

        handleSuccessfulSteal(
            drag,
            boneRect,
            basketRect
        );

    } else {

        /* MISSED BASKET */

        addWake(
            3 *
            state.cfg.sensitivity *
            drag.risk
        );


        breakCombo();


        Sound.play("miss");


        showFloatingText(
            "MISS! +NOISE!",
            null,
            null,
            "bad"
        );

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


    Sound.play(
        "bone",
        drag.type
    );


    drag.el.remove();


    updateHud();

    updateCombo();


    /* WIN */

    if (
        state.bones ===
        BONE_LIST.length
    ) {

        unlockAchievement(
            "cleanSweep"
        );


        if (state.wake < 20) {

            unlockAchievement(
                "deepSleeper"
            );

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

    if (state.over) {
        return;
    }


    const now =
        performance.now();


    const dt =
        (now - state.last) /
        1000;


    state.last = now;


    state.time -= dt;


    /* HOLDING BONE CREATES NOISE */

    if (state.drag) {

        const holdNoise =
            HOLD_GAIN *
            state.cfg.sensitivity *
            state.drag.risk *
            dt;


        addWake(
            holdNoise
        );


        state.currentDragWake +=
            holdNoise;

    } else {

        /* BUTCH CALMS DOWN */

        addWake(
            -CALM_RATE * dt
        );

    }


    /* COMBO TIMER */

    if (state.combo > 0) {

        state.comboTimer -= dt;


        if (
            state.comboTimer <= 0
        ) {

            breakCombo();

        }

    }


    /* TIME UP */

    if (state.time <= 0) {

        state.time = 0;

        updateHud();

        endGame(
            false,
            "Time's up!"
        );

        return;

    }


    /* LAST 10 SECOND TICK */

    const seconds =
        Math.ceil(state.time);


    if (
        seconds <= 10 &&
        seconds !== state.sec
    ) {

        Sound.play("tick");

    }


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
        `${state.bones}/${BONE_LIST.length}`;


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
                : "HEIST FAILED!";


        $("resultText")
            .innerHTML = `

                ${reason ||
                "The heist didn't go as planned."}

                <br><br>

                🦴 You stole:
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