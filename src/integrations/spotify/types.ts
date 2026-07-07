export interface SpotifyTrack {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumArtUrl: string;
  progressMs: number;
  durationMs: number;
  trackUrl: string;
  isDemo?: boolean;
  isRecent?: boolean;
}

export interface SpotifyNowPlayingResponse {
  track: SpotifyTrack | null;
  configured: boolean;
}
