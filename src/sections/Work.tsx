import React from 'react';
import { portfolio } from '../data/portfolio';
import { ProjectCard } from '../components/ProjectCard/ProjectCard';
import styles from './Work.module.css';

export const Work = () => {
  return (
    <section id="work" className={`${styles.work} roundedSection`}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>SELECTED WORK</h2>
        </div>
        <div className={styles.grid}>
          {portfolio.projects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
