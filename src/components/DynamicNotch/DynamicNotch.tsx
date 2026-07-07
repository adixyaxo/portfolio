import { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import clsx from 'clsx';
import { useSpotifyNowPlaying } from '../../hooks/useSpotifyNowPlaying';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { AudioVisualizer } from './AudioVisualizer';
import { GrainOverlay } from '../GrainOverlay/GrainOverlay';
import styles from './DynamicNotch.module.css';

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export const DynamicNotch = memo(function DynamicNotch() {
  const { track, loading, progressMs, progressPercent } = useSpotifyNowPlaying();
  const prefersReducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const openSpotify = useCallback(() => {
    if (track?.trackUrl) {
      window.open(track.trackUrl, '_blank', 'noopener,noreferrer');
    }
  }, [track?.trackUrl]);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.notchIdle}>
          <span className={styles.spotifyDot} />
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.notchIdle} title="Nothing playing on Spotify">
          <svg className={styles.spotifyIcon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
        </div>
      </div>
    );
  }

  const spring = prefersReducedMotion
    ? { duration: 0.2 }
    : { type: 'spring' as const, stiffness: 420, damping: 32, mass: 0.8 };

  return (
    <div className={styles.wrapper}>
      <motion.div
        className={clsx(styles.notch, expanded && styles.notchExpanded)}
        layout
        transition={spring}
        onClick={toggleExpanded}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={`Now playing: ${track.title} by ${track.artist}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpanded();
          }
        }}
      >
        <div
          className={styles.glow}
          style={{
            backgroundImage: track.albumArtUrl
              ? `url(${track.albumArtUrl})`
              : undefined,
          }}
          aria-hidden="true"
        />

        <AnimatePresence mode="wait" initial={false}>
          {!expanded ? (
            <motion.div
              key="compact"
              className={styles.compactContent}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className={styles.albumThumb}>
                {track.albumArtUrl ? (
                  <img src={track.albumArtUrl} alt="" className={styles.albumImg} />
                ) : (
                  <span className={styles.albumFallback} />
                )}
                <GrainOverlay intensity="light" />
              </div>
              <span className={styles.trackTitle}>
                {track.isRecent ? `↺ ${track.title}` : track.title}
              </span>
              <AudioVisualizer active={track.isPlaying} size="sm" />
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              className={styles.expandedContent}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.playerRow}>
                <div className={styles.albumLarge}>
                  {track.albumArtUrl ? (
                    <img src={track.albumArtUrl} alt="" className={styles.albumImg} />
                  ) : (
                    <span className={styles.albumFallback} />
                  )}
                </div>

                <div className={styles.trackInfo}>
                  <h3 className={styles.expandedTitle}>{track.title}</h3>
                  <p className={styles.expandedArtist}>
                    {track.isRecent ? `Last played · ${track.artist}` : track.artist}
                  </p>
                  <p className={styles.expandedAlbum}>{track.album}</p>

                  <div className={styles.progressRow}>
                    <div className={styles.progressTrack}>
                      <motion.div
                        className={styles.progressFill}
                        style={{ width: `${progressPercent}%` }}
                        layout
                      />
                    </div>
                    <div className={styles.timeLabels}>
                      <span>{formatTime(progressMs)}</span>
                      <span>{formatTime(track.durationMs)}</span>
                    </div>
                  </div>

                  <div className={styles.controls}>
                    <button
                      type="button"
                      className={styles.controlBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        openSpotify();
                      }}
                      aria-label="Open in Spotify"
                    >
                      <SkipBack size={16} />
                    </button>
                    <button
                      type="button"
                      className={clsx(styles.controlBtn, styles.controlBtnPrimary)}
                      onClick={(e) => {
                        e.stopPropagation();
                        openSpotify();
                      }}
                      aria-label={track.isPlaying ? 'Pause in Spotify' : 'Play in Spotify'}
                    >
                      {track.isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <button
                      type="button"
                      className={styles.controlBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        openSpotify();
                      }}
                      aria-label="Next in Spotify"
                    >
                      <SkipForward size={16} />
                    </button>
                    <button
                      type="button"
                      className={styles.spotifyLink}
                      onClick={(e) => {
                        e.stopPropagation();
                        openSpotify();
                      }}
                      aria-label="Open track in Spotify"
                    >
                      <ExternalLink size={14} />
                    </button>
                    <AudioVisualizer active={track.isPlaying} size="md" />
                  </div>
                </div>
              </div>

              {track.isDemo && (
                <p className={styles.demoHint}>
                  Run npm run spotify:setup to show your live playback
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className={styles.dots} aria-hidden="true">
        <span className={clsx(styles.dot, styles.dotActive)} />
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
    </div>
  );
});
