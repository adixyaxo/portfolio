import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolio } from '../../data/portfolio';
import styles from './MenuOverlay.module.css';

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MenuOverlay: React.FC<MenuOverlayProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ clipPath: 'circle(0% at 100% 0%)' }}
          animate={{ clipPath: 'circle(150% at 100% 0%)' }}
          exit={{ clipPath: 'circle(0% at 100% 0%)' }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className={styles.container}>
            <div className={styles.header}>
              <div className={styles.logo}>ADITYA DAGAR</div>
              <button className={styles.closeBtn} onClick={onClose} data-cursor="CLOSE">
                CLOSE
              </button>
            </div>

            <div className={styles.content}>
              <nav className={styles.navLinks}>
                <motion.a href="/#work" onClick={onClose} whileHover={{ x: 20 }}>WORK</motion.a>
                <motion.a href="/#about" onClick={onClose} whileHover={{ x: 20 }}>ABOUT</motion.a>
                <motion.a href="/#contact" onClick={onClose} whileHover={{ x: 20 }}>CONTACT</motion.a>
                <motion.div whileHover={{ x: 20 }}>
                  <Link to="/cv" onClick={onClose} className={styles.cvLink}>CV</Link>
                </motion.div>
              </nav>

              <div className={styles.socials}>
                <p className={styles.socialsLabel}>SOCIALS</p>
                {portfolio.socials.map((social) => (
                  <a key={social.platform} href={social.url} target="_blank" rel="noopener noreferrer">
                    {social.platform}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
