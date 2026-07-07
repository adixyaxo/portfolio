import { getNowPlaying } from '../../server/spotify';

export default async function handler(
  req: { method?: string },
  res: {
    setHeader: (key: string, value: string) => void;
    status: (code: number) => { json: (body: unknown) => void };
  }
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { track, configured } = await getNowPlaying();
    return res.status(200).json({ track, configured });
  } catch (err) {
    console.error('Spotify API error:', err);
    return res.status(500).json({ error: 'Failed to fetch now playing' });
  }
}
