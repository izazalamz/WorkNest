import { useEffect, useMemo, useState } from "react";
import {
  Cloud,
  Sun,
  Umbrella,
  Zap,
  Thermometer,
  Wind,
  RefreshCw,
  Home,
  Building2,
  Coffee,
  Smile,
} from "lucide-react";

const CACHE_KEY = "worknest_weather_cache_v1";
const CACHE_TTL_MS = 10 * 60 * 1000;

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.ts || !parsed?.data) return null;
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function saveCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // ignore
  }
}

function getWorkSuggestion(data, units) {
  if (!data) return null;

  const t = Number(data.temp);
  const icon = data.icon || "";
  const desc = (data.description || "").toLowerCase();

  const isStorm = icon.startsWith("11") || desc.includes("thunder");
  const isHeavyRain = icon.startsWith("09") || desc.includes("heavy rain");
  const isHeatwave =
    Number.isFinite(t) && (units === "imperial" ? t >= 95 : t >= 35);

  if (isStorm) {
    return {
      decision: "WFH Recommended",
      reason: "⚡ Stormy weather! Stay cozy at home today.",
      icon: Zap,
      color: "error",
    };
  }

  if (isHeavyRain) {
    return {
      decision: "WFH Recommended",
      reason: "☔ Heavy rain alert! Skip the commute puddle-jumping.",
      icon: Umbrella,
      color: "error",
    };
  }

  if (isHeatwave) {
    return {
      decision: "WFH Recommended",
      reason: "🔥 Heatwave! Office AC can't compete with your home fan.",
      icon: Thermometer,
      color: "warning",
    };
  }

  // Good weather - generate fun motivational messages
  const isSunny = icon.startsWith("01") || desc.includes("clear");
  const isPartlyCloudy = icon.startsWith("02") || icon.startsWith("03");
  const isCool =
    Number.isFinite(t) &&
    (units === "imperial" ? t >= 60 && t <= 75 : t >= 15 && t <= 24);

  const messages = [
    isSunny ? "☀️ Perfect office day! Free vitamin D included!" : null,
    isPartlyCloudy ? "⛅ Clouds are just nature's mood lighting!" : null,
    isCool ? "🌬️ Crisp air = fresh ideas! Come brainstorm!" : null,
    "🏢 Office snacks are waiting! Don't let them get lonely!",
    "👥 Team needs your awesome energy today!",
    "💡 Great minds think together (preferably in the office)!",
    "🚶‍♂️ Your favorite desk misses you!",
    "☕ Coffee machine is getting lonely!",
  ].filter(Boolean);

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return {
    decision: "Come to Office",
    reason: randomMessage || "Great day for office collaboration!",
    icon: Building2,
    color: "success",
  };
}

export default function WeatherWidget() {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const city = import.meta.env.VITE_WEATHER_CITY || "Dhaka";
  const units = import.meta.env.VITE_WEATHER_UNITS || "metric";

  const [data, setData] = useState(() => loadCache());
  const [loading, setLoading] = useState(!loadCache());
  const [error, setError] = useState("");

  const url = useMemo(() => {
    const q = encodeURIComponent(city);
    return `https://api.openweathermap.org/data/2.5/weather?q=${q}&appid=${apiKey}&units=${units}`;
  }, [apiKey, city, units]);

  useEffect(() => {
    if (!apiKey) {
      setError("Missing OpenWeather API key");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchWeather() {
      setError("");
      setLoading(true);

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Weather fetch failed");

        const json = await res.json();

        const trimmed = {
          name: json?.name,
          temp: json?.main?.temp,
          feelsLike: json?.main?.feels_like,
          humidity: json?.main?.humidity,
          wind: json?.wind?.speed,
          description: json?.weather?.[0]?.description,
          icon: json?.weather?.[0]?.icon,
          updatedAt: Date.now(),
        };

        if (!cancelled) {
          setData(trimmed);
          saveCache(trimmed);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load weather.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchWeather();

    return () => {
      cancelled = true;
    };
  }, [apiKey, url]);

  const tempUnit = units === "imperial" ? "°F" : "°C";
  const suggestion = getWorkSuggestion(data, units);
  const SuggestionIcon = suggestion?.icon || Cloud;

  const handleRefresh = () => {
    localStorage.removeItem(CACHE_KEY);
    setLoading(true);
    setData(null);
  };

  return (
    <div className="bg-card border border-border min-h-screen rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            Today's Weather
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {city}
            {data?.name && ` • ${data.name}`}
          </p>
        </div>
      </div>

      {/* Weather Data */}
      <div className="space-y-6">
        {loading && !data ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Checking weather...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <Cloud className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-error text-sm mb-3">{error}</p>
            <button onClick={handleRefresh} className="btn btn-outline btn-sm">
              Try Again
            </button>
          </div>
        ) : data ? (
          <>
            {/* Temperature & Icon */}
            <div className="flex items-center justify-between">
              <div className="flex items-end gap-4">
                <div className="text-5xl font-bold text-foreground">
                  {Math.round(data.temp)}
                  {tempUnit}
                </div>
                <div className="pb-2">
                  <p className="text-sm text-muted-foreground">
                    Feels like {Math.round(data.feelsLike)}
                    {tempUnit}
                  </p>
                  <p className="text-sm capitalize text-foreground">
                    {data.description}
                  </p>
                </div>
              </div>

              {data.icon && (
                <div className="w-20 h-20">
                  <img
                    src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
                    alt={data.description}
                    className="w-full h-full"
                  />
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Thermometer className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Humidity</p>
                  <p className="font-semibold text-foreground">
                    {data.humidity}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Wind className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wind Speed</p>
                  <p className="font-semibold text-foreground">
                    {Number(data.wind).toFixed(1)} m/s
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            {suggestion && (
              <div
                className={`p-4 rounded-lg border ${
                  suggestion.color === "success"
                    ? "border-success/20 bg-success/5"
                    : suggestion.color === "warning"
                    ? "border-warning/20 bg-warning/5"
                    : "border-error/20 bg-error/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      suggestion.color === "success"
                        ? "bg-success/10 text-success"
                        : suggestion.color === "warning"
                        ? "bg-warning/10 text-warning"
                        : "bg-error/10 text-error"
                    }`}
                  >
                    <SuggestionIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-foreground">
                        Workspace Recommendation
                      </p>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          suggestion.color === "success"
                            ? "bg-success/10 text-success"
                            : suggestion.color === "warning"
                            ? "bg-warning/10 text-warning"
                            : "bg-error/10 text-error"
                        }`}
                      >
                        {suggestion.decision}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">
                      {suggestion.reason}
                    </p>
                    {suggestion.color === "success" && (
                      <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                        <Smile className="w-4 h-4" />
                        <span>Great day for collaboration!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            {data.updatedAt && (
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Updated {Math.round((Date.now() - data.updatedAt) / 60000)}{" "}
                  minutes ago
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <Cloud className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              Weather data unavailable
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
