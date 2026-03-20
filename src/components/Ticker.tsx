"use client";

interface TickerCity {
  name: string;
  aqi: number | null;
}

interface Props {
  cities: TickerCity[];
}

export function Ticker({ cities }: Props) {
  const items = cities.filter((c) => c.aqi != null);
  if (items.length === 0) return null;

  const text = items.map((c) => `${c.name} AQI ${c.aqi}`).join("  ·  ");
  // Duplicate for seamless loop
  const doubled = `${text}  ·  ${text}  ·  `;

  return (
    <div className="bg-zinc-900 h-8 flex items-center overflow-hidden group">
      <div className="ticker-track group-hover:[animation-play-state:paused]">
        <span className="text-xs text-zinc-400 whitespace-nowrap">{doubled}</span>
      </div>
    </div>
  );
}
