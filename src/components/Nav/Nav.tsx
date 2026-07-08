import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuOverlay } from './MenuOverlay';
import styles from './Nav.module.css';

export const Nav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [time, setTime] = useState('');
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(h > 0 ? Math.round((window.scrollY / h) * 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Left cluster: logo + status */}
      <div className={styles.leftCluster}>
        <a href="#" className={styles.logo}>@ADIXYAXO</a>
        <span className={styles.statusDot} />
        <span className={styles.statusText}>AVAILABLE</span>
      </div>

      {/* Center: time */}
      <div className={styles.centerCluster}>
        <span className={styles.time}>{time}</span>
      </div>

      {/* Right cluster: scroll progress + menu */}
      <div className={styles.rightCluster}>
        <span className={styles.scrollPct}>{scrollPct}%</span>
        <button
          className={styles.menuBtn}
          onClick={() => setIsMenuOpen(true)}
          data-cursor="MENU"
        >
          MENU
        </button>
      </div>

      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};
