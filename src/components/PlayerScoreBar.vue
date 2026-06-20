<script setup>
defineProps({
  label: { type: String, required: true },
  score: { type: Number, required: true },
  mistakes: { type: Number, default: 0 },
  target: { type: Number, default: 0 },
  rotated: { type: Boolean, default: false },
  isWinner: { type: Boolean, default: false },
});
</script>

<template>
  <div class="player-bar" :class="{ rotated, winner: isWinner }">
    <span class="p-label">{{ label }}</span>
    <span class="p-score">{{ score }}</span>
    <span v-if="target" class="p-target">/ {{ target }}</span>
    <span class="p-mistakes">✕ {{ mistakes }}</span>
  </div>
</template>

<style scoped>
.player-bar {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 10px;
  background: white;
  padding: 8px 15px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  user-select: none;
}

/* Flip so the top player reads it right-way-up from their side */
.player-bar.rotated {
  transform: rotate(180deg);
}

.player-bar.winner {
  background: #eafaf1;
  box-shadow: 0 0 0 2px #2ecc71;
}

.p-label {
  font-size: 0.7rem;
  color: #888;
  letter-spacing: 1px;
  font-weight: bold;
}

.p-score {
  font-size: 2rem;
  font-weight: 800;
  color: #3498db;
}

.p-target {
  font-size: 1rem;
  font-weight: 700;
  color: #aaa;
}

.p-mistakes {
  font-size: 0.9rem;
  font-weight: 700;
  color: #e74c3c;
}
</style>
