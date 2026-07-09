import React, { useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Project } from '../../data/portfolio';
import { TagPill } from '../TagPill/TagPill';
import { GrainOverlay } from '../GrainOverlay/GrainOverlay';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useIsTouchDevice } from '../../hooks/useIsMobile';
import styles from './ProjectCard.module.css';
import xncuVideo from '../../assets/xncu.mp4';
import seraVideo from '../../assets/sera.mp4';

const VIDEO_SRC = (projectVideo?: 'sera' | 'xncu') =>
  projectVideo === 'sera' ? seraVideo : xncuVideo;

interface ProjectCardProps {
  project: Project;
  index: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isTouchDevice = useIsTouchDevice();
  const [isHovered, setIsHovered] = useState(false);

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);
  const canExpand = !prefersReducedMotion && !isTouchDevice;

  const handleEnter = useCallback(() => {
    if (!canExpand) return;
    setIsHovered(true);
  }, [canExpand]);

  const handleLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div className={styles.card} ref={cardRef}>
      <a
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
        data-cursor="VIEW"
      >
        <div
          className={styles.imageContainer}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          onPointerEnter={handleEnter}
          onPointerLeave={handleLeave}
        >
          <motion.div
            className={styles.placeholderImage}
            style={prefersReducedMotion ? {} : { y }}
          >
            <video
              autoPlay
              loop
              muted={!isHovered}
              playsInline
              preload="metadata"
              className={styles.projectVideo}
              src={VIDEO_SRC(project.video)}
            />
            {!isHovered && <GrainOverlay intensity="medium" />}
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

    </div>
  );
};
