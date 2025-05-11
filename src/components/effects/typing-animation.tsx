
"use client";

import type { FC } from 'react';
import { useState, useEffect, useRef } from 'react';

interface TypingAnimationProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
  startCondition?: boolean;
}

export const TypingAnimation: FC<TypingAnimationProps> = ({
  text,
  speed = 50,
  className,
  onComplete,
  startCondition = false,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const currentIndexRef = useRef(0);
  const [isComplete, setIsComplete] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    if (startCondition) {
      // Reset if starting anew or text/condition changes while active
      setDisplayedText('');
      currentIndexRef.current = 0;
      setIsComplete(false);
      
      // Start animation
      if (text.length > 0) {
        const animate = () => {
          if (currentIndexRef.current < text.length) {
            setDisplayedText((prev) => prev + text[currentIndexRef.current]);
            currentIndexRef.current += 1;
            animationTimeoutRef.current = setTimeout(animate, speed);
          } else {
            setIsComplete(true);
            if (onComplete) {
              onComplete();
            }
          }
        };
        // Initial call to start animation after reset for the current active state
        animationTimeoutRef.current = setTimeout(animate, speed);
      } else {
        // If text is empty but startCondition is true, mark as complete.
        setIsComplete(true);
         if (onComplete) {
            onComplete();
         }
      }

    } else {
      // If startCondition is false (e.g., not hovered), ensure text is cleared and state is reset
      setDisplayedText('');
      currentIndexRef.current = 0;
      setIsComplete(false);
    }
    
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, startCondition, speed, onComplete]); // Effect runs when these primary dependencies change

  return (
    <p className={className}>
      {displayedText}
      {startCondition && !isComplete && text.length > 0 && <span className="animate-pulse inline-block align-bottom">_</span>}
    </p>
  );
};
