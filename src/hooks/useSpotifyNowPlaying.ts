import { useState, useEffect, useCallback, useRef } from 'react';
import type { SpotifyNowPlayingResponse, SpotifyTrack } from '../integrations/spotify/types';

const POLL_INTERVAL = 10_000;

export function useSpotifyNowPlaying() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progressMs, setProgressMs] = useState(0);
  const lastFetchRef = useRef<{ progressMs: number; isPlaying: boolean; fetchedAt: number } | null>(null);

  const fetchNowPlaying = useCallback(async () => {
    if (document.visibilityState === 'hidden') return;

    try {
      const res = await fetch('/api/spotify/now-playing');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = (await res.json()) as SpotifyNowPlayingResponse;
      setTrack(data.track);
      setConfigured(data.configured);

      if (data.track) {
        lastFetchRef.current = {
          progressMs: data.track.progressMs,
          isPlaying: data.track.isPlaying,
          fetchedAt: Date.now(),
        };
        setProgressMs(data.track.progressMs);
      }
    } catch (err) {
      console.info('Spotify: failed to fetch now playing', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, POLL_INTERVAL);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetchNowPlaying();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [fetchNowPlaying]);

  useEffect(() => {
    if (!track?.isPlaying) return;

    const tick = setInterval(() => {
      const last = lastFetchRef.current;
      if (!last?.isPlaying) return;
      const elapsed = Date.now() - last.fetchedAt;
      const next = Math.min(last.progressMs + elapsed, track.durationMs);
      setProgressMs(next);
    }, 1000);

    return () => clearInterval(tick);
  }, [track?.isPlaying, track?.durationMs]);

  const progressPercent =
    track && track.durationMs > 0 ? (progressMs / track.durationMs) * 100 : 0;

  return {
    track,
    configured,
    loading,
    progressMs,
    progressPercent,
    refetch: fetchNowPlaying,
  };
}
