import { fetchWakaTimeStats } from '../../server/wakatime';

export default async function handler(
  req: { method?: string },
  res: {
    setHeader: (key: string, value: string) => void;
    status: (code: number) => { json: (body: unknown) => void };
  }
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = await fetchWakaTimeStats();
    if (!data) {
      return res.status(200).json({ ok: false, data: null });
    }
    return res.status(200).json({ ok: true, data });
  } catch (err) {
    console.error('WakaTime API error:', err);
    return res.status(500).json({ ok: false, data: null });
  }
}
