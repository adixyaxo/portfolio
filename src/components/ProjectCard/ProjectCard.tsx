import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Project } from '../../data/portfolio';
import { TagPill } from '../TagPill/TagPill';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <div 
      className={styles.card} 
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a href={project.link} target="_blank" rel="noopener noreferrer" className={styles.link} data-cursor="VIEW">
        <div className={styles.imageContainer}>
          <motion.div 
            className={styles.placeholderImage}
            style={prefersReducedMotion ? {} : { y }}
          >
            <motion.video 
              layoutId={`video-${project.title}`}
              autoPlay 
              loop 
              muted 
              playsInline 
              className={styles.projectVideo}
              src={`https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4`} 
            />
          </motion.div>
        </div>
        <div className={styles.content}>
          <div className={styles.header}>
            <span className={styles.index}>{(index + 1).toString().padStart(2, '0')} /</span>
            <h3 className={styles.title}>{project.title}</h3>
          </div>
          <div className={styles.tags}>
            {project.tags.map((tag) => (
              <TagPill key={tag} label={tag} />
            ))}
          </div>
          <div className={styles.description}>
            {project.description.map((desc, i) => (
              <p key={i}>{desc}</p>
            ))}
          </div>
        </div>
      </a>

      {/* Fullscreen Video Overlay */}
      <AnimatePresence>
        {isHovered && !prefersReducedMotion && (
          <motion.div 
            className={styles.fullScreenOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
          >
            <motion.video 
              layoutId={`video-${project.title}`}
              autoPlay 
              loop 
              muted 
              playsInline 
              className={styles.fullScreenVideo}
              src={`https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4`} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
