import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import styles from './RevealText.module.css';

interface RevealTextProps {
  text: string;
  className?: string;
  elementType?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export const RevealText: React.FC<RevealTextProps> = ({ 
  text, 
  className = '', 
  elementType = 'p' 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end center"]
  });

  const words = text.split(' ');

  const Component = elementType as any;

  if (prefersReducedMotion) {
    return <Component className={className}>{text}</Component>;
  }

  return (
    <Component className={`${styles.revealWrapper} ${className}`} ref={ref}>
      <span className={styles.wordContainer}>
        {words.map((word, i) => {
          const start = i / words.length;
          const end = start + (1 / words.length);
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1]);
          return (
            <motion.span key={i} style={{ opacity, display: 'inline-block', marginRight: '8px', position: 'relative' }}>
              {word}
            </motion.span>
          );
        })}
      </span>
    </Component>
  );
};
