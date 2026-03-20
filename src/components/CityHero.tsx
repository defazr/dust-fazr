import { getAqiInfo } from "@/lib/aqi";

interface Props {
  cityName: string;
  country: string;
  aqi: number | null;
  updatedAt: string | null;
}

export function CityHero({ cityName, country, aqi, updatedAt }: Props) {
  const info = getAqiInfo(aqi);

  return (
    <section className="relative rounded-3xl overflow-hidden p-6 md:p-10 bg-[#121212] border border-[#1e1e1e] shadow-lg shadow-black/20">
      {/* Subtle gradient glow */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          background: `radial-gradient(ellipse at top right, ${info.color}, transparent 60%)`,
        }}
      />

      <div className="relative z-10 overflow-hidden">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-[0.2em]">
          {country}
        </p>
        <h1 className="text-3xl md:text-5xl font-black text-white mt-2 tracking-tight break-words leading-tight">
          {cityName}
        </h1>

        <div className="mt-8 md:mt-12 flex items-end gap-5 md:gap-8 flex-wrap">
          {/* AQI number with glow */}
          <span
            className="text-[72px] md:text-[96px] font-black leading-none tracking-tighter"
            style={{
              color: info.color,
              filter: `drop-shadow(0 0 24px ${info.color}40)`,
            }}
          >
            {aqi ?? "—"}
          </span>
          <div className="mb-2 md:mb-4 min-w-0">
            <p className="text-lg md:text-xl font-bold text-white/90 break-words">
              {info.label}
            </p>
            <p className="text-xs text-zinc-600 mt-1 font-medium uppercase tracking-wider">
              Air Quality Index
            </p>
          </div>
        </div>

        {updatedAt && (
          <p className="mt-8 text-[11px] text-zinc-600 font-medium">
            Updated{" "}
            {new Date(updatedAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" · Data from OpenAQ"}
          </p>
        )}
      </div>
    </section>
  );
}
