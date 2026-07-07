import React from 'react';
import { portfolio } from '../data/portfolio';
import styles from './Experience.module.css';

export const Experience = () => {
  return (
    <section className={`${styles.experience} roundedSection`}>
      <div className={styles.container}>
        <div className={styles.list}>
          {portfolio.experience.map((exp, index) => (
            <a 
              key={index} 
              className={styles.row}
              href={exp.link || '#'}
              target={exp.link ? "_blank" : undefined}
              rel={exp.link ? "noopener noreferrer" : undefined}
              data-cursor={exp.link ? "OPEN" : ""}
            >
              <div className={styles.colOrg}>
                <h3 className={styles.orgName}>{exp.organization}</h3>
                <div className={styles.hoverImageWrapper}>
                  <img src={`https://picsum.photos/400/200?random=${index + 10}`} alt={exp.organization} className={styles.hoverImage} />
                </div>
              </div>
              <div className={styles.colDate}>
                <span className={styles.date}>//{exp.date}</span>
              </div>
              <div className={styles.colDetails}>
                <h4 className={styles.roleTitle}>{exp.role}</h4>
                <div className={styles.description}>
                  {Array.isArray(exp.description) ? (
                    <p>{exp.description[0]}</p>
                  ) : (
                    <p>{exp.description}</p>
                  )}
                </div>
              </div>
              <div className={styles.colArrow}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
