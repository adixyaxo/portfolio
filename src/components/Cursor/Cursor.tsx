import { motion, AnimatePresence } from 'framer-motion';
import { useCursor } from '../../hooks/useCursor';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useIsTouchDevice } from '../../hooks/useIsMobile';
import styles from './Cursor.module.css';

export const Cursor = () => {
  const { x, y, isHovering, text } = useCursor();
  const prefersReducedMotion = useReducedMotion();
  const isTouch = useIsTouchDevice();

  if (prefersReducedMotion || isTouch) return null;

  return (
    <motion.div
      className={`${styles.cursorWrapper} ${isHovering ? styles.glass : ''}`}
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
      }}
      animate={{
        width: isHovering ? 64 : 12,
        height: isHovering ? 64 : 12,
        backgroundColor: isHovering
          ? 'rgba(0, 240, 255, 0.06)'
          : 'var(--color-circuit-teal)',
        mixBlendMode: 'normal',
      }}
      transition={{
        type: 'spring',
        stiffness: 150,
        damping: 15,
        mass: 0.1,
      }}
    >
      <AnimatePresence>
        {isHovering && text && (
          <motion.span
            className={styles.cursorText}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
