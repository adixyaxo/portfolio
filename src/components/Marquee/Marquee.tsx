import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import styles from './Marquee.module.css';

interface MarqueeProps {
  text: string;
}

export const Marquee: React.FC<MarqueeProps> = ({ text }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !textRef.current) return;

    const el = textRef.current;
    
    gsap.to(el, {
      xPercent: -50,
      ease: 'none',
      duration: 20,
      repeat: -1,
    });

  }, [prefersReducedMotion]);

  // Duplicate text multiple times to ensure seamless scrolling
  const duplicatedText = Array(10).fill(text).join(' \u00A0 ');

  return (
    <div className={styles.marqueeContainer} ref={containerRef}>
      <div className={styles.marqueeText} ref={textRef}>
        <span>{duplicatedText}</span>
        <span>{duplicatedText}</span>
      </div>
    </div>
  );
};
