"use client";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function TrackClick({
  category,
  label,
  children,
}: {
  category: string;
  label: string;
  children: React.ReactNode;
}) {
  const handleClick = () => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "cta_click", {
        event_category: category,
        event_label: label,
      });
    }
  };

  return (
    <span onClick={handleClick} className="contents">
      {children}
    </span>
  );
}
