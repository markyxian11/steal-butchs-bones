/* ===== COIN REWARDS =====
   Classic Mode: coins per bone stolen + a bonus for winning, paid when the game ends.
   Card Mode: coins paid each time a card is completed (by card size). */
const COIN_REWARDS = {
  bone: { white: 2, blue: 5, gold: 10 },                 // Classic: per bone stolen
  winBonus: 20,                                          // Classic: extra coins for a win
  card: { small: 5, medium: 10, large: 20, bonus: 15 }   // Card Mode: per card finished
};

const Coin = (() => {

  // load the coin pictures once, so they never pop in late
  for (let i = 1; i <= 6; i++) new Image().src = `images/coins/coin_spin${i}.png`;
  for (let i = 1; i <= 4; i++) new Image().src = `images/coins/coin_pile${i}.png`;
  new Image().src = "images/coins/coin.png";

  // bigger reward = bigger pile (1 = tall stack, 2 = small stack, 3 = small pile, 4 = big pile)
  function pileFor(n) {
    return n >= 40 ? 4 : n >= 20 ? 1 : n >= 10 ? 2 : 3;
  }

  function add(n) {
    coins += n;
    updateCoinDisplay();
  }

  // inArena = true: shows in the middle of the arena (Card Mode)
  // inArena = false: shows over the whole screen (Classic results)
  function popup(n, label, inArena) {
    const box = document.createElement("div");
    box.className = "coinPop" + (inArena ? " inArena" : "");
    box.innerHTML =
      `<div class="coinPopArt">` +
        `<div class="coinGlow"></div>` +
        `<img class="coinPile" src="images/coins/coin_pile${pileFor(n)}.png" alt="">` +
        `<i class="spark" style="left:2px;top:10px;animation-delay:0s"></i>` +
        `<i class="spark" style="right:4px;top:0;animation-delay:.25s"></i>` +
        `<i class="spark" style="left:12px;bottom:4px;animation-delay:.5s"></i>` +
        `<i class="spark" style="right:10px;bottom:8px;animation-delay:.75s"></i>` +
      `</div>` +
      `<div class="coinPopText"><img class="coinSpin" src="images/coins/coin_spin1.png" alt="coins"> +${n}</div>` +
      `<div class="coinPopLabel">${label}</div>`;
    (inArena ? arena : document.body).appendChild(box);

    // the small coin next to the number spins
    const spin = box.querySelector(".coinSpin");
    let frame = 1;
    const timer = setInterval(() => {
      frame = (frame % 6) + 1;
      spin.src = `images/coins/coin_spin${frame}.png`;
    }, 90);

    Sound.play("coin");
    setTimeout(() => { clearInterval(timer); box.remove(); }, 1600);
  }

  return {

    // Card Mode: called when a card is completed (key like "small1", "large2", "bonus")
    cardReward(key) {
      const size = key.replace(/\d+$/, "");
      const n = COIN_REWARDS.card[size] || 0;
      if (!n) return;
      state.coinsEarned = (state.coinsEarned || 0) + n;
      add(n);
      setTimeout(() => {
        if (state && !state.over) popup(n, `CARD DONE! +${CARD_BONUS_TIME}s`, true);
      }, 600);
    },

    // Classic Mode: called once when the game ends
    endGame(win) {
      if (state.mode === "cards") return;   // Card Mode already paid per card
      const n = (state.coinPot || 0) + (win ? COIN_REWARDS.winBonus : 0);
      state.coinsEarned = n;
      if (!n) return;
      add(n);
      setTimeout(() => popup(n, win ? "Heist reward + win bonus" : "Heist reward", false), 900);
    }
  };
})();