import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { useLenis } from './hooks/useLenis';
import { useIsMobile } from './hooks/useIsMobile';
import { Cursor } from './components/Cursor/Cursor';
import { Nav } from './components/Nav/Nav';
import { DynamicNotch } from './components/DynamicNotch/DynamicNotch';
import { Marquee } from './components/Marquee/Marquee';
import { MobileNav } from './mobile/MobileNav';
import { Hero } from './sections/Hero';
import '../theme.css';
import '../variables.css';
import './mobile/mobile-overrides.css';

const Intro = lazy(() => import('./sections/Intro').then((m) => ({ default: m.Intro })));
const Work = lazy(() => import('./sections/Work').then((m) => ({ default: m.Work })));
const Writing = lazy(() => import('./sections/Writing').then((m) => ({ default: m.Writing })));
const Experience = lazy(() => import('./sections/Experience').then((m) => ({ default: m.Experience })));
const Skills = lazy(() => import('./sections/Skills').then((m) => ({ default: m.Skills })));
const Education = lazy(() => import('./sections/Education').then((m) => ({ default: m.Education })));
const Contact = lazy(() => import('./sections/Contact').then((m) => ({ default: m.Contact })));

const FadeIn = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-10%' }}
    transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
  >
    {children}
  </motion.div>
);

const SectionFallback = () => <div style={{ minHeight: '40vh' }} aria-hidden="true" />;

function App() {
  useLenis();
  const isMobile = useIsMobile();

  return (
    <>
      {!isMobile && <Cursor />}
      <Nav />
      <DynamicNotch />
      {isMobile && <MobileNav />}
      <main className={isMobile ? 'mobile-main' : undefined}>
        <Hero />
        <Suspense fallback={<SectionFallback />}>
          <FadeIn><Intro /></FadeIn>
          <Marquee text="AI / ML — SYSTEMS — LOW-LEVEL — MINIMAL —" />
          <FadeIn><Work /></FadeIn>
          <Marquee text="SOFTWARE ENGINEERING — ARCHITECTURE — ALGORITHMS —" />
          <FadeIn><Writing /></FadeIn>
          <FadeIn><Experience /></FadeIn>
          <FadeIn><Skills /></FadeIn>
          <FadeIn><Education /></FadeIn>
          <FadeIn><Contact /></FadeIn>
        </Suspense>
      </main>
    </>
  );
}

export default App;
