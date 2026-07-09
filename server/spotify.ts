import type { IncomingMessage } from 'http';
import crypto from 'crypto';

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

export const DEMO_TRACK: SpotifyTrack = {
  isPlaying: true,
  title: 'rockstar',
  artist: 'Post Malone',
  album: 'beerbongs & bentleys',
  albumArtUrl:
    'https://i.scdn.co/image/ab67616d0000b273472910efde413731ffb0fe68',
  progressMs: 45_000,
  durationMs: 218_000,
  trackUrl: 'https://open.spotify.com/track/0e7ipj03S05BNilyu5bRzt',
  isDemo: true,
};

const SCOPES =
  'user-read-currently-playing user-read-playback-state user-read-recently-played';

interface SpotifyTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyCurrentlyPlayingResponse {
  is_playing: boolean;
  progress_ms: number;
  item: {
    name: string;
    duration_ms: number;
    external_urls: { spotify: string };
    album: {
      name: string;
      images: Array<{ url: string; width: number; height: number }>;
    };
    artists: Array<{ name: string }>;
  } | null;
}

/* ── In-memory cache ───────────────────────────────────────────── */
let cachedResult: { track: SpotifyTrack | null; configured: boolean } | null = null;
let cacheTime = 0;
const CACHE_TTL = 10_000; // 10 seconds

/* ── Safe fetch with timeout ───────────────────────────────────── */
async function safeFetch(
  url: string,
  opts?: RequestInit,
  timeoutMs = 8_000
): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    return res;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function getClientCredentials(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

/** Only the site owner's refresh token from .env — never visitor cookies. */
function getOwnerRefreshToken(): string | null {
  return process.env.SPOTIFY_REFRESH_TOKEN ?? null;
}

export function getSpotifyLoginUrl(verifier: string, redirectUri: string): string {
  const { clientId } = getClientCredentials()!;
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });

  return `https://accounts.spotify.com/authorize?${params}`;
}

export async function exchangeSpotifyCode(
  code: string,
  verifier: string,
  redirectUri: string
): Promise<SpotifyTokenResponse> {
  const creds = getClientCredentials();
  if (!creds) throw new Error('Spotify not configured');

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
    client_id: creds.clientId,
  });

  const res = await safeFetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString('base64')}`,
    },
    body,
  });

  if (!res || !res.ok) {
    throw new Error(`Token exchange failed: ${res?.status ?? 'timeout'}`);
  }

  return res.json() as Promise<SpotifyTokenResponse>;
}

async function getAccessToken(): Promise<string | null> {
  const creds = getClientCredentials();
  const refreshToken = getOwnerRefreshToken();

  if (!creds || !refreshToken) return null;

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const res = await safeFetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString('base64')}`,
    },
    body,
  });

  if (!res || !res.ok) {
    return null;
  }

  const data = (await res.json()) as SpotifyTokenResponse;
  return data.access_token;
}

interface SpotifyRecentlyPlayedResponse {
  items: Array<{
    played_at: string;
    track: {
      name: string;
      duration_ms: number;
      external_urls: { spotify: string };
      album: {
        name: string;
        images: Array<{ url: string; width: number; height: number }>;
      };
      artists: Array<{ name: string }>;
    };
  }>;
}

function mapTrack(
  item: SpotifyCurrentlyPlayingResponse['item'],
  isPlaying: boolean,
  progressMs: number,
  extras?: { isRecent?: boolean }
): SpotifyTrack | null {
  if (!item) return null;

  const albumArt =
    item.album.images.find((img) => img.width >= 64)?.url ??
    item.album.images[0]?.url ??
    '';

  return {
    isPlaying,
    title: item.name,
    artist: item.artists.map((a) => a.name).join(', '),
    album: item.album.name,
    albumArtUrl: albumArt,
    progressMs,
    durationMs: item.duration_ms,
    trackUrl: item.external_urls.spotify,
    ...extras,
  };
}

async function fetchRecentlyPlayed(accessToken: string): Promise<SpotifyTrack | null> {
  const res = await safeFetch(
    'https://api.spotify.com/v1/me/player/recently-played?limit=1',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res || !res.ok) return null;

  const data = (await res.json()) as SpotifyRecentlyPlayedResponse;
  const recent = data.items?.[0];
  if (!recent?.track) return null;

  return mapTrack(recent.track, false, 0, { isRecent: true });
}

export async function getNowPlaying(_req?: IncomingMessage): Promise<{
  track: SpotifyTrack | null;
  configured: boolean;
}> {
  // Return cached result if fresh
  if (cachedResult && Date.now() - cacheTime < CACHE_TTL) {
    return cachedResult;
  }

  const creds = getClientCredentials();
  const refreshToken = getOwnerRefreshToken();

  if (!creds) {
    return { track: DEMO_TRACK, configured: false };
  }

  if (!refreshToken) {
    return { track: DEMO_TRACK, configured: true };
  }

  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { track: DEMO_TRACK, configured: true };
    }

    const res = await safeFetch(
      'https://api.spotify.com/v1/me/player/currently-playing',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (res && res.status === 200) {
      const data = (await res.json()) as SpotifyCurrentlyPlayingResponse;
      const track = mapTrack(data.item, data.is_playing, data.progress_ms ?? 0);
      if (track) {
        const result = { configured: true, track };
        cachedResult = result;
        cacheTime = Date.now();
        return result;
      }
    }

    if (res && (res.status === 204 || res.status === 404)) {
      const recent = await fetchRecentlyPlayed(accessToken);
      if (recent) {
        const result = { track: recent, configured: true };
        cachedResult = result;
        cacheTime = Date.now();
        return result;
      }
      return { track: null, configured: true };
    }

    if (res && !res.ok) {
      const recent = await fetchRecentlyPlayed(accessToken);
      if (recent) return { track: recent, configured: true };
      return { track: DEMO_TRACK, configured: true };
    }

    // res is null (timeout) — return demo/cached
    if (cachedResult) return cachedResult;
    return { track: DEMO_TRACK, configured: true };
  } catch (err) {
    console.warn('Spotify fetch failed (network timeout):', (err as Error).message);
    if (cachedResult) return cachedResult;
    return { track: DEMO_TRACK, configured: true };
  }
}

/** Used only by the local setup script — not exposed to site visitors. */
export function getSetupRedirectUri(): string {
  return process.env.SPOTIFY_SETUP_REDIRECT_URI ?? 'http://127.0.0.1:8765/callback';
}

export { getClientCredentials, getOwnerRefreshToken };
