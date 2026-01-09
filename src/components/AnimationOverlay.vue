<script setup>
import { ref } from 'vue';
import DobbleCard from './DobbleCard.vue';


const props = defineProps({
  animationDirection: String,
  animatingCard: Object,
  animationStyle: Object,
});

// Animation states
const animationStyle = ref({}); // For positioning the card exactly
</script>

<template>
  <!-- Carte en animation avec position calculée -->
  <div v-if="animatingCard" class="animating-card-overlay" :style="animationStyle">
    <div class="animating-card-content">
      <DobbleCard :card-data="animatingCard" card-id="animating" />
    </div>
  </div>
</template>

<style scoped>
</style>
