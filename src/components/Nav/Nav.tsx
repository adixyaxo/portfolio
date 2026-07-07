import React, { useState } from 'react';
import { MenuOverlay } from './MenuOverlay';
import styles from './Nav.module.css';

export const Nav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <a href="#" className={styles.logo}>@ADIXYAXO</a>
      <button
        className={styles.menuBtn}
        onClick={() => setIsMenuOpen(true)}
        data-cursor="MENU"
      >
        MENU
      </button>
      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};
