<script setup>

const props = defineProps({
  loadingProgress: Number,
  isLoading: Boolean,
});

</script>


<template>
  <Transition name="fade">
    <div class="loader-overlay" v-if="isLoading">
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
</template>


<style scoped>
/* Transition Effect */
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-leave-to {
  opacity: 0;
}

/* Loader Styles */
.loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
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
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>