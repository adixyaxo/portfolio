import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Music, CloudSun, Clock, Github } from 'lucide-react';
import clsx from 'clsx';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useWeather } from '../../hooks/useWeather';
import styles from './DynamicNotch.module.css';

type PanelType = 'spotify' | 'weather' | 'clock' | 'github';
const PANELS: PanelType[] = ['spotify', 'weather', 'clock', 'github'];
const AUTO_ROTATE_MS = 15_000;
const SWIPE_THRESHOLD = 50;

/* ── Tab metadata ────────────────────────────────────────────── */
const PANEL_META: Record<PanelType, { icon: React.ReactNode; label: string }> = {
  spotify: { icon: <Music size={10} />, label: 'Music' },
  weather: { icon: <CloudSun size={10} />, label: 'Weather' },
  clock:   { icon: <Clock size={10} />,   label: 'Clock' },
  github:  { icon: <Github size={10} />,  label: 'GitHub' },
};

/* ── Spotify Embeds ──────────────────────────────────────────── */
interface SpotifyEmbed {
  type: 'track' | 'playlist';
  id: string;
  label: string;
}

const SPOTIFY_EMBEDS: SpotifyEmbed[] = [
  { type: 'track', id: '3Q4gttWQ6hxqWOa3tHoTNi', label: 'Track 1' },
  { type: 'track', id: '3azJifCSqg9fRij2yKIbWz', label: 'Track 2' },
  { type: 'track', id: '7AjU3sce5VrGGxHjGDy7ZZ', label: 'Track 3' },
  { type: 'playlist', id: '4iPoUrfS96LVxEYfrWq4nb', label: 'Playlist' },
];

function getEmbedUrl(embed: SpotifyEmbed): string {
  return `https://open.spotify.com/embed/${embed.type}/${embed.id}?utm_source=generator&theme=0`;
}

/* ── Clock Panel ─────────────────────────────────────────────── */
const ClockPanel = memo(function ClockPanel() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') {
        setNow(new Date());
      }
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop()?.replace(/_/g, ' ') || 'Local';

  return (
    <div className={styles.panelContent}>
      <div className={styles.clockTime}>{timeStr}</div>
      <div className={styles.clockDate}>{dateStr}</div>
      <div className={styles.clockTz}>{tz}</div>
    </div>
  );
});

/* ── Weather Panel ───────────────────────────────────────────── */
const WeatherPanel = memo(function WeatherPanel() {
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
});

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
    let cancelled = false;
    async function fetchGH() {
      if (document.visibilityState === 'hidden') return;
      try {
        const res = await fetch('https://api.github.com/users/adixyaxo/events/public?per_page=5');
        if (!res.ok || cancelled) return;
        const events = await res.json();
        if (cancelled) return;
        const pushEvent = events.find((e: Record<string, unknown>) => e.type === 'PushEvent');
        if (pushEvent) {
          const commits = (pushEvent.payload as Record<string, unknown>).commits as Array<{ message: string }> | undefined;
          setEvent({
            type: 'Push',
            repo: (pushEvent.repo as { name: string }).name.split('/')[1] || (pushEvent.repo as { name: string }).name,
            time: new Date(pushEvent.created_at as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            message: commits?.[0]?.message?.split('\n')[0]?.slice(0, 40) || 'Code update',
          });
        } else if (events.length > 0) {
          const e = events[0];
          setEvent({
            type: (e.type as string).replace('Event', ''),
            repo: (e.repo as { name: string }).name.split('/')[1] || (e.repo as { name: string }).name,
            time: new Date(e.created_at as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          });
        }
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchGH();
    const interval = setInterval(fetchGH, 300_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return { event, loading };
}

const GitHubPanel = memo(function GitHubPanel() {
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
});

/* ── Main DynamicNotch ───────────────────────────────────────── */
export const DynamicNotch = memo(function DynamicNotch() {
  const prefersReducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelType>('spotify');
  const [embedIndex, setEmbedIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState<1 | -1>(1);
  const hoveringRef = useRef(false);
  const autoRotateRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDraggingRef = useRef(false);

  // Auto-rotate panels using setTimeout chain to avoid drift
  useEffect(() => {
    function scheduleNext() {
      autoRotateRef.current = setTimeout(() => {
        if (!hoveringRef.current && !expanded) {
          setSwipeDir(1);
          setActivePanel((prev) => {
            const idx = PANELS.indexOf(prev);
            return PANELS[(idx + 1) % PANELS.length];
          });
        }
        scheduleNext();
      }, AUTO_ROTATE_MS);
    }
    scheduleNext();
    return () => { if (autoRotateRef.current) clearTimeout(autoRotateRef.current); };
  }, [expanded]);

  const toggleExpanded = useCallback(() => {
    if (isDraggingRef.current) return;
    if (activePanel === 'spotify') {
      setExpanded((prev) => !prev);
    }
  }, [activePanel]);

  const handleTabClick = useCallback((panel: PanelType) => {
    const prevIdx = PANELS.indexOf(activePanel);
    const nextIdx = PANELS.indexOf(panel);
    setSwipeDir(nextIdx > prevIdx ? 1 : -1);
    setActivePanel(panel);
    setExpanded(false);
  }, [activePanel]);

  const goNextEmbed = useCallback(() => {
    setEmbedIndex((prev) => (prev + 1) % SPOTIFY_EMBEDS.length);
  }, []);

  const goPrevEmbed = useCallback(() => {
    setEmbedIndex((prev) => (prev - 1 + SPOTIFY_EMBEDS.length) % SPOTIFY_EMBEDS.length);
  }, []);

  /* ── Swipe handler for panel switching ────────────────────── */
  const handlePanelSwipe = useCallback((_: unknown, info: PanInfo) => {
    isDraggingRef.current = false;
    if (Math.abs(info.offset.x) < SWIPE_THRESHOLD) return;
    const dir = info.offset.x < 0 ? 1 : -1;
    setSwipeDir(dir);

    // Always switch panels in compact mode — track switching is only in expanded
    setActivePanel((prev) => {
      const idx = PANELS.indexOf(prev);
      const next = idx + dir;
      if (next < 0) return PANELS[PANELS.length - 1];
      if (next >= PANELS.length) return PANELS[0];
      return PANELS[next];
    });
    setExpanded(false);
  }, []);

  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  /* ── Swipe handler for expanded embed tracks ──────────────── */
  const handleEmbedSwipe = useCallback((_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) < SWIPE_THRESHOLD) return;
    if (info.offset.x < 0) goNextEmbed();
    else goPrevEmbed();
  }, [goNextEmbed, goPrevEmbed]);

  const spring = prefersReducedMotion
    ? { duration: 0.2 }
    : { type: 'spring' as const, stiffness: 420, damping: 32, mass: 0.8 };

  const isSpotify = activePanel === 'spotify';
  const showExpanded = isSpotify && expanded;
  const currentEmbed = SPOTIFY_EMBEDS[embedIndex];

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -50 : 50, opacity: 0 }),
  };

  return (
    <div
      className={styles.wrapper}
      onMouseEnter={() => { hoveringRef.current = true; }}
      onMouseLeave={() => { hoveringRef.current = false; }}
    >
      {/* ── Notch body ───────────────────────────────────── */}
      <motion.div
        className={clsx(styles.notch, showExpanded && styles.notchExpanded)}
        layout
        transition={spring}
        role="region"
        aria-label={`Dynamic notch: ${activePanel}`}
      >
        {isSpotify && <div className={styles.spotifyGlow} aria-hidden="true" />}

        {/* ── Integrated tab bar ─────────────────────────── */}
        <div className={styles.notchTabs}>
          {PANELS.map((panel) => (
            <button
              key={panel}
              type="button"
              className={clsx(styles.notchTab, activePanel === panel && styles.notchTabActive)}
              onClick={() => handleTabClick(panel)}
              aria-label={`Switch to ${panel}`}
              title={PANEL_META[panel].label}
            >
              {PANEL_META[panel].icon}
              <span className={styles.notchTabLabel}>{PANEL_META[panel].label}</span>
            </button>
          ))}
        </div>

        {/* Invisible drag layer for swipe detection */}
        {!showExpanded && (
          <motion.div
            className={styles.swipeLayer}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragStart={handleDragStart}
            onDragEnd={handlePanelSwipe}
            style={{ touchAction: 'pan-y' }}
          />
        )}

        {/* ── Panel click area (spotify expand) ──────────── */}
        {isSpotify && !showExpanded && (
          <div
            role="button"
            tabIndex={0}
            style={{ position: 'relative', zIndex: 5, cursor: 'pointer' }}
            onClick={toggleExpanded}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleExpanded();
              }
            }}
          />
        )}

        <AnimatePresence mode="wait" initial={false} custom={swipeDir}>
          {/* ── SPOTIFY COMPACT ──────────────────────────── */}
          {isSpotify && !showExpanded && (
            <motion.div
              key={`spotify-compact-${embedIndex}`}
              custom={swipeDir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: [0.19, 1, 0.22, 1] }}
              className={styles.compactContent}
              onClick={toggleExpanded}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.spotifyCompactRow}>
                <button type="button" className={styles.embedNavBtn}
                  onClick={(e) => { e.stopPropagation(); goPrevEmbed(); }}
                  aria-label="Previous track">
                  <ChevronLeft size={14} />
                </button>
                <svg className={styles.spotifyIconSmall} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                <span className={styles.embedLabel}>{currentEmbed.label}</span>
                <span className={styles.embedCounter}>{embedIndex + 1}/{SPOTIFY_EMBEDS.length}</span>
                <button type="button" className={styles.embedNavBtn}
                  onClick={(e) => { e.stopPropagation(); goNextEmbed(); }}
                  aria-label="Next track">
                  <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── SPOTIFY EXPANDED ─────────────────────────── */}
          {isSpotify && showExpanded && (
            <motion.div
              key="spotify-expanded"
              className={styles.expandedContent}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
            >
              <motion.div
                className={styles.embedIframeWrap}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleEmbedSwipe}
                whileDrag={{ scale: 0.97, cursor: 'grabbing' }}
                style={{ cursor: 'grab', touchAction: 'pan-y' }}
              >
                <iframe
                  key={currentEmbed.id}
                  src={getEmbedUrl(currentEmbed)}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className={styles.embedIframe}
                  title={`Spotify ${currentEmbed.type}: ${currentEmbed.label}`}
                />
              </motion.div>
              <div className={styles.embedNavRow}>
                <button type="button" className={styles.embedNavBtnLg}
                  onClick={(e) => { e.stopPropagation(); goPrevEmbed(); }} aria-label="Previous">
                  <ChevronLeft size={16} />
                </button>
                <div className={styles.embedDots}>
                  {SPOTIFY_EMBEDS.map((_, i) => (
                    <button key={i} type="button"
                      className={clsx(styles.embedDot, i === embedIndex && styles.embedDotActive)}
                      onClick={(e) => { e.stopPropagation(); setEmbedIndex(i); }}
                      aria-label={`Go to ${SPOTIFY_EMBEDS[i].label}`} />
                  ))}
                </div>
                <button type="button" className={styles.embedNavBtnLg}
                  onClick={(e) => { e.stopPropagation(); goNextEmbed(); }} aria-label="Next">
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── WEATHER ──────────────────────────────────── */}
          {activePanel === 'weather' && (
            <motion.div key="weather" custom={swipeDir} variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.2, ease: [0.19, 1, 0.22, 1] }}
              className={styles.compactContent}>
              <WeatherPanel />
            </motion.div>
          )}

          {/* ── CLOCK ────────────────────────────────────── */}
          {activePanel === 'clock' && (
            <motion.div key="clock" custom={swipeDir} variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.2, ease: [0.19, 1, 0.22, 1] }}
              className={styles.compactContent}>
              <ClockPanel />
            </motion.div>
          )}

          {/* ── GITHUB ───────────────────────────────────── */}
          {activePanel === 'github' && (
            <motion.div key="github" custom={swipeDir} variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.2, ease: [0.19, 1, 0.22, 1] }}
              className={styles.compactContent}>
              <GitHubPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
});
