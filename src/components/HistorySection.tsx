import type { AirQualityHistory } from "@/lib/types";

interface Props {
  history: AirQualityHistory[];
}

export function HistorySection({ history }: Props) {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-6 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-500 border-b border-[#1e1e1e]">
              <th className="pb-3 font-semibold text-xs uppercase tracking-wider">Time</th>
              <th className="pb-3 font-semibold text-xs uppercase tracking-wider">AQI</th>
              <th className="pb-3 font-semibold text-xs uppercase tracking-wider">PM2.5</th>
              <th className="pb-3 font-semibold text-xs uppercase tracking-wider">PM10</th>
            </tr>
          </thead>
          <tbody>
            {history.slice(-12).reverse().map((h) => (
              <tr key={h.id} className="border-b border-[#1e1e1e]/50">
                <td className="py-3 text-neutral-500 text-[13px]">
                  {new Date(h.recorded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="py-3 font-bold text-white text-[13px]">{h.aqi ?? "—"}</td>
                <td className="py-3 text-neutral-300 text-[13px]">{h.pm25 ?? "—"}</td>
                <td className="py-3 text-neutral-300 text-[13px]">{h.pm10 ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
