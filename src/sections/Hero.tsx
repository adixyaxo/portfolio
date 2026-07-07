import React, { Suspense, lazy } from 'react';
import { portfolio } from '../data/portfolio';
import { WaveDivider } from '../components/ui/WaveDivider';
import { useIsMobile } from '../hooks/useIsMobile';
import styles from './Hero.module.css';

const LiquidGradientCanvas = lazy(() =>
  import('../components/Gradients/LiquidGradient1').then((m) => ({
    default: m.LiquidGradientCanvas,
  }))
);

const GitHubGraph = lazy(() =>
  import('../components/GitHubGraph/GitHubGraph').then((m) => ({
    default: m.GitHubGraph,
  }))
);

export const Hero = () => {
  const isMobile = useIsMobile();

  return (
    <section className={styles.hero}>
      {!isMobile && (
        <div className={styles.canvasBackground}>
          <Suspense fallback={null}>
            <LiquidGradientCanvas
              colors={['#ff0055', '#0055ff', '#00ffaa', '#ffaa00', '#7700ff']}
              speed={0.6}
              scale={0.5}
              seed={42}
              contrast={1.2}
              saturation={1.2}
            />
          </Suspense>
        </div>
      )}
      <div className={styles.contentOverlay}>
        <h1 className={styles.titleMain}>{portfolio.hero.name}</h1>
        <p className={styles.role}>{portfolio.hero.role}</p>

        {!isMobile && (
          <div style={{ marginTop: 'var(--spacing-48)', pointerEvents: 'auto' }}>
            <Suspense fallback={null}>
              <GitHubGraph username="adixyaxo" />
            </Suspense>
          </div>
        )}
      </div>
      <WaveDivider />
    </section>
  );
};
