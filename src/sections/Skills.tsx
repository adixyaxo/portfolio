import React, { Suspense, lazy } from 'react';
import { portfolio } from '../data/portfolio';
import { motion } from 'framer-motion';
import styles from './Skills.module.css';

const WakaTimeStats = lazy(() =>
  import('../components/WakaTimeStats/WakaTimeStats').then((m) => ({
    default: m.WakaTimeStats,
  }))
);

export const Skills = () => {
  return (
    <section className={`${styles.skills} roundedSection`}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>SKILLS</h2>
        </div>
        <motion.div 
          className={styles.grid}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } },
            hidden: {}
          }}
        >
          {portfolio.skills.map((skillGroup) => (
            <motion.div 
              key={skillGroup.category} 
              className={styles.group}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
            >
              <h3 className={styles.category}>{skillGroup.category}</h3>
              <div className={styles.pillsContainer}>
                {skillGroup.technologies.split(', ').map((tech) => (
                  <span key={tech} className={styles.pill}>{tech}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* WakaTime Stats — Full width, outside the 2-col grid */}
        <motion.div 
          className={styles.wakaTimeWrapper}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        >
          <Suspense fallback={<div className={styles.wakaFallback} aria-hidden="true" />}>
            <WakaTimeStats />
          </Suspense>
        </motion.div>
      </div>
    </section>
  );
};
