"use client"
import React, { memo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./WakaTimeStats.module.css";

interface WakaLang {
  name: string;
  percent: number;
  hours: number;
  minutes: number;
  color: string;
}

interface WakaDailyActivity {
  day: string;       // "Mon", "Tue", etc.
  hours: number;
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3572A5",
  "C++": "#f34b7d",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  Kotlin: "#A97BFF",
  C: "#555555",
  Ruby: "#701516",
  Lua: "#000080",
  Shell: "#89e051",
  Bash: "#89e051",
  JSON: "#999999",
  YAML: "#cb171e",
  Markdown: "#083fa1",
  Other: "#666666",
};

const FALLBACK_LANGUAGES: WakaLang[] = [
  { name: "TypeScript", percent: 42, hours: 21, minutes: 14, color: "#3178c6" },
  { name: "Python", percent: 24, hours: 12, minutes: 5, color: "#3572A5" },
  { name: "C++", percent: 14, hours: 7, minutes: 10, color: "#f34b7d" },
  { name: "CSS", percent: 8, hours: 4, minutes: 2, color: "#563d7c" },
  { name: "Rust", percent: 6, hours: 3, minutes: 8, color: "#dea584" },
  { name: "Go", percent: 4, hours: 2, minutes: 0, color: "#00ADD8" },
  { name: "HTML", percent: 2, hours: 0, minutes: 38, color: "#e34c26" },
];

const FALLBACK_DAILY: WakaDailyActivity[] = [
  { day: "Mon", hours: 6.2 },
  { day: "Tue", hours: 8.5 },
  { day: "Wed", hours: 4.1 },
  { day: "Thu", hours: 7.8 },
  { day: "Fri", hours: 9.2 },
  { day: "Sat", hours: 3.4 },
  { day: "Sun", hours: 2.1 },
];

const FALLBACK_TOTAL = "50h 17m";

export const WakaTimeStats = memo(function WakaTimeStats() {
  const [loading, setLoading] = useState(true);
  const [languages, setLanguages] = useState<WakaLang[]>([]);
  const [daily, setDaily] = useState<WakaDailyActivity[]>([]);
  const [totalTime, setTotalTime] = useState("");

  useEffect(() => {
    const fetchWakaTime = async () => {
      try {
        const apiKey = import.meta.env.VITE_WAKATIME_API_KEY;
        if (!apiKey) throw new Error("No API key");

        const authHeader = `Basic ${btoa(apiKey)}`;

        // Fetch stats (languages, total time)
        const statsRes = await fetch(
          "/api/wakatime/users/current/stats/last_7_days",
          { headers: { Authorization: authHeader } }
        );
        if (!statsRes.ok) throw new Error(`Stats: HTTP ${statsRes.status}`);
        const statsJson = await statsRes.json();
        const data = statsJson.data;

        // Parse languages
        const langs: WakaLang[] = (data.languages || [])
          .slice(0, 7)
          .map((l: any) => ({
            name: l.name,
            percent: Math.round(l.percent * 100) / 100,
            hours: l.hours,
            minutes: l.minutes,
            color: LANG_COLORS[l.name] || "#666666",
          }));

        const totalStr = data.human_readable_total || FALLBACK_TOTAL;
        const dailyAvg = data.human_readable_daily_average || "";

        setLanguages(langs.length > 0 ? langs : FALLBACK_LANGUAGES);
        setTotalTime(totalStr);

        // Try fetching summaries for daily breakdown
        try {
          const end = new Date();
          const start = new Date();
          start.setDate(end.getDate() - 6);
          const fmt = (d: Date) => d.toISOString().split("T")[0];

          const sumRes = await fetch(
            `/api/wakatime/users/current/summaries?start=${fmt(start)}&end=${fmt(end)}`,
            { headers: { Authorization: authHeader } }
          );

          if (sumRes.ok) {
            const sumJson = await sumRes.json();
            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const dailyData: WakaDailyActivity[] = (sumJson.data || []).map((d: any) => ({
              day: dayNames[new Date(d.range.date).getDay()],
              hours: Math.round(((d.grand_total?.total_seconds || 0) / 3600) * 10) / 10,
            }));
            setDaily(dailyData.length > 0 ? dailyData : FALLBACK_DAILY);
          } else {
            setDaily(FALLBACK_DAILY);
          }
        } catch {
          setDaily(FALLBACK_DAILY);
        }
      } catch (err) {
        console.info("WakaTime: using fallback data", err);
        setLanguages(FALLBACK_LANGUAGES);
        setDaily(FALLBACK_DAILY);
        setTotalTime(FALLBACK_TOTAL);
      } finally {
        setLoading(false);
      }
    };
    fetchWakaTime();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  const maxPercent = Math.max(...languages.map(l => l.percent), 1);
  const maxDailyHours = Math.max(...daily.map(d => d.hours), 1);

  return (
    <div className={styles.dashboardGrid}>
      
      {/* LEFT: Language Breakdown — Horizontal Bar Chart */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Languages</h3>
          <span className={styles.panelMeta}>Last 7 days</span>
        </div>

        <div className={styles.langList}>
          {languages.map((lang, idx) => (
            <div key={lang.name} className={styles.langRow}>
              <span className={styles.langName}>{lang.name}</span>
              <div className={styles.barTrack}>
                <motion.div
                  className={styles.barFill}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(lang.percent / maxPercent) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: idx * 0.08, ease: [0.19, 1, 0.22, 1] }}
                />
              </div>
              <span className={styles.langTime}>
                {lang.hours}h {lang.minutes}m
              </span>
              <span className={styles.langPct}>{lang.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Daily Activity + Total */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Activity</h3>
          <span className={styles.panelTotal}>{totalTime}</span>
        </div>

        <div className={styles.activityChart}>
          {daily.map((d, idx) => {
            const heightPct = (d.hours / maxDailyHours) * 100;
            return (
              <div key={d.day} className={styles.activityCol}>
                <div className={styles.activityBarTrack}>
                  <motion.div
                    className={styles.activityBar}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${heightPct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: idx * 0.08, ease: [0.19, 1, 0.22, 1] }}
                  />
                </div>
                <span className={styles.activityHours}>{d.hours}h</span>
                <span className={styles.activityDay}>{d.day}</span>
              </div>
            );
          })}
        </div>

        {/* Mini stat row */}
        <div className={styles.miniStats}>
          <div className={styles.miniStat}>
            <span className={styles.miniStatValue}>{daily.reduce((sum, d) => sum + d.hours, 0).toFixed(0)}h</span>
            <span className={styles.miniStatLabel}>This Week</span>
          </div>
          <div className={styles.miniStat}>
            <span className={styles.miniStatValue}>{(daily.reduce((sum, d) => sum + d.hours, 0) / 7).toFixed(1)}h</span>
            <span className={styles.miniStatLabel}>Daily Avg</span>
          </div>
          <div className={styles.miniStat}>
            <span className={styles.miniStatValue}>{languages[0]?.name || "—"}</span>
            <span className={styles.miniStatLabel}>Top Lang</span>
          </div>
        </div>
      </div>

    </div>
  );
});
