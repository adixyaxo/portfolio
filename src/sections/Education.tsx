import React from 'react';
import { portfolio } from '../data/portfolio';
import styles from './Education.module.css';

export const Education = () => {
  return (
    <section className={styles.education}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>EDUCATION & ACHIEVEMENTS</h2>
        </div>
        
        <div className={styles.content}>
          <div className={styles.list}>
            {portfolio.education.map((edu, index) => (
              <div key={index} className={styles.item}>
                <h3 className={styles.institution}>{edu.institution}</h3>
                <div className={styles.meta}>
                  <span>{edu.degree}</span>
                  {edu.date && <span>· {edu.date}</span>}
                </div>
                <p className={styles.score}>{edu.score}</p>
                {edu.coursework && <p className={styles.coursework}>{edu.coursework}</p>}
              </div>
            ))}
          </div>

          <div className={styles.achievements}>
            {portfolio.achievements.map((ach, index) => (
              <p key={index} className={styles.achievement}>{ach}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
