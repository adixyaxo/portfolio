import React from 'react';
import { Link } from 'react-router-dom';
import { portfolio } from '../data/portfolio';
import { Nav } from '../components/Nav/Nav';
import styles from './CVPage.module.css';

export const CVPage = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Nav />
      <div className={styles.page}>
        <div className={styles.container}>
          {/* ── Header ──────────────────────────────────────── */}
          <header className={styles.header}>
            <div className={styles.headerLeft}>
              <h1 className={styles.name}>{portfolio.hero.name}</h1>
              <p className={styles.role}>{portfolio.hero.role}</p>
              <p className={styles.positioning}>{portfolio.hero.positioning}</p>
            </div>
            <div className={styles.headerRight}>
              {portfolio.socials
                .filter((s) => ['Email', 'GitHub', 'LinkedIn', 'X'].includes(s.platform))
                .map((s) => (
                  <a
                    key={s.platform}
                    href={s.url}
                    target={s.platform === 'Email' ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className={styles.contactLink}
                  >
                    {s.platform === 'Email' ? s.url.replace('mailto:', '') : s.platform}
                  </a>
                ))}
            </div>
          </header>

          <div className={styles.divider} />

          {/* ── Summary ─────────────────────────────────────── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>ABOUT</h2>
            <p className={styles.summary}>{portfolio.intro}</p>
          </section>

          <div className={styles.divider} />

          {/* ── Skills ──────────────────────────────────────── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>SKILLS</h2>
            <div className={styles.skillsGrid}>
              {portfolio.skills.map((skill) => (
                <div key={skill.category} className={styles.skillRow}>
                  <span className={styles.skillCategory}>{skill.category}</span>
                  <span className={styles.skillTech}>{skill.technologies}</span>
                </div>
              ))}
            </div>
          </section>

          <div className={styles.divider} />

          {/* ── Experience ──────────────────────────────────── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>EXPERIENCE</h2>
            {portfolio.experience.map((exp, i) => (
              <div key={i} className={styles.expBlock}>
                <div className={styles.expHeader}>
                  <div>
                    <h3 className={styles.expRole}>{exp.role}</h3>
                    <p className={styles.expOrg}>
                      {exp.link ? (
                        <a href={exp.link} target="_blank" rel="noopener noreferrer">
                          {exp.organization}
                        </a>
                      ) : (
                        exp.organization
                      )}
                    </p>
                  </div>
                  <span className={styles.expDate}>{exp.date}</span>
                </div>
                <ul className={styles.expList}>
                  {(Array.isArray(exp.description) ? exp.description : [exp.description]).map(
                    (d, j) => (
                      <li key={j}>{d}</li>
                    )
                  )}
                </ul>
              </div>
            ))}
          </section>

          <div className={styles.divider} />

          {/* ── Projects ────────────────────────────────────── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>PROJECTS</h2>
            {portfolio.projects.map((proj, i) => (
              <div key={i} className={styles.expBlock}>
                <div className={styles.expHeader}>
                  <div>
                    <h3 className={styles.expRole}>
                      <a href={proj.link} target="_blank" rel="noopener noreferrer">
                        {proj.title}
                      </a>
                    </h3>
                    <div className={styles.tagRow}>
                      {proj.tags.map((tag) => (
                        <span key={tag} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <ul className={styles.expList}>
                  {proj.description.map((d, j) => (
                    <li key={j}>{d}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <div className={styles.divider} />

          {/* ── Education ───────────────────────────────────── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>EDUCATION</h2>
            {portfolio.education.map((edu, i) => (
              <div key={i} className={styles.expBlock}>
                <div className={styles.expHeader}>
                  <div>
                    <h3 className={styles.expRole}>{edu.institution}</h3>
                    <p className={styles.expOrg}>{edu.degree}</p>
                    <p className={styles.expOrg}>{edu.score}</p>
                    {edu.coursework && (
                      <p className={styles.coursework}>Coursework: {edu.coursework}</p>
                    )}
                  </div>
                  <span className={styles.expDate}>{edu.date}</span>
                </div>
              </div>
            ))}
          </section>

          {portfolio.achievements.length > 0 && (
            <>
              <div className={styles.divider} />
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>ACHIEVEMENTS</h2>
                <ul className={styles.expList}>
                  {portfolio.achievements.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </section>
            </>
          )}

          {/* ── Writing ─────────────────────────────────────── */}
          {portfolio.writing.length > 0 && (
            <>
              <div className={styles.divider} />
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>WRITING</h2>
                {portfolio.writing.map((w, i) => (
                  <div key={i} className={styles.expBlock}>
                    <h3 className={styles.expRole}>
                      <a href={w.link} target="_blank" rel="noopener noreferrer">
                        {w.title}
                      </a>
                    </h3>
                    <p className={styles.expOrg}>
                      {w.publication} · {w.date} · {w.readTime}
                    </p>
                  </div>
                ))}
              </section>
            </>
          )}
        </div>

        {/* ── Bottom bar (hidden in print) ──────────────────── */}
        <div className={styles.bottomBar}>
          <Link to="/" className={styles.backLink}>
            ← BACK TO PORTFOLIO
          </Link>
          <button type="button" className={styles.printBtn} onClick={handlePrint}>
            PRINT / SAVE PDF
          </button>
        </div>
      </div>
    </>
  );
};

export default CVPage;
