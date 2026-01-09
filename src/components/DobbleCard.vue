<script setup>
import { computed } from 'vue';

const props = defineProps({
  cardData: { type: Object, required: true },
  cardId: { type: String, required: true }
});

const emit = defineEmits(['symbol-click']);

// CONFIGURATION: Update this to match your actual image resolution in pixels
const ORIGINAL_IMG_SIZE = 672;

// Helper to convert pixels to percentage for responsiveness
const getStyle = (box) => {
  const left = (box.x / ORIGINAL_IMG_SIZE) * 100;
  const top = (box.y / ORIGINAL_IMG_SIZE) * 100;
  const width = (box.w / ORIGINAL_IMG_SIZE) * 100;
  const height = (box.h / ORIGINAL_IMG_SIZE) * 100;

  return {
    left: `${left}%`,
    top: `${top}%`,
    width: `${width}%`,
    height: `${height}%`,
  };
};

// Handle image path resolution (works with Vite/Webpack)
const getImageUrl = (filename) => {
  return new URL(`../assets/cards/${filename}`, import.meta.url).href;
};
</script>

<template>
  <div 
    class="card-container" 
    :style="{ transform: `rotate(${cardData.rotation}deg)` }"
  >
    <img 
      :src="getImageUrl(cardData.file)" 
      class="card-image" 
      alt="Game Card"
    />

    <div
      v-for="(symbol, index) in cardData.symbols"
      :key="index"
      class="hitbox"
      :style="getStyle(symbol.bounding_box)"
      @click.stop="emit('symbol-click', symbol.type)"
    ></div>
  </div>
</template>

<style scoped>
.card-container {
  position: relative;
  
  /* CHANGED: This logic keeps it square but prevents it from overflowing */
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: 1 / 1;
  
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  background: white;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.hitbox {
  position: absolute;
  cursor: pointer;
  z-index: 10;
  border-radius: 50%;
  /* Remove default mobile tap highlight color */
  -webkit-tap-highlight-color: transparent; 
}

/* Only apply hover effects on devices that support hover (Mouse) */
@media (hover: hover) {
  .hitbox:hover {
    background-color: rgba(255, 255, 0, 0.2);
  }
}

/* Apply a "pressed" effect on both touch and click */
.hitbox:active {
  background-color: rgba(255, 255, 0, 0.4);
  transform: scale(1.1);
  transition: transform 0.1s;
}

/* Prevent text selection */
.card-container,
.card-image,
.hitbox {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
}

</style>
