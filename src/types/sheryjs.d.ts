declare module 'sheryjs' {
  interface ImageEffectOptions {
    style?: number;
    debug?: boolean;
    gooey?: boolean;
    config?: Record<string, unknown>;
    preset?: string;
    scrollSnapping?: boolean;
    scrollSpeed?: number;
    touchSpeed?: number;
    damping?: number;
    slideStyle?: (setScroll: (value: number) => void) => void;
    setUniforms?: (uniforms: Record<string, { value: unknown }>) => void;
    setAttribute?: (attributes: Record<string, unknown>) => void;
  }

  const Shery: {
    mouseFollower: (options?: Record<string, unknown>) => void;
    makeMagnet: (selector: string, options?: Record<string, unknown>) => void;
    textAnimate: (selector: string, options?: Record<string, unknown>) => void;
    imageEffect: (selector: string, options?: ImageEffectOptions) => void;
    hoverWithMediaCircle: (selector: string, options?: { images?: string[]; videos?: string[] }) => void;
    imageMasker: (selector: string, options?: Record<string, unknown>) => void;
  };

  export default Shery;
}
