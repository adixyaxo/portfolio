import { useState, useEffect, useRef, useCallback } from 'react';

interface CursorState {
  x: number;
  y: number;
  isHovering: boolean;
  text: string;
}

/**
 * Performance-optimized cursor hook.
 * Position updates are throttled via RAF to avoid excess re-renders.
 * Hover state changes trigger immediate re-renders.
 */
export const useCursor = () => {
  const [cursorState, setCursorState] = useState<CursorState>({
    x: 0,
    y: 0,
    isHovering: false,
    text: '',
  });

  const posRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);
  const scheduledRef = useRef(false);

  const flushPosition = useCallback(() => {
    setCursorState((prev) => {
      if (prev.x === posRef.current.x && prev.y === posRef.current.y) return prev;
      return { ...prev, x: posRef.current.x, y: posRef.current.y };
    });
    scheduledRef.current = false;
  }, []);

  useEffect(() => {
    const updatePosition = (e: PointerEvent) => {
      posRef.current.x = e.clientX;
      posRef.current.y = e.clientY;
      if (!scheduledRef.current) {
        scheduledRef.current = true;
        rafRef.current = requestAnimationFrame(flushPosition);
      }
    };

    const handlePointerOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const cursorElement = target.closest('[data-cursor]');

      if (cursorElement) {
        setCursorState((prev) => ({
          ...prev,
          isHovering: true,
          text: cursorElement.getAttribute('data-cursor') || '',
        }));
      } else if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button')
      ) {
        setCursorState((prev) => ({
          ...prev,
          isHovering: true,
          text: '',
        }));
      } else {
        setCursorState((prev) => {
          if (!prev.isHovering) return prev;
          return { ...prev, isHovering: false, text: '' };
        });
      }
    };

    const handlePointerLeave = () => {
      setCursorState((prev) => {
        if (!prev.isHovering) return prev;
        return { ...prev, isHovering: false, text: '' };
      });
    };

    window.addEventListener('pointermove', updatePosition, { passive: true });
    window.addEventListener('pointerover', handlePointerOver, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', updatePosition);
      window.removeEventListener('pointerover', handlePointerOver);
      window.removeEventListener('pointerleave', handlePointerLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [flushPosition]);

  return cursorState;
};
