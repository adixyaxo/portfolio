import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useWeather } from '../../hooks/useWeather';
import styles from './DynamicNotch.module.css';

type PanelType = 'spotify' | 'weather' | 'clock' | 'github';
const PANELS: PanelType[] = ['spotify', 'weather', 'clock', 'github'];
const AUTO_ROTATE_MS = 15_000;
const SWIPE_THRESHOLD = 40;

/* ── Clock Panel ─────────────────────────────────────────────── */
function ClockPanel() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop()?.replace(/_/g, ' ') || 'Local';

  return (
    <div className={styles.panelContent}>
      <div className={styles.clockTime}>{timeStr}</div>
      <div className={styles.clockDate}>{dateStr}</div>
      <div className={styles.clockTz}>{tz}</div>
    </div>
  );
}

/* ── Weather Panel ───────────────────────────────────────────── */
function WeatherPanel() {
  const { weather, loading } = useWeather();

  if (loading || !weather) {
    return (
      <div className={styles.panelContent}>
        <span className={styles.panelLabel}>WEATHER</span>
        <span className={styles.panelMuted}>Loading…</span>
      </div>
    );
  }

  return (
    <div className={styles.panelContent}>
      <div className={styles.weatherRow}>
        <span className={styles.weatherIcon}>{weather.icon}</span>
        <span className={styles.weatherTemp}>{weather.temperature}°C</span>
      </div>
      <div className={styles.weatherCondition}>{weather.condition}</div>
      <div className={styles.weatherCity}>{weather.city}</div>
    </div>
  );
}

/* ── GitHub Panel ────────────────────────────────────────────── */
interface GitHubEvent {
  type: string;
  repo: string;
  time: string;
  message?: string;
}

function useGitHub() {
  const [event, setEvent] = useState<GitHubEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGH() {
      try {
        const res = await fetch('https://api.github.com/users/adixyaxo/events/public?per_page=5');
        if (!res.ok) return;
        const events = await res.json();
        const pushEvent = events.find((e: Record<string, unknown>) => e.type === 'PushEvent');
        if (pushEvent) {
          const commits = (pushEvent.payload as Record<string, unknown>).commits as Array<{ message: string }> | undefined;
          setEvent({
            type: 'Push',
            repo: (pushEvent.repo as { name: string }).name.split('/')[1] || (pushEvent.repo as { name: string }).name,
            time: new Date(pushEvent.created_at as string).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            message: commits?.[0]?.message?.split('\n')[0]?.slice(0, 40) || 'Code update',
          });
        } else if (events.length > 0) {
          const e = events[0];
          setEvent({
            type: (e.type as string).replace('Event', ''),
            repo: (e.repo as { name: string }).name.split('/')[1] || (e.repo as { name: string }).name,
            time: new Date(e.created_at as string).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
          });
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchGH();
    const interval = setInterval(fetchGH, 300_000);
    return () => clearInterval(interval);
  }, []);

  return { event, loading };
}

function GitHubPanel() {
  const { event, loading } = useGitHub();

  if (loading) {
    return (
      <div className={styles.panelContent}>
        <span className={styles.panelLabel}>GITHUB</span>
        <span className={styles.panelMuted}>Loading…</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={styles.panelContent}>
        <span className={styles.panelLabel}>GITHUB</span>
        <span className={styles.panelMuted}>No recent activity</span>
      </div>
    );
  }

  return (
    <div className={styles.panelContent}>
      <div className={styles.ghHeader}>
        <span className={styles.ghDot} />
        <span className={styles.ghType}>{event.type}</span>
        <span className={styles.ghTime}>{event.time}</span>
      </div>
      <div className={styles.ghRepo}>{event.repo}</div>
      {event.message && <div className={styles.ghMessage}>{event.message}</div>}
    </div>
  );
}

/* ── Spotify Compact ─────────────────────────────────────────── */
function SpotifyPanel() {
  return (
    <div className={styles.panelContent}>
      <span className={styles.panelLabel}>SPOTIFY</span>
      <span className={styles.panelMuted}>Now playing</span>
    </div>
  );
}

/* ── Main DynamicNotch ───────────────────────────────────────── */
export const DynamicNotch = memo(function DynamicNotch() {
  const prefersReducedMotion = useReducedMotion();
  const [activePanel, setActivePanel] = useState<PanelType>('spotify');
  const [swipeDir, setSwipeDir] = useState<1 | -1>(1);
  const hoveringRef = useRef(false);
  const autoRotateRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-rotate panels
  useEffect(() => {
    autoRotateRef.current = setInterval(() => {
      if (hoveringRef.current) return;
      setSwipeDir(1);
      setActivePanel((prev) => {
        const idx = PANELS.indexOf(prev);
        return PANELS[(idx + 1) % PANELS.length];
      });
    }, AUTO_ROTATE_MS);

    return () => {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    };
  }, []);

  /* ── Swipe handler for panels ─────────────────────────────── */
  const handlePanelDragEnd = useCallback((_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      const dir = info.offset.x < 0 ? 1 : -1;
      setSwipeDir(dir);
      setActivePanel((prev) => {
        const idx = PANELS.indexOf(prev);
        const next = idx + dir;
        if (next < 0) return PANELS[PANELS.length - 1];
        if (next >= PANELS.length) return PANELS[0];
        return PANELS[next];
      });
    }
  }, []);

  const spring = prefersReducedMotion
    ? { duration: 0.2 }
    : { type: 'spring' as const, stiffness: 420, damping: 32, mass: 0.8 };

  const isSpotify = activePanel === 'spotify';

  // Slide animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
    }),
  };

  return (
    <div
      className={styles.wrapper}
      onMouseEnter={() => { hoveringRef.current = true; }}
      onMouseLeave={() => { hoveringRef.current = false; }}
    >
      {/* ── Notch body ───────────────────────────────────── */}
      <motion.div
        className={styles.notch}
        transition={spring}
      >
        <motion.div
          className={styles.dragOverlay}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handlePanelDragEnd}
          whileDrag={{ scale: 0.97 }}
          style={{ touchAction: 'pan-y' }}
        />

        <AnimatePresence mode="wait" initial={false} custom={swipeDir}>
          {/* ── SPOTIFY COMPACT ──────────────────────────── */}
          {isSpotify && (
            <motion.div
              key="spotify"
              custom={swipeDir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className={styles.compactContent}
            >
              <SpotifyPanel />
            </motion.div>
          )}

          {/* ── WEATHER PANEL ────────────────────────────── */}
          {activePanel === 'weather' && (
            <motion.div
              key="weather"
              custom={swipeDir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className={styles.compactContent}
            >
              <WeatherPanel />
            </motion.div>
          )}

          {/* ── CLOCK PANEL ──────────────────────────────── */}
          {activePanel === 'clock' && (
            <motion.div
              key="clock"
              custom={swipeDir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className={styles.compactContent}
            >
              <ClockPanel />
            </motion.div>
          )}

          {/* ── GITHUB PANEL ─────────────────────────────── */}
          {activePanel === 'github' && (
            <motion.div
              key="github"
              custom={swipeDir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className={styles.compactContent}
            >
              <GitHubPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

    </div>
  );
});
