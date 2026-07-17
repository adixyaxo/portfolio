import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { portfolio } from '../data/portfolio';
import { RevealText } from '../components/RevealText/RevealText';
import styles from './Intro.module.css';

const Spline = lazy(() => import('@splinetool/react-spline'));

export const Intro = () => {
  const [shouldRender, setShouldRender] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" ref={containerRef} className={`${styles.intro} roundedSection`}>
      {shouldRender ? (
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-sm font-mono text-gray-500">Loading 3D Scene...</div>}>
          <Spline className='w-full h-full'
            scene="https://prod.spline.design/758rdTUN9uiznDY1/scene.splinecode"
          />
        </Suspense>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-sm font-mono text-gray-500">Loading...</div>
      )}
    </section>
  );
};
