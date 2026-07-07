import { memo, type CSSProperties } from 'react';
import styles from './AudioVisualizer.module.css';

interface AudioVisualizerProps {
  active?: boolean;
  color?: string;
  bars?: number;
  size?: 'sm' | 'md';
}

export const AudioVisualizer = memo(function AudioVisualizer({
  active = true,
  color,
  bars = 4,
  size = 'sm',
}: AudioVisualizerProps) {
  return (
    <div
      className={`${styles.visualizer} ${styles[size]} ${active ? styles.active : ''}`}
      style={color ? { '--viz-color': color } as CSSProperties : undefined}
      aria-hidden="true"
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={styles.bar}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
});
