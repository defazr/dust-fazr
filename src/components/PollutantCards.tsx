interface Props {
  pm25: number | null;
  pm10: number | null;
  o3: number | null;
}

function getLevel(param: string, value: number | null): { label: string; color: string } {
  if (value === null) return { label: "N/A", color: "#404040" };
  if (param === "pm25") {
    if (value <= 12) return { label: "Good", color: "#22c55e" };
    if (value <= 35.4) return { label: "Moderate", color: "#eab308" };
    if (value <= 55.4) return { label: "Sensitive", color: "#f97316" };
    if (value <= 150.4) return { label: "Unhealthy", color: "#ef4444" };
    return { label: "Hazardous", color: "#dc2626" };
  }
  if (param === "pm10") {
    if (value <= 54) return { label: "Good", color: "#22c55e" };
    if (value <= 154) return { label: "Moderate", color: "#eab308" };
    if (value <= 254) return { label: "Sensitive", color: "#f97316" };
    return { label: "Unhealthy", color: "#ef4444" };
  }
  return { label: "—", color: "#404040" };
}

function Card({ label, param, value, unit }: { label: string; param: string; value: number | null; unit: string }) {
  const level = getLevel(param, value);
  return (
    <div className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-4 md:p-6 overflow-hidden shadow-sm shadow-black/10 hover:bg-[#161616] hover:border-zinc-700 transition-all duration-200">
      <div className="flex items-center justify-between mb-3 md:mb-4 gap-2">
        <p className="text-xs md:text-sm font-semibold text-zinc-400">{label}</p>
        <span
          className="text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full truncate"
          style={{ backgroundColor: `${level.color}15`, color: level.color }}
        >
          {level.label}
        </span>
      </div>
      <p className="text-3xl md:text-[48px] font-black text-white tracking-tight leading-none truncate">
        {value !== null ? value : "—"}
      </p>
      <p className="text-[10px] md:text-xs text-zinc-600 mt-2 font-medium">{unit}</p>
    </div>
  );
}

export function PollutantCards({ pm25, pm10, o3 }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4">
      <Card label="PM2.5" param="pm25" value={pm25} unit="µg/m³" />
      <Card label="PM10" param="pm10" value={pm10} unit="µg/m³" />
      <Card label="O₃" param="o3" value={o3} unit="ppm" />
    </div>
  );
}
