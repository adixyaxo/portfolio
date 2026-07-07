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
  day: string;
  hours: number;
}

interface WakaTimeApiResponse {
  ok: boolean;
  data: {
    languages: WakaLang[];
    daily: WakaDailyActivity[];
    totalTime: string;
    rangeLabel?: string;
    source?: string;
  } | null;
}

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
  const [rangeLabel, setRangeLabel] = useState("Last 7 days");

  useEffect(() => {
    const fetchWakaTime = async () => {
      try {
        const res = await fetch("/api/wakatime/stats");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = (await res.json()) as WakaTimeApiResponse;
        if (!json.ok || !json.data) throw new Error("No data");

        setLanguages(json.data.languages.length > 0 ? json.data.languages : FALLBACK_LANGUAGES);
        setDaily(json.data.daily.length > 0 ? json.data.daily : FALLBACK_DAILY);
        setTotalTime(json.data.totalTime || FALLBACK_TOTAL);
        setRangeLabel(json.data.rangeLabel || "Last 7 days");
      } catch (err) {
        console.info("WakaTime: using fallback data", err);
        setLanguages(FALLBACK_LANGUAGES);
        setDaily(FALLBACK_DAILY);
        setTotalTime(FALLBACK_TOTAL);
      } finally {
        setLoading(false);
      }
    };

    if (document.visibilityState !== "hidden") {
      fetchWakaTime();
    }
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
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Languages</h3>
          <span className={styles.panelMeta}>{rangeLabel}</span>
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
