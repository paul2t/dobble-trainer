import { ref, onMounted } from "vue";
import rawData from "../data/cards.json";

export function useGameAssets() {
  const loadingProgress = ref(0);
  const isLoading = ref(true);

  // Transform JSON into Array
  const deck = Object.keys(rawData)
    .filter((key) => key !== "types")
    .map((key) => ({ ...rawData[key], id: key }));

  const preloadImages = async () => {
    const total = deck.length;
    let loadedCount = 0;

    const promises = deck.map((card) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = new URL(`../assets/cards/${card.file}`, import.meta.url).href;

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
      isLoading.value = false;
    } catch (err) {
      console.error("Failed to load images", err);
      message.value = "Error loading images. Please refresh.";
    }
    return true;
  };

  return {
    deck,
    loadingProgress,
    isLoading,
    preloadImages,
  };
}
