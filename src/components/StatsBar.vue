<script setup>
import { computed } from 'vue';

const props = defineProps({
  score: Number,
  scoreUnPaused: Number,
  mistakes: Number,
  isPaused: Boolean,
  elapsedMs: Number // We pass the total milliseconds calculated in App
});

const emit = defineEmits(['toggle-pause']);


const formatTime = computed(() => {
    let totalMs = props.elapsedMs;
    const seconds = Math.floor(totalMs / 1000);
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
});

const cardsPerMinute = computed(() => {
    if (props.elapsedMs < 3000 || props.scoreUnPaused === 0) return 0;
    const totalMinutes = props.elapsedMs / 1000 / 60;
    return (props.scoreUnPaused / totalMinutes).toFixed(1);
});

const accuracy = computed(() => {
    const total = props.score + props.mistakes;
    return total === 0 ? 100 : Math.round((props.score / total) * 100);
});
</script>

<template>
    <div class="stats-bar clickable" @click="emit('toggle-pause')">
        <div class="stat-item" v-if="!isPaused || elapsedMs > 0" >
            <span class="label">CPM</span>
            <span class="value">{{ cardsPerMinute }}</span>
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
        <div class="stat-item" v-if="!isPaused || elapsedMs > 0" >
            <span class="label">TIME</span>
            <span class="value timer-display">{{ formatTime }}</span>
        </div>
    </div>
</template>

<style scoped>
    
.stats-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  margin-bottom: 10px;
  user-select: none;
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

.is-paused {
  background: #f8f9fa;
}

.clickable {
  cursor: pointer;
  border-left: 1px solid #eee;
  transition: opacity 0.2s;
}
.clickable:hover {
  opacity: 0.7;
}

.timer-display {
  font-family: monospace; /* Keeps numbers from jumping */
  color: #3498db;
}

@media (max-width: 480px) {
  .value { font-size: 1rem; }
  .score-main .value { font-size: 1.4rem; }
}

small {
  font-size: 0.8rem;
  font-weight: normal;
}


</style>