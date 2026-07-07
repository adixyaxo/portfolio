import { memo } from 'react';
import clsx from 'clsx';
import styles from './GrainOverlay.module.css';

interface GrainOverlayProps {
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
}

export const GrainOverlay = memo(function GrainOverlay({
  className,
  intensity = 'medium',
}: GrainOverlayProps) {
  return (
    <div
      className={clsx(styles.grain, styles[intensity], className)}
      aria-hidden="true"
    />
  );
});
