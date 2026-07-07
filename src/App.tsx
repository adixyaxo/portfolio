import React from 'react';
import { motion } from 'framer-motion';
import { useLenis } from './hooks/useLenis';
import { Cursor } from './components/Cursor/Cursor';
import { Nav } from './components/Nav/Nav';
import { Marquee } from './components/Marquee/Marquee';
import { Hero } from './sections/Hero';
import { Intro } from './sections/Intro';
import { Work } from './sections/Work';
import { Writing } from './sections/Writing';
import { Experience } from './sections/Experience';
import { Skills } from './sections/Skills';
import { Education } from './sections/Education';
import { Contact } from './sections/Contact';
import { portfolio } from './data/portfolio';
import '../theme.css';
import '../variables.css';

const FadeIn = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-10%" }}
    transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
  >
    {children}
  </motion.div>
);

function App() {
  // Initialize Lenis smooth scroll
  useLenis();

  const handleCtaClick = () => {
    const aboutSection = document.getElementById('about');
    aboutSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <FadeIn><Intro /></FadeIn>
        <Marquee text="AI / ML — SYSTEMS — LOW-LEVEL — MINIMAL —" />
        <FadeIn><Work /></FadeIn>
        <Marquee text="SOFTWARE ENGINEERING — ARCHITECTURE — ALGORITHMS —" />
        <FadeIn><Writing /></FadeIn>
        <FadeIn><Experience /></FadeIn>
        <FadeIn><Skills /></FadeIn>
        <FadeIn><Education /></FadeIn>
        <FadeIn><Contact /></FadeIn>
      </main>
    </>
  );
}

export default App;
