import React from 'react';
import { Footer } from '../components/Footer/Footer';
import { LiquidGradient } from '../components/ui/flow-gradient-hero-section';
import styles from './Contact.module.css';

export const Contact = () => {
  return (
    <section id="contact" className={styles.contact}>
      <div className={styles.canvasBackground}>
        <LiquidGradient 
          title=""
          ctaText=""
          showPauseButton={false}
        />
      </div>
      <div className={styles.footerWrapper}>
        <Footer />
      </div>
    </section>
  );
};
