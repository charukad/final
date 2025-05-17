import React, { useEffect, useRef } from "react";
import Hammer from "hammerjs";

const TouchGestures = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  enabled = true,
}) => {
  const containerRef = useRef(null);
  const hammerRef = useRef(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    // Initialize Hammer
    hammerRef.current = new Hammer(containerRef.current);

    // Configure recognizers
    hammerRef.current.get("swipe").set({ direction: Hammer.DIRECTION_ALL });

    // Add event listeners
    if (onSwipeLeft) {
      hammerRef.current.on("swipeleft", onSwipeLeft);
    }

    if (onSwipeRight) {
      hammerRef.current.on("swiperight", onSwipeRight);
    }

    if (onSwipeUp) {
      hammerRef.current.on("swipeup", onSwipeUp);
    }

    if (onSwipeDown) {
      hammerRef.current.on("swipedown", onSwipeDown);
    }

    // Cleanup
    return () => {
      if (hammerRef.current) {
        hammerRef.current.destroy();
      }
    };
  }, [enabled, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return (
    <div ref={containerRef} className="touch-container">
      {children}
    </div>
  );
};

export default TouchGestures;
