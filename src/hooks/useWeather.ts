import { useState, useEffect, useCallback, useRef } from 'react';

export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  city: string;
  isDay: boolean;
}

const WMO_CODES: Record<number, { label: string; icon: string; nightIcon?: string }> = {
  0: { label: 'Clear', icon: '☀️', nightIcon: '🌙' },
  1: { label: 'Mostly Clear', icon: '🌤️', nightIcon: '🌙' },
  2: { label: 'Partly Cloudy', icon: '⛅', nightIcon: '☁️' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Foggy', icon: '🌫️' },
  48: { label: 'Icy Fog', icon: '🌫️' },
  51: { label: 'Light Drizzle', icon: '🌦️' },
  53: { label: 'Drizzle', icon: '🌦️' },
  55: { label: 'Heavy Drizzle', icon: '🌧️' },
  61: { label: 'Light Rain', icon: '🌦️' },
  63: { label: 'Rain', icon: '🌧️' },
  65: { label: 'Heavy Rain', icon: '🌧️' },
  71: { label: 'Light Snow', icon: '🌨️' },
  73: { label: 'Snow', icon: '❄️' },
  75: { label: 'Heavy Snow', icon: '❄️' },
  80: { label: 'Showers', icon: '🌧️' },
  81: { label: 'Heavy Showers', icon: '🌧️' },
  82: { label: 'Violent Showers', icon: '⛈️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm + Hail', icon: '⛈️' },
  99: { label: 'Thunderstorm + Heavy Hail', icon: '⛈️' },
};

// Default: Delhi/Gurugram
const DEFAULT_LAT = 28.4595;
const DEFAULT_LON = 77.0266;

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  // Cache resolved coordinates so refresh intervals use the correct location
  const coordsRef = useRef<{ lat: number; lon: number; city: string }>({
    lat: DEFAULT_LAT,
    lon: DEFAULT_LON,
    city: 'Gurugram',
  });

  const fetchWeather = useCallback(async (lat: number, lon: number, city: string) => {
    if (document.visibilityState === 'hidden') return;
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&timezone=auto`
      );
      if (!res.ok) return;

      const data = await res.json();
      const current = data.current;
      const code = current.weather_code as number;
      const isDay = current.is_day === 1;
      const wmo = WMO_CODES[code] || { label: 'Unknown', icon: '🌡️' };

      setWeather({
        temperature: Math.round(current.temperature_2m),
        condition: wmo.label,
        icon: isDay ? wmo.icon : (wmo.nightIcon || wmo.icon),
        city,
        isDay,
      });
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Cache the resolved coordinates for future refreshes
          coordsRef.current = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            city: 'Current Location',
          };
          fetchWeather(pos.coords.latitude, pos.coords.longitude, 'Current Location');
        },
        () => {
          // Fallback to default
          fetchWeather(DEFAULT_LAT, DEFAULT_LON, 'Gurugram');
        },
        { timeout: 5000 }
      );
    } else {
      fetchWeather(DEFAULT_LAT, DEFAULT_LON, 'Gurugram');
    }

    // Refresh every 10 minutes — using cached coordinates
    const interval = setInterval(() => {
      const { lat, lon, city } = coordsRef.current;
      fetchWeather(lat, lon, city);
    }, 600_000);

    return () => clearInterval(interval);
  }, [fetchWeather]);

  return { weather, loading };
}
