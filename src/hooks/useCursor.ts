import { useState, useEffect } from 'react';

interface CursorState {
  x: number;
  y: number;
  isHovering: boolean;
  text: string;
}

export const useCursor = () => {
  const [cursorState, setCursorState] = useState<CursorState>({
    x: 0,
    y: 0,
    isHovering: false,
    text: '',
  });

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setCursorState((prev) => ({
        ...prev,
        x: e.clientX,
        y: e.clientY,
      }));
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Look up the DOM tree for a data-cursor attribute
      const cursorElement = target.closest('[data-cursor]');
      
      if (cursorElement) {
        setCursorState((prev) => ({
          ...prev,
          isHovering: true,
          text: cursorElement.getAttribute('data-cursor') || '',
        }));
      } else if (target.tagName.toLowerCase() === 'a' || target.tagName.toLowerCase() === 'button' || target.closest('a') || target.closest('button')) {
         setCursorState((prev) => ({
          ...prev,
          isHovering: true,
          text: '',
        }));
      } else {
        setCursorState((prev) => ({
          ...prev,
          isHovering: false,
          text: '',
        }));
      }
    };

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return cursorState;
};
