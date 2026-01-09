import { ref, nextTick } from "vue";

export function useCardAnimation() {
  const animatingCard = ref(null);
  const animationStyle = ref({});
  const isAnimating = ref(false);const animationDirection = ref(null);

  const triggerMove = async (cardToAnimate, side, sourceRef, targetRef) => {
    isAnimating.value = true;
    animatingCard.value = cardToAnimate;
    animationDirection.value = side === 'left' ? 'left-to-right' : 'right-to-left';

    await nextTick();

    if (sourceRef && targetRef) {
      const sourceRect = sourceRef.getBoundingClientRect();
      const targetRect = targetRef.getBoundingClientRect();

      animationStyle.value = {
        '--start-x': `${sourceRect.left}px`,
        '--start-y': `${sourceRect.top}px`,
        '--start-width': `${sourceRect.width}px`,
        '--start-height': `${sourceRect.height}px`,
        '--end-x': `${targetRect.left}px`,
        '--end-y': `${targetRect.top}px`,
      };
    }

    // Wait for the CSS animation duration (0.3s)
    await new Promise(resolve => setTimeout(resolve, 300));

    // Reset
    const result = animatingCard.value;
    animatingCard.value = null;
    animationDirection.value = null;
    isAnimating.value = false;
    
    return result; // Return the card so the logic knows it's safe to finish the swap
  };

  return {
    animatingCard,
    animationStyle,
    isAnimating,
    animationDirection,
    triggerMove
  };
}