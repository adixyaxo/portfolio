/**
 * One-time local setup — run: npm run spotify:setup
 * Logs in with YOUR Spotify account and prints SPOTIFY_REFRESH_TOKEN for .env.
 * Visitors never see or use this flow.
 */
import http from 'http';
import { exec } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { generatePkce } from '../server/utils';
import {
  exchangeSpotifyCode,
  getClientCredentials,
  getSetupRedirectUri,
  getSpotifyLoginUrl,
} from '../server/spotify';

function loadEnv() {
  try {
    const content = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (key && !process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env optional until credentials are added
  }
}

function openBrowser(url: string) {
  const cmd =
    process.platform === 'darwin'
      ? `open "${url}"`
      : process.platform === 'win32'
        ? `start "" "${url}"`
        : `xdg-open "${url}"`;
  exec(cmd);
}

const PORT = 8765;

async function main() {
  loadEnv();

  if (!getClientCredentials()) {
    console.error('\n❌  Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to .env first.\n');
    process.exit(1);
  }

  const redirectUri = getSetupRedirectUri();
  const { verifier } = generatePkce();
  const loginUrl = getSpotifyLoginUrl(verifier, redirectUri);

  console.log('\n🎵  Spotify owner setup (one-time)\n');
  console.log('1. Add this redirect URI in Spotify Developer Dashboard → your app → Settings:');
  console.log(`   ${redirectUri}\n`);
  console.log('2. Opening browser — log in with YOUR Spotify account...\n');

  openBrowser(loginUrl);

  const server = http.createServer(async (req, res) => {
    if (!req.url?.startsWith('/callback')) {
      res.writeHead(404);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error || !code) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h2>Authorization failed. Close this tab and run npm run spotify:setup again.</h2>');
      server.close();
      process.exit(1);
    }

    try {
      const tokens = await exchangeSpotifyCode(code, verifier, redirectUri);

      if (!tokens.refresh_token) {
        throw new Error(
          'No refresh token returned — revoke app access at spotify.com/account/apps and retry'
        );
      }

      console.log('\n✅  Success! Add this line to your .env:\n');
      console.log(`SPOTIFY_REFRESH_TOKEN=${tokens.refresh_token}\n`);
      console.log(
        'Restart the dev server. Visitors will see what YOU are playing — no login for them.\n'
      );

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(
        '<h2>Done!</h2><p>Copy SPOTIFY_REFRESH_TOKEN from your terminal into .env, then restart.</p>'
      );
    } catch (err) {
      console.error('\n❌  Setup failed:', err);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end('<h2>Setup failed. Check the terminal.</h2>');
    }

    server.close();
    process.exit(0);
  });

  server.listen(PORT, '127.0.0.1', () => {
    console.log(`   Waiting for callback on ${redirectUri}\n`);
  });
}

main();
