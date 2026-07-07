import React from 'react';
import styles from './TagPill.module.css';

interface TagPillProps {
  label: string;
}

export const TagPill: React.FC<TagPillProps> = ({ label }) => {
  return (
    <span className={styles.pill}>
      {label}
    </span>
  );
};
