import React, { useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Project } from '../../data/portfolio';
import { TagPill } from '../TagPill/TagPill';
import { GrainOverlay } from '../GrainOverlay/GrainOverlay';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useIsTouchDevice } from '../../hooks/useIsMobile';
import styles from './ProjectCard.module.css';

const VIDEO_SRC =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

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
    if (canExpand) setIsHovered(true);
  }, [canExpand]);

  const handleLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div
      className={styles.card}
      ref={cardRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <a
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
        data-cursor="VIEW"
      >
        <div className={styles.imageContainer}>
          <motion.div
            className={styles.placeholderImage}
            style={prefersReducedMotion ? {} : { y }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className={styles.projectVideo}
              src={VIDEO_SRC}
            />
            <GrainOverlay intensity="medium" />
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

      {canExpand &&
        createPortal(
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className={styles.videoBackdrop}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
              >
                <motion.div
                  className={styles.videoStage}
                  initial={{ scale: 0.88, opacity: 0, y: 24 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.92, opacity: 0, y: 16 }}
                  transition={{ duration: 0.55, ease: [0.19, 1, 0.22, 1] }}
                >
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className={styles.expandedVideo}
                    src={VIDEO_SRC}
                  />
                  <GrainOverlay intensity="heavy" />
                  <div className={styles.videoCaption}>
                    <span className={styles.videoCaptionTitle}>{project.title}</span>
                    <span className={styles.videoCaptionHint}>Click card to view project</span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};
