import React from 'react';
import { portfolio } from '../data/portfolio';
import { LiquidGradientCanvas } from '../components/Gradients/LiquidGradient1';
import { WaveDivider } from '../components/ui/WaveDivider';
import { GitHubGraph } from '../components/GitHubGraph/GitHubGraph';
import styles from './Hero.module.css';

export const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.canvasBackground}>
        <LiquidGradientCanvas 
          colors={["#ff0055", "#0055ff", "#00ffaa", "#ffaa00", "#7700ff"]}
          speed={0.6}
          scale={0.5}
          seed={42}
          contrast={1.2}
          saturation={1.2}
        />
      </div>
      <div className={styles.contentOverlay}>
        <h1 className={styles.titleMain}>
          {portfolio.hero.name}
        </h1>
        <p className={styles.role}>{portfolio.hero.role}</p>
        
        {/* GitHub Graph with transparent bg as requested */}
        <div style={{ marginTop: 'var(--spacing-48)', pointerEvents: 'auto' }}>
          <GitHubGraph username="adixyaxo" />
        </div>
      </div>
      <WaveDivider />
    </section>
  );
};
