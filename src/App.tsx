import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import * as THREE from 'three';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
const CVPage = lazy(() => import('./sections/CVPage'));

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

/* ── Initialize SheryJS magnetic effect on all .magnet elements ── */
function useSheryMagnet() {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) return;

    // Delay to ensure DOM is ready after lazy loads
    const timer = setTimeout(async () => {
      try {
        // Expose to window for SheryJS UMD wrapper
        // @ts-ignore
        window.THREE = THREE;
        // @ts-ignore
        window.gsap = gsap;
        // @ts-ignore
        window.ScrollTrigger = ScrollTrigger;

        const sheryModule = (await import('sheryjs/dist/Shery.js')) as {
          default?: unknown;
          Shery?: unknown;
        };
        const Shery = sheryModule.default ?? sheryModule.Shery ?? sheryModule;
        const sheryApi = Shery as { makeMagnet?: (selector: string, options: Record<string, unknown>) => void };

        if (sheryApi.makeMagnet) {
          sheryApi.makeMagnet('.magnet', {
            ease: 'cubic-bezier(0.23, 1, 0.320, 1)',
            duration: 1,
          });
        }
      } catch (e) {
        console.warn('SheryJS magnet init failed:', e);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isMobile]);
}

function PortfolioPage() {
  const isMobile = useIsMobile();

  return (
    <>
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

function App() {
  useLenis();
  useSheryMagnet();
  const isMobile = useIsMobile();

  return (
    <>
      {!isMobile && <Cursor />}
      <Suspense fallback={<SectionFallback />}>
        <Routes>
          <Route path="/" element={<PortfolioPage />} />
          <Route path="/cv" element={<CVPage />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
