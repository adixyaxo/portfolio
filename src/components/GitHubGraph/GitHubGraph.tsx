"use client";
import React, { memo, useRef, useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Github, Loader2 } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./GitHubGraph.module.css";

gsap.registerPlugin(ScrollTrigger);

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface ContributionWeek {
  days: ContributionDay[];
}

const LEVEL_COLORS = [
  "rgba(255,255,255,0.02)",
  "#1a1a1a",
  "#0d0d0d",
  "#050505",
  "#000000",
];

const HOVER_COLORS = [
  "rgba(255,255,255,0.05)",
  "#2a2a2a",
  "#1a1a1a",
  "#0d0d0d",
  "#000000",
];

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const GitHubGraph = memo(function GitHubGraph({ username = "adixyaxo" }: { username?: string }) {
  const [weeks, setWeeks] = useState<ContributionWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalContributions, setTotalContributions] = useState(0);
  const [error, setError] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  
  const sectionRef = useRef<HTMLElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.innerWidth < 768) return;

    const ctx = gsap.context(() => {
      if (graphRef.current) {
        gsap.fromTo(graphRef.current, 
          { opacity: 0, y: 30 },
          { 
            opacity: 1, 
            y: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        if (data?.contributions) {
          const allDays: ContributionDay[] = data.contributions.map((d: any) => ({
            date: d.date,
            count: d.count,
            level: d.level,
          }));

          const grouped: ContributionWeek[] = [];
          for (let i = 0; i < allDays.length; i += 7) {
            grouped.push({ days: allDays.slice(i, i + 7) });
          }

          setWeeks(grouped);
          setTotalContributions(data.total?.lastYear ?? allDays.reduce((s, d) => s + d.count, 0));
        }
      } catch (err) {
        console.error("GitHub contributions fetch failed", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [username]);

  const monthLabels = useMemo(() => {
    if (!weeks.length) return [];
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    for (let i = 0; i < weeks.length; i++) {
      const day = weeks[i].days[0];
      if (!day) continue;
      const month = new Date(day.date).getMonth();
      if (month !== lastMonth) {
        labels.push({ label: MONTH_LABELS[month], col: i });
        lastMonth = month;
      }
    }
    return labels;
  }, [weeks]);

  const handleMouseEnter = useCallback((key: string) => setHoveredCell(key), []);
  const handleMouseLeave = useCallback(() => setHoveredCell(null), []);

  if (error) return null;

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className={styles.section}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <Github size={16} color="var(--color-ash-mist)" />
            <h3 className={styles.title}>
              <span className={styles.count}>{totalContributions.toLocaleString()}</span> contributions in the last year
            </h3>
          </div>
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            @{username}
          </a>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <Loader2 className={styles.loader} size={20} />
          </div>
        ) : (
          <div ref={graphRef} className={styles.graphWrapper}>
            <div className={styles.months}>
              {monthLabels.map((m, i) => (
                <span
                  key={`month-${i}`}
                  className={styles.monthLabel}
                  style={{ left: `${m.col * 13}px` }}
                >
                  {m.label}
                </span>
              ))}
            </div>

            <div className={styles.grid}>
              {weeks.map((week, wi) => (
                <div key={wi} className={styles.week}>
                  {week.days.map((day, di) => {
                    const cellKey = `${wi}-${di}`;
                    const isHovered = hoveredCell === cellKey;
                    return (
                      <div
                        key={di}
                        className={styles.cell}
                        style={{
                          backgroundColor: isHovered ? HOVER_COLORS[day.level] : LEVEL_COLORS[day.level],
                          transform: isHovered ? 'scale(1.4)' : 'scale(1)',
                          boxShadow: isHovered ? `0 0 8px ${HOVER_COLORS[day.level]}` : 'none',
                          transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
                        }}
                        title={`${day.date}: ${day.count} contribution${day.count !== 1 ? "s" : ""}`}
                        onMouseEnter={() => handleMouseEnter(cellKey)}
                        onMouseLeave={handleMouseLeave}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            <div className={styles.legend}>
              <span>Less</span>
              {LEVEL_COLORS.map((color, i) => (
                <div
                  key={i}
                  className={styles.legendCell}
                  style={{ backgroundColor: color }}
                />
              ))}
              <span>More</span>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
});
