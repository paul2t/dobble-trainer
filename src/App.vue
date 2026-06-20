<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import DobbleCard from './components/DobbleCard.vue';
import StatsBar from './components/StatsBar.vue';
import PlayerScoreBar from './components/PlayerScoreBar.vue';
import { useTimer } from './composables/useTimer';
import rawData from './data/cards.json';

// --- STATE ---
const isLoading = ref(true);
const loadingProgress = ref(0);
const score = ref(0);
const scoreUnPaused = ref(0);
const message = ref("Find the matching symbol!");
const cardLeft = ref(null);
const cardRight = ref(null);
const mistakes = ref(0);
const isShaking = ref(false);

// --- TWO-PLAYER STATE ---
const WIN_SCORE = 10;
const playerCount = ref(1); // 1 or 2
// index 0 = top player (left card), index 1 = bottom player (right card)
const players = ref([
  { score: 0, mistakes: 0 },
  { score: 0, mistakes: 0 },
]);
const winner = ref(null); // null while playing, else 0 or 1

// Animation states
const animatingCard = ref(null);
const animationDirection = ref(null);
const isAnimating = ref(false);
const animationStyle = ref({}); // For positioning the card exactly

// Refs for the wrappers
const leftCardWrapper = ref(null);
const rightCardWrapper = ref(null);

// Transform JSON into Array
const deck = Object.keys(rawData)
  .filter(key => key !== 'types')
  .map(key => ({ ...rawData[key], id: key }));

// --- PRELOADING LOGIC ---
const preloadImages = async () => {
  const total = deck.length;
  let loadedCount = 0;

  const promises = deck.map((card) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = new URL(`./assets/cards/${card.file}`, import.meta.url).href;

      img.onload = () => {
        loadedCount++;
        loadingProgress.value = Math.round((loadedCount / total) * 100);
        resolve();
      };
      img.onerror = reject;
    });
  });

  try {
    await Promise.all(promises);
    setTimeout(() => {
      isLoading.value = false;
      initGame();
    }, 100);
  } catch (err) {
    console.error("Failed to load images", err);
    message.value = "Error loading images. Please refresh.";
  }
};

// --- Timer Management ---
const { isPaused, totalElapsedMs, toggleTimer, stopTimer } = useTimer();

// --- GAME LOGIC ---
const getRandomCard = () => {
  const randomIndex = Math.floor(Math.random() * deck.length);
  return {
    ...deck[randomIndex],
    rotation: Math.floor(Math.random() * 360),
  };
};

const initGame = () => {
  let c1 = getRandomCard();
  let c2 = getRandomCard();
  while (c1.id === c2.id) { c2 = getRandomCard(); }
  cardLeft.value = c1;
  cardRight.value = c2;
};

const triggerShake = () => {
  isShaking.value = true;
  setTimeout(() => {
    isShaking.value = false;
  }, 300); // Duration of the animation
};

// Two-player scoring map (cards are stacked, screen in default orientation):
// bottom card (right slot) = Player 1 (index 0),
// top card (left slot)     = Player 2 (index 1).
const playerIndexForSide = (side) => (side === 'left' ? 1 : 0);

const resetTwoPlayer = () => {
  players.value = [
    { score: 0, mistakes: 0 },
    { score: 0, mistakes: 0 },
  ];
  winner.value = null;
  message.value = "Race to " + WIN_SCORE + "!";
  initGame();
};

const setPlayerCount = (n) => {
  playerCount.value = n;
  if (n === 2) {
    resetTwoPlayer();
  } else {
    score.value = 0;
    scoreUnPaused.value = 0;
    mistakes.value = 0;
    winner.value = null;
    message.value = "Find the matching symbol!";
    initGame();
  }
};

const toggleMode = () => {
  setPlayerCount(playerCount.value === 1 ? 2 : 1);
};

const handleCardClick = async (clickedType, side) => {
  if (isAnimating.value) return;
  if (playerCount.value === 2 && winner.value !== null) return;

  const leftHasIt = cardLeft.value.symbols.some(s => s.type === clickedType);
  const rightHasIt = cardRight.value.symbols.some(s => s.type === clickedType);
  const twoPlayer = playerCount.value === 2;
  const pIdx = playerIndexForSide(side);

  if (leftHasIt && rightHasIt) {
    isShaking.value = false;
    if (twoPlayer) {
      players.value[pIdx].score++;
    } else {
      score.value++;
      if (!isPaused.value)
        scoreUnPaused.value++;
    }
    message.value = "Nice match!";

    isAnimating.value = true;
    const clickedCard = side === 'left' ? cardLeft.value : cardRight.value;

    // Measure the source/target positions from the CURRENT DOM, BEFORE the
    // overlay is shown. Swapping the card content doesn't change the wrapper
    // geometry, so measuring up-front is safe and avoids a frame where the
    // overlay renders without its positioning variables.
    const sourceWrapper = side === 'left' ? leftCardWrapper.value : rightCardWrapper.value;
    const targetWrapper = side === 'left' ? rightCardWrapper.value : leftCardWrapper.value;

    if (sourceWrapper && targetWrapper) {
      const sourceRect = sourceWrapper.getBoundingClientRect();
      const targetRect = targetWrapper.getBoundingClientRect();

      animationStyle.value = {
        '--start-x': `${sourceRect.left}px`,
        '--start-y': `${sourceRect.top}px`,
        '--start-width': `${sourceRect.width}px`,
        '--start-height': `${sourceRect.height}px`,
        '--end-x': `${targetRect.left}px`,
        '--end-y': `${targetRect.top}px`,
      };
    }

    // Pick the new card (distinct from both currently displayed cards).
    let newRandom = getRandomCard();
    while (newRandom.id === cardLeft.value.id || newRandom.id === cardRight.value.id) {
      newRandom = getRandomCard();
    }

    // Show the overlay AND swap the clicked slot to the new card in the same
    // synchronous batch. Because animationStyle is already set, the overlay
    // renders with valid coordinates on its first frame (it slides), and the
    // clicked slot never lingers on the old card — preventing the duplicated
    // "same card twice" glitch.
    animatingCard.value = clickedCard;
    animationDirection.value = side === 'left' ? 'left-to-right' : 'right-to-left';

    if (side === 'left') {
      cardLeft.value = newRandom;
    } else {
      cardRight.value = newRandom;
    }

    // wait until the animation is over
    await new Promise(resolve => setTimeout(resolve, 300));

    // Update the other card position
    if (side === 'left') {
      cardRight.value = clickedCard;
    } else {
      cardLeft.value = clickedCard;
    }

    // Reset animation states
    animatingCard.value = null;
    animationDirection.value = null;
    isAnimating.value = false;
    animationStyle.value = {};

    // Declare a winner once the round (and its animation) has resolved.
    if (twoPlayer && players.value[pIdx].score >= WIN_SCORE) {
      winner.value = pIdx;
    }
  } else {
    if (twoPlayer) {
      players.value[pIdx].mistakes++;
      players.value[pIdx].score = Math.max(0, players.value[pIdx].score - 1);
    } else {
      mistakes.value++;
    }
    message.value = "No match there!";
    triggerShake();
  }
};

onMounted(() => {
  preloadImages();
});

onUnmounted(() => {
  stopTimer();
});
</script>

<template>
  <div class="game-board">
    <Transition name="fade">
      <div v-if="isLoading" class="loader-overlay">
        <div class="loader-content">
          <div class="spinner"></div>
          <h2>Loading Cards...</h2>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: loadingProgress + '%' }"></div>
          </div>
          <p>{{ loadingProgress }}%</p>
        </div>
      </div>
    </Transition>

    <!-- Mode toggle: switch between 1 and 2 players -->
    <button v-if="!isLoading" class="mode-toggle" @click="toggleMode">
      {{ playerCount === 1 ? '2P' : '1P' }}
    </button>

    <!-- Single-player stats bar -->
    <header v-if="!isLoading && playerCount === 1">
      <div class="stats">
        <StatsBar
          :score="score"
          :score-un-paused="scoreUnPaused"
          :mistakes="mistakes"
          :is-paused="isPaused"
          :elapsed-ms="totalElapsedMs"
          @toggle-pause="toggleTimer"
        />
      </div>
    </header>

    <!-- Two-player: top player (Player 2), bar rotated to face them -->
    <PlayerScoreBar
      v-if="!isLoading && playerCount === 2"
      label="PLAYER 2"
      :score="players[1].score"
      :mistakes="players[1].mistakes"
      :target="WIN_SCORE"
      :rotated="true"
      :is-winner="winner === 1"
    />

    <main v-if="!isLoading && cardLeft && cardRight">
      <div
        class="split-view"
        :class="{ 'shake-animation': isShaking, 'force-column': playerCount === 2 }"
      >
        <div
          ref="leftCardWrapper"
          class="card-wrapper"
          :class="{ 'card-hidden': animationDirection === 'left-to-right' }"
        >
          <DobbleCard
            :card-data="cardLeft"
            card-id="left"
            @symbol-click="(t) => handleCardClick(t, 'left')"
          />
        </div>
        <div
          ref="rightCardWrapper"
          class="card-wrapper"
          :class="{ 'card-hidden': animationDirection === 'right-to-left' }"
        >
          <DobbleCard
            :card-data="cardRight"
            card-id="right"
            @symbol-click="(t) => handleCardClick(t, 'right')"
          />
        </div>
      </div>

      <!-- Carte en animation avec position calculée -->
      <div
        v-if="animatingCard"
        class="animating-card-overlay"
        :style="animationStyle"
      >
        <div class="animating-card-content">
          <DobbleCard :card-data="animatingCard" card-id="animating" />
        </div>
      </div>
    </main>

    <!-- Two-player: bottom player (Player 1), default screen orientation -->
    <PlayerScoreBar
      v-if="!isLoading && playerCount === 2"
      label="PLAYER 1"
      :score="players[0].score"
      :mistakes="players[0].mistakes"
      :target="WIN_SCORE"
      :is-winner="winner === 0"
    />

    <!-- Winner overlay -->
    <div v-if="!isLoading && playerCount === 2 && winner !== null" class="winner-overlay">
      <div class="winner-card">
        <h2>Player {{ winner + 1 }} wins! 🏆</h2>
        <button class="play-again" @click="resetTwoPlayer">Play again</button>
      </div>
    </div>
  </div>
</template>

<style>
/* Global Resets */
body, html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background: #f0f2f5;
  font-family: sans-serif;
}

.game-board {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  width: 100vw;
  overflow: hidden;
  padding: 10px;
  box-sizing: border-box;
}

header {
  flex: 0 0 auto;
  text-align: center;
  margin-bottom: 10px;
}

.msg {
  color: #666;
  font-size: 0.9rem;
}

main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 0;
  width: 100%;
  position: relative; /* Important pour le positionnement absolu */
}

.split-view {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.card-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  padding: 5px;
  transition: opacity 0.2s ease;
}

/* Carte en animation - Positionnement absolu calculé */
.animating-card-overlay {
  position: fixed;
  top: var(--start-y);
  left: var(--start-x);
  width: var(--start-width);
  height: var(--start-height);
  pointer-events: none;
  z-index: 1000;
  will-change: transform;
  animation: slideCard 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.animating-card-content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

@keyframes slideCard {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(
      calc(var(--end-x) - var(--start-x)),
      calc(var(--end-y) - var(--start-y))
    );
  }
}

/* Mobile / Portrait Mode */
@media (max-aspect-ratio: 1/1) or (max-width: 768px) {
  .split-view {
    flex-direction: column;
  }
}

/* Two-player always stacks the cards so players face each other */
.split-view.force-column {
  flex-direction: column;
}

/* Mode toggle button */
.mode-toggle {
  position: fixed;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  z-index: 1100;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: #3498db;
  color: white;
  font-weight: 800;
  font-size: 0.9rem;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}
.mode-toggle:active {
  transform: translateY(-50%) scale(0.92);
}

/* Winner overlay */
.winner-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1200;
}

.winner-card {
  background: white;
  padding: 30px 40px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.winner-card h2 {
  margin: 0 0 20px;
  color: #2c3e50;
}

.play-again {
  padding: 12px 28px;
  border: none;
  border-radius: 10px;
  background: #2ecc71;
  color: white;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
}
.play-again:active {
  transform: scale(0.96);
}

/* Loader Styles */
.loader-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loader-content {
  text-align: center;
  width: 300px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background: #eee;
  border-radius: 5px;
  overflow: hidden;
  margin-top: 10px;
}

.progress-fill {
  height: 100%;
  background: #3498db;
  transition: width 0.3s ease;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Transition Effect */
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-leave-to {
  opacity: 0;
}

/* Prevent text selection */
.card-container, .card-image, .hitbox {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.shake-animation {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

</style>
