import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let isLoaded = false;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

export function useSheryJS() {
  const [shery, setShery] = useState<any>(null);

  useEffect(() => {
    if (isLoaded && window.Shery) {
      setShery(window.Shery);
      return;
    }

    if (!isLoading) {
      isLoading = true;
      loadPromise = new Promise((resolve) => {
        // Expose dependencies to window
        // @ts-ignore
        window.THREE = THREE;
        // @ts-ignore
        window.gsap = gsap;
        // @ts-ignore
        window.ScrollTrigger = ScrollTrigger;

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/sheryjs/dist/Shery.js';
        script.async = true;
        script.onload = () => {
          isLoaded = true;
          // @ts-ignore
          resolve(window.Shery);
        };
        document.body.appendChild(script);
      });
    }

    if (loadPromise) {
      loadPromise.then((s) => setShery(s));
    }
  }, []);

  return shery;
}
