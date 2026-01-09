<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import DobbleCard from './components/DobbleCard.vue';
import rawData from './data/cards.json';

// --- STATE ---
const isLoading = ref(true);
const loadingProgress = ref(0);
const score = ref(0);
const message = ref("Find the matching symbol!");
const cardLeft = ref(null);
const cardRight = ref(null);
const startTime = ref(null);
const currentTime = ref(null);
const mistakes = ref(0);
const isShaking = ref(false);

// Animation states
const animatingCard = ref(null);
const animationDirection = ref(null);
const isAnimating = ref(false);
const animationStyle = ref({}); // For positioning the card exactly

// Refs for the wrappers
const leftCardWrapper = ref(null);
const rightCardWrapper = ref(null);

const accuracy = computed(() => {
  const totalAttempts = score.value + mistakes.value;
  if (totalAttempts === 0) return 100;
  return Math.round((score.value / totalAttempts) * 100);
});

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

// --- GAME LOGIC ---
const getRandomCard = () => {
  const randomIndex = Math.floor(Math.random() * deck.length);
  return {
    ...deck[randomIndex],
    rotation: Math.floor(Math.random() * 360),
  };
};

// Calculate Cards Per Minute (CPM)
const cardsPerMinute = computed(() => {
  if (!startTime.value || !currentTime.value || score.value === 0) return 0;
  
  const elapsedSeconds = (currentTime.value - startTime.value) / 1000;
  if (elapsedSeconds < 3) return 0; // Wait 3 seconds for a stable reading
  
  const elapsedMinutes = elapsedSeconds / 60;
  return (score.value / elapsedMinutes).toFixed(1);
});

let timerInterval = null;
// Timer update function
const startTimer = () => {
  startTime.value = Date.now();
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    currentTime.value = Date.now();
  }, 1000); // Update every 100ms for a smooth counter
};

const formatTime = computed(() => {
  if (!startTime.value || !currentTime.value) return "00:00";
  const seconds = Math.floor((currentTime.value - startTime.value) / 1000);
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
});

const initGame = () => {
  let c1 = getRandomCard();
  let c2 = getRandomCard();
  while (c1.id === c2.id) { c2 = getRandomCard(); }
  cardLeft.value = c1;
  cardRight.value = c2;

  startTimer();
};

const triggerShake = () => {
  isShaking.value = true;
  setTimeout(() => {
    isShaking.value = false;
  }, 300); // Duration of the animation
};

const handleCardClick = async (clickedType, side) => {
  if (isAnimating.value) return;

  const leftHasIt = cardLeft.value.symbols.some(s => s.type === clickedType);
  const rightHasIt = cardRight.value.symbols.some(s => s.type === clickedType);

  if (leftHasIt && rightHasIt) {
    isShaking.value = false;
    score.value++;
    message.value = "Nice match!";

    isAnimating.value = true;
    const clickedCard = side === 'left' ? cardLeft.value : cardRight.value;
    const otherCard = side === 'left' ? cardRight.value : cardLeft.value;

    animatingCard.value = clickedCard;
    animationDirection.value = side === 'left' ? 'left-to-right' : 'right-to-left';

    // Computer the exact position of the source card
    await nextTick();
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

    // show the new card
    let newRandom = getRandomCard();
    while (newRandom.id === cardLeft.value.id || newRandom.id === cardRight.value.id) {
      newRandom = getRandomCard();
    }

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
  } else {
    mistakes.value++;
    message.value = "No match there!";
    triggerShake();
  }
};

onMounted(() => {
  preloadImages();
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
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

    <header v-if="!isLoading">
      <h1>Dobble Trainer</h1>
      <div class="stats">
        <div class="stats-bar">
          <div class="stat-item">
            <span class="label">SPEED</span>
            <span class="value">{{ cardsPerMinute }} <small>CPM</small></span>
          </div>
          <div class="stat-item">
            <span class="label">ACCURACY</span>
            <span class="value">{{ accuracy }}%</span>
          </div>
          <div class="stat-item score-main">
            <span class="label">SCORE</span>
            <span class="value">{{ score }}</span>
          </div>
          <div class="stat-item">
            <span class="label">MISTAKES</span>
            <span class="value error-text">{{ mistakes }}</span>
          </div>
          <div class="stat-item">
            <span class="label">TIME</span>
            <span class="value">{{ formatTime }}</span>
          </div>
        </div>
        <span class="msg">{{ message }}</span>
      </div>
    </header>

    <main v-if="!isLoading && cardLeft && cardRight">
      <div class="split-view" :class="{ 'shake-animation': isShaking }">
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

.score {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  display: block;
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

.stats-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  margin-bottom: 10px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  text-align: center;
}

.stat-item .label {
  font-size: 0.7rem;
  color: #888;
  letter-spacing: 1px;
  font-weight: bold;
}

.stat-item .value {
  font-size: 1.4rem;
  font-weight: 800;
  color: #2c3e50;
}

.score-main .value {
  color: #3498db;
  font-size: 2rem;
}

.error-text {
  color: #e74c3c !important;
}

small {
  font-size: 0.8rem;
  font-weight: normal;
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
