import React from 'react';
import { portfolio } from '../data/portfolio';
import { RevealText } from '../components/RevealText/RevealText';
import styles from './Intro.module.css';

export const Intro = () => {
  return (
    <section id="about" className={`${styles.intro} roundedSection`}>
      <div className={styles.container}>
        <div className={styles.content}>
          <RevealText 
            text={portfolio.intro} 
            className={styles.text} 
            elementType="h2" 
          />
        </div>
      </div>
    </section>
  );
};
