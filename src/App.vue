<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import DobbleCard from './components/DobbleCard.vue';
import StatsBar from './components/StatsBar.vue';
import { useTimer } from './composables/useTimer';
import { useGameAssets } from './composables/useGameAssets';
import { useGameLogic } from './composables/useGameLogic';
import { useCardAnimation } from './composables/useCardAnimation';
import GameLoader from './components/GameLoader.vue';
import AnimationOverlay from './components/AnimationOverlay.vue';


// 1. Assets
const { isLoading, loadingProgress, preloadImages } = useGameAssets();

// 2. Logic
const { cardLeft, cardRight, score, scoreUnPaused, mistakes, initGame, handleMatch, getRandomCard } = useGameLogic();

// 3. Time
const { totalElapsedMs, isPaused, toggleTimer } = useTimer();

// 4. Animation logic stays here or in its own helper
const { isAnimating, triggerMove, animatingCard, animationDirection, animationStyle } = useCardAnimation();

const handleCardClick = async (clickedType, side) => {
  if (isAnimating.value) return;

  const leftHasIt = cardLeft.value.symbols.some(s => s.type === clickedType);
  const rightHasIt = cardRight.value.symbols.some(s => s.type === clickedType);

  if (leftHasIt && rightHasIt) {
    isShaking.value = false;
    score.value++;
    if (!isPaused.value)
      scoreUnPaused.value++;
    // message.value = "Nice match!";

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
    // message.value = "No match there!";
    triggerShake();
  }
};

// const handleCardClick = async (type, side) => {
//   if (isAnimating.value) return;

//   // handleMatch(type, side, isPaused, leftCardWrapper, rightCardWrapper, isShaking);

//   const newCard = handleMatch(type, side, isPaused);
//   console.log("new card", newCard);

//   if (newCard) {
//     const clickedCard = side === 'left' ? cardLeft.value : cardRight.value;

//     // 2. Prepare the swap (update the "new" random card immediately)
//     if (side === 'left') cardLeft.value = newCard;
//     else cardRight.value = newCard;

//     // 3. Run the visual animation
//     // We pass the actual DOM elements (refs) to the composable
//     await triggerMove(
//       clickedCard,
//       side,
//       side === 'left' ? leftCardWrapper.value : rightCardWrapper.value,
//       side === 'left' ? rightCardWrapper.value : leftCardWrapper.value
//     );

//     // 4. Finalize the swap: the moving card becomes the new "static" card on the other side
//     if (side === 'left') cardRight.value = clickedCard;
//     else cardLeft.value = clickedCard;

//   } else {
//     triggerShake();
//   }
// };

// --- STATE ---
const isShaking = ref(false);

// Refs for the wrappers
const leftCardWrapper = ref(null);
const rightCardWrapper = ref(null);

// --- GAME LOGIC ---

const triggerShake = () => {
  isShaking.value = true;
  setTimeout(() => {
    isShaking.value = false;
  }, 300); // Duration of the animation
};

onMounted(async () => {
  await preloadImages();
  initGame();
});

</script>

<template>
  <div class="game-board">
    <GameLoader :loading-progress="loadingProgress" :is-loading="isLoading" />
    <template v-if="!isLoading" >
      <StatsBar :score="score" :score-un-paused="scoreUnPaused" :mistakes="mistakes" :is-paused="isPaused"
        :elapsed-ms="totalElapsedMs" @toggle-pause="toggleTimer" />

      <main v-if="cardLeft && cardRight">
        <div class="split-view" :class="{ 'shake-animation': isShaking }">
          <div ref="leftCardWrapper" class="card-wrapper"
            :class="{ 'card-hidden': animationDirection === 'left-to-right' }">
            <DobbleCard :card-data="cardLeft" card-id="left" @symbol-click="(t) => handleCardClick(t, 'left')" />
          </div>
          <div ref="rightCardWrapper" class="card-wrapper"
            :class="{ 'card-hidden': animationDirection === 'right-to-left' }">
            <DobbleCard :card-data="cardRight" card-id="right" @symbol-click="(t) => handleCardClick(t, 'right')" />
          </div>
        </div>
        <AnimationOverlay v-if="isAnimating" :animation-direction="animationDirection" :animating-card="animatingCard" />
      </main>
    </template>
  </div>
</template>

<style>
/* Global Resets */
body,
html {
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

main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 0;
  width: 100%;
  position: relative;
  /* Important pour le positionnement absolu */
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

/* Mobile / Portrait Mode */
@media (max-aspect-ratio: 1/1) or (max-width: 768px) {
  .split-view {
    flex-direction: column;
  }
}

.shake-animation {
  animation: shake 0.5s cubic-bezier(.36, .07, .19, .97) both;
}

@keyframes shake {

  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
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
    transform: translate(calc(var(--end-x) - var(--start-x)),
        calc(var(--end-y) - var(--start-y)));
  }
}
</style>
