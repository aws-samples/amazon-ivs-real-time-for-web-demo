export const isVirtualKeyboardOpen = () => {
  if (typeof navigator !== 'undefined' && 'virtualKeyboard' in navigator) {
    // Use Virtual Keyboard API if available
    navigator.virtualKeyboard.overlaysContent = true;
    return navigator.virtualKeyboard.boundingRect.height > 0;
  } else if (typeof window !== 'undefined' && window.visualViewport) {
    // Fallback to visualViewport method
    const viewportHeight = window.visualViewport.height;
    const windowHeight = window.innerHeight;

    const heightDifference = windowHeight - viewportHeight;
    const thresholdPercentage = 0.15; // 15% threshold

    return heightDifference / windowHeight > thresholdPercentage;
  }

  // Unable to detect
  return false;
};
