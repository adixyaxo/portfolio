import React from 'react';
import { portfolio } from '../data/portfolio';
import { motion } from 'framer-motion';
import { TagPill } from '../components/TagPill/TagPill';
import styles from './Writing.module.css';

export const Writing = () => {
  return (
    <section className={`${styles.writing} roundedSection`}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>WRITING</h2>
        </div>
        
        <motion.div 
          className={styles.content}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          variants={{
            visible: { transition: { staggerChildren: 0.2 } },
            hidden: {}
          }}
        >
          {portfolio.writing.map((article) => (
            <motion.a 
              key={article.title} 
              href={article.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.article} 
              data-cursor="READ"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
            >
              <div className={styles.meta}>
                <span>{article.publication}</span>
                <span>·</span>
                <span>{article.date}</span>
                <span>·</span>
                <span>{article.readTime}</span>
              </div>
              <h3 className={styles.articleTitle}>{article.title}</h3>
              <div className={styles.tags}>
                {article.tags.map((tag) => (
                  <TagPill key={tag} label={tag} />
                ))}
              </div>
              <p className={styles.excerpt}>{article.excerpt}</p>
              <blockquote className={styles.quote}>"{article.quote}"</blockquote>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
