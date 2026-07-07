import React from 'react';
import { portfolio } from '../../data/portfolio';
import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.contactForm}>
          <h2 className={styles.heading}>LET'S BUILD SOMETHING</h2>
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.inputGroup}>
              <input type="text" id="name" placeholder="NAME" required />
            </div>
            <div className={styles.inputGroup}>
              <input type="email" id="email" placeholder="EMAIL" required />
            </div>
            <div className={styles.inputGroup}>
              <textarea id="message" rows={4} placeholder="PROJECT DETAILS" required></textarea>
            </div>
            <button type="submit" className={styles.submitBtn} data-cursor="SEND">SUBMIT</button>
          </form>
        </div>

        <div className={styles.content}>
          <div className={styles.addressBlock}>
            <p>ADITYA DAGAR</p>
            <p>SOFTWARE ENGINEER</p>
            <p>AI/ML SYSTEMS</p>
          </div>
          
          <div className={styles.linksBlock}>
            {portfolio.socials.map((social) => (
              <a 
                key={social.platform} 
                href={social.url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {social.platform}
              </a>
            ))}
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} ADITYA DAGAR. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
};
