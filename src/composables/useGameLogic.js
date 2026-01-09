import { ref, nextTick } from "vue";
import { useGameAssets } from "./useGameAssets";
// import { useCardAnimation } from './useCardAnimation';

export function useGameLogic() {
  const score = ref(0);
  const mistakes = ref(0);
  const scoreUnPaused = ref(0);

  const cardLeft = ref(null);
  const cardRight = ref(null);

  const { deck } = useGameAssets();
  // const { isAnimating, triggerMove, animatingCard, animationDirection, animationStyle } = useCardAnimation();

  const getRandomCard = () => {
    const randomIndex = Math.floor(Math.random() * deck.length);
    return {
      ...deck[randomIndex],
      rotation: Math.floor(Math.random() * 360),
    };
  };

  const initGame = () => {
    let c1 = getRandomCard();
    let c2 = getRandomCard();
    while (c1.id === c2.id) {
      c2 = getRandomCard();
    }
    cardLeft.value = c1;
    cardRight.value = c2;
  };

const handleMatch = (clickedType, side, isPaused) => {
  // const handleMatch = async (clickedType, side, isPaused, leftCardWrapper, rightCardWrapper, isShaking) => {
    const leftHasIt = cardLeft.value.symbols.some(
      (s) => s.type === clickedType
    );
    const rightHasIt = cardRight.value.symbols.some(
      (s) => s.type === clickedType
    );

    const success = leftHasIt && rightHasIt;

    if (success) {
        score.value++;
      if (!isPaused.value) scoreUnPaused.value++;
    } else {
        mistakes.value++;
    }

    return success ? getRandomCard() : null;

    // if (leftHasIt && rightHasIt) {
    //   isShaking.value = false;
    //   score.value++;
    //   if (!isPaused.value) scoreUnPaused.value++;
    //   // message.value = "Nice match!";

    //   isAnimating.value = true;
    //   const clickedCard = side === "left" ? cardLeft.value : cardRight.value;
    //   const otherCard = side === "left" ? cardRight.value : cardLeft.value;

    //   animatingCard.value = clickedCard;
    //   animationDirection.value =
    //     side === "left" ? "left-to-right" : "right-to-left";

    //   // Compute the exact position of the source card
    //   await nextTick();
    //   const sourceWrapper =
    //     side === "left" ? leftCardWrapper.value : rightCardWrapper.value;
    //   const targetWrapper =
    //     side === "left" ? rightCardWrapper.value : leftCardWrapper.value;

    //   if (sourceWrapper && targetWrapper) {
    //     const sourceRect = sourceWrapper.getBoundingClientRect();
    //     const targetRect = targetWrapper.getBoundingClientRect();

    //     animationStyle.value = {
    //       "--start-x": `${sourceRect.left}px`,
    //       "--start-y": `${sourceRect.top}px`,
    //       "--start-width": `${sourceRect.width}px`,
    //       "--start-height": `${sourceRect.height}px`,
    //       "--end-x": `${targetRect.left}px`,
    //       "--end-y": `${targetRect.top}px`,
    //     };
    //   }

    //   // show the new card
    //   let newRandom = getRandomCard();
    //   while (
    //     newRandom.id === cardLeft.value.id ||
    //     newRandom.id === cardRight.value.id
    //   ) {
    //     newRandom = getRandomCard();
    //   }

    //   if (side === "left") {
    //     cardLeft.value = newRandom;
    //   } else {
    //     cardRight.value = newRandom;
    //   }

    //   // wait until the animation is over
    //   await new Promise((resolve) => setTimeout(resolve, 300));

    //   // Update the other card position
    //   if (side === "left") {
    //     cardRight.value = clickedCard;
    //   } else {
    //     cardLeft.value = clickedCard;
    //   }

    //   // Reset animation states
    //   animatingCard.value = null;
    //   animationDirection.value = null;
    //   isAnimating.value = false;
    //   animationStyle.value = {};
    // } else {
    //   mistakes.value++;
    //   // message.value = "No match there!";
      
    //   const triggerShake = () => {
    //     isShaking.value = true;
    //     setTimeout(() => {
    //       isShaking.value = false;
    //     }, 300); // Duration of the animation
    //   };

    //   triggerShake();
    // }
  };

  return {
    score,
    scoreUnPaused,
    mistakes,
    cardLeft,
    cardRight,
    getRandomCard,
    initGame,
    handleMatch,
  };
}
