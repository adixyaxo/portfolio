import crypto from 'crypto';
import type { IncomingMessage } from 'http';

export function parseCookies(header?: string): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header.split(';').map((part) => {
      const [key, ...rest] = part.trim().split('=');
      return [key, decodeURIComponent(rest.join('='))];
    })
  );
}

export function getCookie(req: IncomingMessage, name: string): string | undefined {
  return parseCookies(req.headers.cookie)[name];
}

export function generatePkce(): { verifier: string; challenge: string } {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
  return { verifier, challenge };
}

export function getSpotifyRedirectUri(req?: IncomingMessage): string {
  if (process.env.SPOTIFY_REDIRECT_URI) {
    return process.env.SPOTIFY_REDIRECT_URI;
  }
  if (req?.headers.host) {
    const proto = req.headers['x-forwarded-proto'] ?? 'http';
    return `${proto}://${req.headers.host}/api/spotify/callback`;
  }
  return 'http://localhost:5173/api/spotify/callback';
}
