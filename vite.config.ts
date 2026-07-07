import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { getNowPlaying } from './server/spotify';
import { fetchWakaTimeStats } from './server/wakatime';

function apiPlugin(): Plugin {
  return {
    name: 'api-routes',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];

        if (url === '/api/spotify/now-playing' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-cache');
          try {
            const { track, configured } = await getNowPlaying();
            res.statusCode = 200;
            res.end(JSON.stringify({ track, configured }));
          } catch (err) {
            console.error('Spotify API error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to fetch now playing' }));
          }
          return;
        }

        if (url === '/api/wakatime/stats' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
          try {
            const data = await fetchWakaTimeStats();
            res.statusCode = 200;
            res.end(JSON.stringify({ ok: !!data, data }));
          } catch (err) {
            console.error('WakaTime API error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ ok: false, data: null }));
          }
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env.SPOTIFY_CLIENT_ID = env.SPOTIFY_CLIENT_ID;
  process.env.SPOTIFY_CLIENT_SECRET = env.SPOTIFY_CLIENT_SECRET;
  process.env.SPOTIFY_REFRESH_TOKEN = env.SPOTIFY_REFRESH_TOKEN;
  process.env.SPOTIFY_REDIRECT_URI = env.SPOTIFY_REDIRECT_URI;
  process.env.WAKATIME_API_KEY = env.WAKATIME_API_KEY ?? env.VITE_WAKATIME_API_KEY;
  process.env.WAKATIME_USERNAME = env.WAKATIME_USERNAME;

  return {
    plugins: [react(), apiPlugin()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            motion: ['framer-motion'],
            gsap: ['gsap'],
            three: ['three'],
          },
        },
      },
    },
    server: {
      proxy: {
        '/api/wakatime': {
          target: 'https://wakatime.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/wakatime/, '/api/v1'),
          bypass(req) {
            if (req.url?.startsWith('/api/wakatime/stats')) {
              return req.url;
            }
          },
        },
      },
    },
  };
});
