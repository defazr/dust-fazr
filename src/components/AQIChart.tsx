"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { AirQualityHistory } from "@/lib/types";

interface Props {
  history: AirQualityHistory[];
}

export function AQIChart({ history }: Props) {
  if (history.length === 0) {
    return (
      <div className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-6">
        <p className="text-neutral-600 text-sm">Trend data will appear after multiple collection cycles.</p>
      </div>
    );
  }

  const chartData = history.map((h) => ({
    time: new Date(h.recorded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    AQI: h.aqi ?? 0,
    "PM2.5": h.pm25 ?? 0,
  }));

  return (
    <div className="rounded-2xl bg-[#121212] border border-[#1e1e1e] p-6">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
          <XAxis dataKey="time" fontSize={11} tick={{ fill: "#525252" }} axisLine={{ stroke: "#1e1e1e" }} tickLine={false} />
          <YAxis fontSize={11} tick={{ fill: "#525252" }} axisLine={{ stroke: "#1e1e1e" }} tickLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #2a2a2a",
              backgroundColor: "#0a0a0a",
              color: "#fafafa",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              fontSize: "13px",
            }}
            labelStyle={{ color: "#737373" }}
          />
          <Line type="monotone" dataKey="AQI" stroke="#ef4444" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="PM2.5" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
