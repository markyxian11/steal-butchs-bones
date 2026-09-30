const SOUND_FILES = {
    snore: "sounds/snore.mp3",
    whine: "sounds/whine.mp3",
    growl: "sounds/growl.mp3",
    bark: "sounds/bark.mp3"
};


const Sound = (() => {

    let ctx = null;
    let muted = false;
    let snoreTimer = null;

    const audio = {};
    const missing = {};
    const stopTimers = {};


    Object.entries(SOUND_FILES).forEach(([name, src]) => {

        const a = new Audio(src);

        a.preload = "auto";

        a.addEventListener("error", () => {
            missing[name] = true;
        });

        audio[name] = a;

    });


    function init() {

        if (!ctx) {
            ctx = new (
                window.AudioContext ||
                window.webkitAudioContext
            )();
        }

        if (ctx.state === "suspended") {
            ctx.resume();
        }

    }


    function tone(
        freq,
        duration,
        type = "sine",
        volume = 0.2,
        delay = 0,
        slideTo = null
    ) {

        if (muted || !ctx) return;

        const time = ctx.currentTime + delay;

        const oscillator = ctx.createOscillator();

        const gain = ctx.createGain();


        oscillator.type = type;

        oscillator.frequency.setValueAtTime(
            freq,
            time
        );


        if (slideTo) {

            oscillator.frequency.exponentialRampToValueAtTime(
                slideTo,
                time + duration
            );

        }


        gain.gain.setValueAtTime(
            volume,
            time
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            time + duration
        );


        oscillator
            .connect(gain)
            .connect(ctx.destination);


        oscillator.start(time);

        oscillator.stop(time + duration);

    }


    function noise(
        duration,
        volume = 0.15,
        cutoff = 400,
        delay = 0
    ) {

        if (muted || !ctx) return;

        const time = ctx.currentTime + delay;

        const length =
            Math.floor(ctx.sampleRate * duration);

        const buffer =
            ctx.createBuffer(
                1,
                length,
                ctx.sampleRate
            );

        const data =
            buffer.getChannelData(0);


        for (let i = 0; i < length; i++) {
            data[i] = Math.random() * 2 - 1;
        }


        const source =
            ctx.createBufferSource();

        const filter =
            ctx.createBiquadFilter();

        const gain =
            ctx.createGain();


        source.buffer = buffer;

        filter.type = "lowpass";

        filter.frequency.value = cutoff;


        gain.gain.setValueAtTime(
            volume,
            time
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            time + duration
        );


        source
            .connect(filter)
            .connect(gain)
            .connect(ctx.destination);


        source.start(time);

    }


    function file(
        name,
        maxMs,
        volume = 0.7
    ) {

        const a = audio[name];

        if (muted) return true;

        if (missing[name] || !a) {
            return false;
        }


        clearTimeout(stopTimers[name]);


        a.loop = false;

        a.currentTime = 0;

        a.volume = volume;


        a.play().catch(() => {
            missing[name] = true;
        });


        stopTimers[name] =
            setTimeout(() => {

                let v = a.volume;

                const fade =
                    setInterval(() => {

                        v -= 0.1;

                        if (v <= 0) {

                            clearInterval(fade);

                            a.pause();

                        } else {

                            a.volume = v;

                        }

                    }, 40);

            }, maxMs);


        return true;
    }


    const effects = {

        pickup: () => {

            tone(
                500,
                0.08,
                "triangle",
                0.15,
                0,
                700
            );

        },


        miss: () => {

            tone(
                160,
                0.18,
                "sine",
                0.25,
                0,
                70
            );

            noise(
                0.1,
                0.1,
                300
            );

        },


        bone: type => {

            if (type === "gold") {

                [880, 1175, 1568].forEach(
                    (frequency, i) => {

                        tone(
                            frequency,
                            0.25,
                            "triangle",
                            0.2,
                            i * 0.09
                        );

                    }
                );

            } else if (type === "blue") {

                [660, 880].forEach(
                    (frequency, i) => {

                        tone(
                            frequency,
                            0.2,
                            "triangle",
                            0.18,
                            i * 0.08
                        );

                    }
                );

            } else {

                tone(
                    660,
                    0.15,
                    "triangle",
                    0.16
                );

            }

        },


        stage1: () => {

            return (
                file("whine", 1500) ||
                tone(
                    700,
                    0.6,
                    "sine",
                    0.15,
                    0,
                    350
                )
            );

        },


        stage2: () => {

            return (
                file("growl", 1500) ||
                (
                    tone(
                        90,
                        0.6,
                        "sawtooth",
                        0.12,
                        0,
                        70
                    ),
                    noise(
                        0.6,
                        0.06,
                        250
                    )
                )
            );

        },


        stage3: () => {

            return (
                file("growl", 2000, 0.85) ||
                (
                    tone(
                        75,
                        0.9,
                        "sawtooth",
                        0.18,
                        0,
                        60
                    ),
                    noise(
                        0.9,
                        0.1,
                        300
                    )
                )
            );

        },


        stage4: () => {

            return (
                file("bark", 2000, 1) ||
                [0, 0.25].forEach(delay => {

                    tone(
                        220,
                        0.18,
                        "sawtooth",
                        0.25,
                        delay,
                        110
                    );

                    noise(
                        0.18,
                        0.2,
                        900,
                        delay
                    );

                })
            );

        },


        win: () => {

            [523, 659, 784, 1047].forEach(
                (frequency, i) => {

                    tone(
                        frequency,
                        0.3,
                        "triangle",
                        0.22,
                        i * 0.13
                    );

                }
            );

        },


        lose: () => {

            [400, 330, 260, 190].forEach(
                (frequency, i) => {

                    tone(
                        frequency,
                        0.3,
                        "sawtooth",
                        0.14,
                        i * 0.16
                    );

                }
            );

        },


        tick: () => {

            tone(
                1000,
                0.05,
                "square",
                0.08
            );

        },


        formError: () => {

            tone(
                200,
                0.15,
                "square",
                0.12
            );

            tone(
                160,
                0.2,
                "square",
                0.12,
                0.12
            );

        },


        formSuccess: () => {

            [660, 880].forEach(
                (frequency, i) => {

                    tone(
                        frequency,
                        0.2,
                        "triangle",
                        0.2,
                        i * 0.1
                    );

                }
            );

        },


        achievement: () => {

            [660, 880, 1100, 1320].forEach(
                (frequency, i) => {

                    tone(
                        frequency,
                        0.18,
                        "triangle",
                        0.2,
                        i * 0.08
                    );

                }
            );

        },


        butchClick: () => {

            tone(
                130,
                0.12,
                "sawtooth",
                0.2
            );

            tone(
                90,
                0.18,
                "sawtooth",
                0.18,
                0.1
            );

        }

    };


    function snoreOn() {

        if (muted || snoreTimer) return;


        if (!missing.snore) {

            const a = audio.snore;

            a.loop = true;

            a.volume = 0.25;

            a.play().catch(() => {
                missing.snore = true;
            });

        }


        if (missing.snore) {

            const snore = () => {

                noise(
                    1.1,
                    0.08,
                    220
                );

                tone(
                    70,
                    1.1,
                    "sine",
                    0.05,
                    0,
                    55
                );

            };


            snore();

            snoreTimer =
                setInterval(
                    snore,
                    3200
                );

        }

    }


    function snoreOff() {

        audio.snore.pause();

        clearInterval(snoreTimer);

        snoreTimer = null;

    }


    return {

        init,

        play: (name, arg) => {

            if (ctx || name) {

                if (effects[name]) {
                    effects[name](arg);
                }

            }

        },

        snoreOn,

        snoreOff,

        stopAll: () => {

            snoreOff();

            Object.keys(audio).forEach(
                key => audio[key].pause()
            );

        },

        toggleMute: () => {

            muted = !muted;

            if (muted) {
                Sound.stopAll();
            }

            return muted;

        },

        isMuted: () => muted

    };

})();