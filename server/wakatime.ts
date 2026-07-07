export interface WakaLang {
  name: string;
  percent: number;
  hours: number;
  minutes: number;
  color: string;
}

export interface WakaDailyActivity {
  day: string;
  hours: number;
}

export interface WakaTimeData {
  languages: WakaLang[];
  daily: WakaDailyActivity[];
  totalTime: string;
  rangeLabel: string;
  source: 'api' | 'public' | 'fallback';
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3572A5',
  'C++': '#f34b7d',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  Kotlin: '#A97BFF',
  C: '#555555',
  Ruby: '#701516',
  Lua: '#000080',
  Shell: '#89e051',
  Bash: '#89e051',
  JSON: '#999999',
  YAML: '#cb171e',
  Markdown: '#083fa1',
  Other: '#666666',
};

function getApiKey(): string | null {
  return process.env.WAKATIME_API_KEY ?? process.env.VITE_WAKATIME_API_KEY ?? null;
}

function getUsername(): string {
  return process.env.WAKATIME_USERNAME ?? 'adixyaxo';
}

/** WakaTime docs: base64-encode the API key only (no trailing colon). */
function authHeader(apiKey: string): string {
  return `Basic ${Buffer.from(apiKey).toString('base64')}`;
}

function parseLanguages(data: Record<string, unknown>): WakaLang[] {
  return ((data.languages as Array<{ name: string; percent: number; hours: number; minutes: number }>) || [])
    .slice(0, 7)
    .map((l) => ({
      name: l.name,
      percent: Math.round(l.percent * 100) / 100,
      hours: l.hours,
      minutes: l.minutes,
      color: LANG_COLORS[l.name] || '#666666',
    }));
}

async function fetchWithApiKey(): Promise<WakaTimeData | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const headers = { Authorization: authHeader(apiKey) };

  const statsRes = await fetch(
    'https://wakatime.com/api/v1/users/current/stats/last_7_days',
    { headers }
  );

  if (!statsRes.ok) {
    // Try query-param auth as documented fallback
    const altRes = await fetch(
      `https://wakatime.com/api/v1/users/current/stats/last_7_days?api_key=${encodeURIComponent(apiKey)}`
    );
    if (!altRes.ok) {
      if (statsRes.status === 401) {
        console.warn(
          'WakaTime API key rejected — regenerate at wakatime.com/settings/api-key. Using public profile fallback.'
        );
      } else {
        console.error('WakaTime stats failed:', statsRes.status, await statsRes.text());
      }
      return null;
    }
    const altJson = (await altRes.json()) as { data: Record<string, unknown> };
    return buildApiResult(altJson.data, 'Last 7 days');
  }

  const statsJson = (await statsRes.json()) as { data: Record<string, unknown> };
  return buildApiResult(statsJson.data, 'Last 7 days');
}

async function buildApiResult(
  data: Record<string, unknown>,
  rangeLabel: string
): Promise<WakaTimeData> {
  const languages = parseLanguages(data);
  const totalTime = (data.human_readable_total as string) || '0h 0m';

  let daily: WakaDailyActivity[] = [];
  const apiKey = getApiKey();
  if (apiKey) {
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 6);
      const fmt = (d: Date) => d.toISOString().split('T')[0];
      const headers = { Authorization: authHeader(apiKey) };

      const sumRes = await fetch(
        `https://wakatime.com/api/v1/users/current/summaries?start=${fmt(start)}&end=${fmt(end)}`,
        { headers }
      );

      if (sumRes.ok) {
        const sumJson = (await sumRes.json()) as {
          data: Array<{ range: { date: string }; grand_total?: { total_seconds?: number } }>;
        };
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        daily = (sumJson.data || []).map((d) => ({
          day: dayNames[new Date(d.range.date).getDay()],
          hours: Math.round(((d.grand_total?.total_seconds || 0) / 3600) * 10) / 10,
        }));
      }
    } catch {
      // optional
    }
  }

  return { languages, daily, totalTime, rangeLabel, source: 'api' };
}

async function fetchPublicProfile(): Promise<WakaTimeData | null> {
  const username = getUsername();
  const res = await fetch(
    `https://wakatime.com/api/v1/users/${encodeURIComponent(username)}/stats/all_time`
  );

  if (!res.ok) {
    console.error('WakaTime public profile failed:', res.status);
    return null;
  }

  const json = (await res.json()) as { data: Record<string, unknown> };
  const data = json.data;

  return {
    languages: parseLanguages(data),
    daily: [],
    totalTime: (data.human_readable_total as string) || '0h 0m',
    rangeLabel: (data.human_readable_range as string) || 'All time',
    source: 'public',
  };
}

export async function fetchWakaTimeStats(): Promise<WakaTimeData | null> {
  const fromApi = await fetchWithApiKey();
  if (fromApi) return fromApi;

  const fromPublic = await fetchPublicProfile();
  if (fromPublic) return fromPublic;

  return null;
}
