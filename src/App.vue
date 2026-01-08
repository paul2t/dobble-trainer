<script setup>
import { ref, onMounted } from 'vue';
import DobbleCard from './components/DobbleCard.vue';
import rawData from './data/cards.json';

// --- STATE ---
const isLoading = ref(true);
const loadingProgress = ref(0);
const score = ref(0);
const message = ref("Find the matching symbol!");
const cardLeft = ref(null);
const cardRight = ref(null);

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
      // Resolve the path correctly for Vite
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
    // Add a tiny delay for smoothness
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
  return deck[randomIndex];
};

const initGame = () => {
  let c1 = getRandomCard();
  let c2 = getRandomCard();
  while (c1.id === c2.id) { c2 = getRandomCard(); }
  cardLeft.value = c1;
  cardRight.value = c2;
};

const handleCardClick = (clickedType, side) => {
  const leftHasIt = cardLeft.value.symbols.some(s => s.type === clickedType);
  const rightHasIt = cardRight.value.symbols.some(s => s.type === clickedType);

  if (leftHasIt && rightHasIt) {
    score.value++;
    message.value = "Nice match!";
    
    const otherCard = side === 'left' ? cardRight.value : cardLeft.value;
    const newRandom = getRandomCard();

    if (side === 'left') {
      cardLeft.value = otherCard;
      cardRight.value = newRandom;
    } else {
      cardRight.value = otherCard;
      cardLeft.value = newRandom;
    }
  } else {
    message.value = "No match there!";
  }
};

onMounted(() => {
  preloadImages();
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
        <span class="score">Score: {{ score }}</span>
        <span class="msg">{{ message }}</span>
      </div>
    </header>

    <main v-if="!isLoading && cardLeft && cardRight">
      <div class="split-view">
        <div class="card-wrapper">
          <DobbleCard :card-data="cardLeft" card-id="left" @symbol-click="(t) => handleCardClick(t, 'left')" />
        </div>
        <div class="card-wrapper">
          <DobbleCard :card-data="cardRight" card-id="right" @symbol-click="(t) => handleCardClick(t, 'right')" />
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
  /* Use dvh (dynamic viewport height) to handle mobile browser bars correctly */
  height: 100dvh; 
  width: 100vw;
  overflow: hidden; /* Prevent scrolling completely */
  padding: 10px;
  box-sizing: border-box;
}

header {
  flex: 0 0 auto; /* Header takes only the space it needs */
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
  flex: 1; /* Takes all remaining vertical space */
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 0; /* CRITICAL: Allows flex container to shrink its children */
  width: 100%;
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
  /* Ensure the wrapper confines the card */
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  padding: 5px;
}

/* Mobile / Portrait Mode */
@media (max-aspect-ratio: 1/1) or (max-width: 768px) {
  .split-view {
    flex-direction: column; /* Stack cards vertically */
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
  transition: opacity 0.1s ease;
}
.fade-leave-to {
  opacity: 0;
}

/* Prevent text selection and context menus on game elements */
.card-container, .card-image, .hitbox {
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none;   /* Safari */
  user-select: none;           /* Standard syntax */
}
</style>
