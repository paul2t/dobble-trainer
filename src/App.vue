<script setup>
import { ref, computed, onMounted } from 'vue';
import DobbleCard from './components/DobbleCard.vue';
import rawData from './data/cards.json';

// --- STATE ---
const score = ref(0);
const message = ref("Find the matching symbol!");
const cardLeft = ref(null);
const cardRight = ref(null);

// Transform JSON object (card01, card02) into an Array for easier handling
// We exclude the "types" key from the deck
const deck = Object.keys(rawData)
  .filter(key => key !== 'types')
  .map(key => ({ ...rawData[key], id: key }));

const allCards = ref(deck);

// --- GAME LOGIC ---

const getRandomCard = () => {
  const randomIndex = Math.floor(Math.random() * allCards.value.length);
  return allCards.value[randomIndex];
};

const initGame = () => {
  // Pick two random initial cards
  let c1 = getRandomCard();
  let c2 = getRandomCard();
  
  // Ensure they aren't the same
  while (c1.id === c2.id) {
    c2 = getRandomCard();
  }
  
  cardLeft.value = c1;
  cardRight.value = c2;
  score.value = 0;
};

// Check if the two currently displayed cards have this symbol type
const validateMatch = (clickedType) => {
  // Find symbols on both cards
  const leftHasIt = cardLeft.value.symbols.some(s => s.type === clickedType);
  const rightHasIt = cardRight.value.symbols.some(s => s.type === clickedType);

  return leftHasIt && rightHasIt;
};

const handleCardClick = (clickedType, side) => {
  if (validateMatch(clickedType)) {
    // 1. Increment Score
    score.value++;
    message.value = "Nice match! +1 Point";

    // 2. Perform the Swap Logic
    // Logic: "The card I clicked is replaced by the other one, 
    // and the other one is replaced by another random card."
    
    const otherCard = side === 'left' ? cardRight.value : cardLeft.value;
    const newRandom = getRandomCard();

    // The clicked slot gets the "other" card
    if (side === 'left') {
      cardLeft.value = otherCard;
      cardRight.value = newRandom;
    } else {
      cardRight.value = otherCard;
      cardLeft.value = newRandom;
    }

  } else {
    // Wrong click
    message.value = "Ouch! No match there.";
    score.value = Math.max(0, score.value - 1); // Optional penalty
  }
};

// Start game on load
onMounted(() => {
  initGame();
});

</script>

<template>
  <div class="game-board">
    <header>
      <h1>Dobble Trainer</h1>
      <div class="stats">
        <span class="score">Score: {{ score }}</span>
        <span class="msg">{{ message }}</span>
      </div>
    </header>

    <main v-if="cardLeft && cardRight">
      <div class="split-view">
        
        <div class="card-wrapper">
          <DobbleCard 
            :card-data="cardLeft" 
            :card-id="cardLeft.id"
            @symbol-click="(type) => handleCardClick(type, 'left')"
          />
        </div>

        <div class="card-wrapper">
          <DobbleCard 
            :card-data="cardRight" 
            :card-id="cardRight.id"
            @symbol-click="(type) => handleCardClick(type, 'right')"
          />
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
</style>
