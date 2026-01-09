import { ref, computed, onUnmounted } from 'vue';

export function useTimer() {
    const startTime = ref(null);
    const currentTime = ref(null);
    const accumulatedTime = ref(0);
    const isPaused = ref(true);
    let timerInterval = null;

    // The raw milliseconds used by the StatsBar
    const totalElapsedMs = computed(() => {
        let ms = accumulatedTime.value;
        if (!isPaused.value && startTime.value && currentTime.value) {
            ms += (currentTime.value - startTime.value);
        }
        return ms;
    });

    // Timer update function
    const startTimer = () => {
        currentTime.value = Date.now();
        startTime.value = Date.now();
        isPaused.value = false;
        if (timerInterval) clearInterval(timerInterval);

        timerInterval = setInterval(() => {
            currentTime.value = Date.now();
        }, 1000); // Update every 100ms for a smooth counter
    };
    
    const toggleTimer = () => {
        isPaused.value = !isPaused.value;
        if (isPaused.value) {
            stopTimer();
        } else {
            startTimer();
        }
    };

    const stopTimer = () => {
        accumulatedTime.value += Date.now() - startTime.value;
        startTime.value = null;
        if (timerInterval) clearInterval(timerInterval);
    };

    onUnmounted(stopTimer);

    return {
        isPaused,
        totalElapsedMs,
        startTimer,
        toggleTimer,
        stopTimer
    };
}
