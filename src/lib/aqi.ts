export type AqiLevel = "good" | "moderate" | "unhealthy-sensitive" | "unhealthy" | "very-unhealthy" | "hazardous";

interface AqiInfo {
  level: AqiLevel;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  description: string;
}

const AQI_LEVELS: { max: number; info: AqiInfo }[] = [
  {
    max: 50,
    info: {
      level: "good",
      label: "Good",
      color: "#22c55e",
      bgColor: "bg-green-500",
      textColor: "text-green-500",
      description: "Air quality is satisfactory.",
    },
  },
  {
    max: 100,
    info: {
      level: "moderate",
      label: "Moderate",
      color: "#eab308",
      bgColor: "bg-yellow-500",
      textColor: "text-yellow-500",
      description: "Air quality is acceptable.",
    },
  },
  {
    max: 150,
    info: {
      level: "unhealthy-sensitive",
      label: "Unhealthy for Sensitive Groups",
      color: "#f97316",
      bgColor: "bg-orange-500",
      textColor: "text-orange-500",
      description: "Sensitive groups may experience health effects.",
    },
  },
  {
    max: 200,
    info: {
      level: "unhealthy",
      label: "Unhealthy",
      color: "#ef4444",
      bgColor: "bg-red-500",
      textColor: "text-red-500",
      description: "Everyone may begin to experience health effects.",
    },
  },
  {
    max: 300,
    info: {
      level: "very-unhealthy",
      label: "Very Unhealthy",
      color: "#a855f7",
      bgColor: "bg-purple-500",
      textColor: "text-purple-500",
      description: "Health alert: everyone may experience serious health effects.",
    },
  },
  {
    max: 500,
    info: {
      level: "hazardous",
      label: "Hazardous",
      color: "#991b1b",
      bgColor: "bg-red-900",
      textColor: "text-red-900",
      description: "Health warning of emergency conditions.",
    },
  },
];

export function getAqiInfo(aqi: number | null): AqiInfo {
  if (aqi === null) {
    return {
      level: "good",
      label: "No Data",
      color: "#9ca3af",
      bgColor: "bg-gray-400",
      textColor: "text-gray-400",
      description: "Data updating.",
    };
  }
  for (const { max, info } of AQI_LEVELS) {
    if (aqi <= max) return info;
  }
  return AQI_LEVELS[AQI_LEVELS.length - 1].info;
}
