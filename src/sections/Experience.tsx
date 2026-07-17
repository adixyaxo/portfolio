import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { portfolio } from '../data/portfolio';
import { GrainOverlay } from '../components/GrainOverlay/GrainOverlay';
import { useIsMobile } from '../hooks/useIsMobile';
import { useSheryJS } from '../hooks/useSheryJS';
import styles from './Experience.module.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * Experience Section — Split-panel layout
 * Left: pinned text panels that scroll vertically via GSAP ScrollTrigger
 * Right: Shery.js 3D Wind effect on stacked images, driven by scroll
 * Interactive elements use Shery.makeMagnet for magnetic hover
 */
export const Experience = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const sheryInitRef = useRef(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const Shery = useSheryJS();

  useEffect(() => {
    if (isMobile) return;

    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray(`.${styles.row}`);
      if (rows.length === 0) return;

      rows.forEach((row: any, i: number) => {
        // We use CSS position: sticky for the lock effect, but GSAP for the scale down animation
        if (i < rows.length - 1) {
          const dimmer = row.querySelector('.card-dimmer');
          
          gsap.to(row, {
            scale: 0.95 - (rows.length - i) * 0.01,
            scrollTrigger: {
              trigger: rows[i + 1] as Element,
              start: 'top center+=10%', // Start when next card is 60% down the screen
              end: 'top top+=20%', // End when next card is locked into its sticky position
              scrub: 1, // Smooth scrub for better perceived performance
            }
          });
          
          if (dimmer) {
            gsap.to(dimmer, {
              opacity: 0.6,
              scrollTrigger: {
                trigger: rows[i + 1] as Element,
                start: 'top center+=10%',
                end: 'top top+=20%',
                scrub: 1,
              }
            });
          }
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile]);

  // Initialize Shery.js magnet on mount
  useEffect(() => {
    if (isMobile || sheryInitRef.current || !Shery) return;

    try {
      if (typeof Shery.makeMagnet === 'function') {
        Shery.makeMagnet('.exp-magnet', {
          ease: 'cubic-bezier(0.23, 1, 0.320, 1)',
          duration: 1,
        });
      }
      sheryInitRef.current = true;
    } catch (e) {
      console.warn('SheryJS Magnet init failed:', e);
    }
    
    return () => {
      document.querySelectorAll('.mousefollower, .movercirc').forEach(el => el.remove());
      sheryInitRef.current = false;
    };
  }, [isMobile, Shery]);

  // Dynamically apply Shery.js imageEffect to the currently hovered image
  useEffect(() => {
    if (isMobile || !Shery || hoveredIndex === null) return;
    
    let ctx = gsap.context(() => {}); // create a context for cleanup if needed

    try {
      if (typeof Shery.imageEffect === 'function') {
        Shery.imageEffect('.shery-image', {
          style: 1, // Wave distortion
          config: { onMouse: { value: 1 } },
        });
      }
    } catch (e) {
      console.warn('SheryJS imageEffect init failed:', e);
    }

    return () => {
      ctx.revert();
      // Shery JS leaves the canvas container, but we must clear its internal meshes
      // Unfortunately, Shery doesn't expose a destroy method for imageEffect.
      // Unmounting the img tag from the DOM (which triggers this cleanup) will naturally 
      // make Shery stop rendering it in most cases.
    };
  }, [hoveredIndex, isMobile, Shery]);

  const experiences = portfolio.experience;

  // Mobile: simple list layout (no Shery/GSAP effects)
  if (isMobile) {
    return (
      <section className={`${styles.experience} roundedSection`} ref={sectionRef}>
        <div className={styles.mobileContainer}>
          {experiences.map((exp, index) => (
            <a
              key={index}
              className={styles.mobileRow}
              href={exp.link || '#'}
              target={exp.link ? '_blank' : undefined}
              rel={exp.link ? 'noopener noreferrer' : undefined}
            >
              {exp.image && (
                <img src={exp.image} alt={exp.organization} className={styles.mobileImg} loading="lazy" />
              )}
              <div className={styles.mobileText}>
                <span className={styles.mobileOrg}>{exp.organization}</span>
                <h4 className={styles.mobileRole}>{exp.role}</h4>
                <span className={styles.mobileDate}>//{exp.date}</span>
              </div>
            </a>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="experience" ref={sectionRef} className={`${styles.experience} roundedSection`}>
      <GrainOverlay />
      
      <div className={styles.container}>
        <div className={styles.list}>
          {experiences.map((exp, index) => (
            <a 
              key={index} 
              className={`${styles.row} hvr`}
              href={exp.link || '#'}
              target={exp.link ? "_blank" : undefined}
              rel={exp.link ? "noopener noreferrer" : undefined}
              data-cursor={exp.link ? "OPEN" : ""}
              style={{ top: `calc(15vh + ${index * 30}px)`, position: 'sticky' }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="card-dimmer" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', opacity: 0, zIndex: 1, pointerEvents: 'none', borderRadius: 'inherit', transition: 'opacity 0.1s' }}></div>
              <div className={styles.colOrg} style={{ position: 'relative', zIndex: 2 }}>
                <h3 className={styles.orgName}>{exp.organization}</h3>
                <div className={styles.hoverImageWrapper}>
                  {exp.image && hoveredIndex === index && (
                    <img src={exp.image} alt={exp.organization} className={`${styles.hoverImage} shery-image`} />
                  )}
                </div>
              </div>
              <div className={styles.colDate} style={{ position: 'relative', zIndex: 2 }}>
                <span className={styles.date}>// {exp.date}</span>
              </div>
              <div className={styles.colDetails} style={{ position: 'relative', zIndex: 2 }}>
                <h4 className={styles.roleTitle}>{exp.role}</h4>
                <div className={styles.description}>
                  {Array.isArray(exp.description) ? (
                    <p>{exp.description[0]}</p>
                  ) : (
                    <p>{exp.description}</p>
                  )}
                </div>
              </div>
              <div className={`${styles.colArrow} exp-magnet`} style={{ position: 'relative', zIndex: 2 }}>
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
