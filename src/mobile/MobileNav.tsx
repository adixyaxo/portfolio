import { memo } from 'react';
import styles from './MobileNav.module.css';

const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'contact', label: 'Contact' },
] as const;

export const MobileNav = memo(function MobileNav() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={styles.bar} aria-label="Mobile navigation">
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          className={styles.tab}
          onClick={() => scrollTo(section.id)}
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
});
